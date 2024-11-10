//Arbiti_Service_Worker_Identifier_Comment_Do_Not_Modify_Or_Use_In_Your_Code

// .yalc/@arbiti/core/dist/env.js
var common = {
  WEBSITE_URL: "https://arbiti.com",
  API_VERSION: "v1"
};
var env = false ? {
  ...common,
  API_ENDPOINT: "https://api.arbiti.com"
} : {
  ...common,
  API_ENDPOINT: "https://api-dev.arbiti.com"
};

// src/env.ts
var common2 = {};
var env2 = "development" === "production" ? { ...common2, ...env } : { ...common2, ...env };

// src/arbitiServiceWorker.ts
var dbPromise = indexedDB.open("Arbiti", 1);
dbPromise.onupgradeneeded = (event) => {
  const db = event.target.result;
  if (!db.objectStoreNames.contains("appUuidStore")) {
    db.createObjectStore("appUuidStore", { keyPath: "id" });
  }
};
function saveAppUuid(uuid) {
  const dbRequest = indexedDB.open("Arbiti", 1);
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction("appUuidStore", "readwrite");
    const store = transaction.objectStore("appUuidStore");
    store.put({ id: "appUuid", value: uuid });
  };
}
async function getAppUuid() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open("Arbiti", 1);
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("appUuidStore", "readonly");
      const store = transaction.objectStore("appUuidStore");
      const getRequest = store.get("appUuid");
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.value);
      };
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };
    dbRequest.onerror = () => {
      reject(dbRequest.error);
    };
  });
}
var sw = self;
function sendMessage(message, level) {
  return sw.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "log",
        level,
        message
      });
    });
  });
}
sw.addEventListener("message", (event) => {
  sendMessage("Received message", "info");
  const data = event.data;
  if (data.type === "init") {
    saveAppUuid(data.appUuid);
  }
});
sw.addEventListener("push", async (event) => {
  sendMessage("Received push notification", "info");
  const data = event.data?.json();
  if (!data?.title || !data?.extraData?.notificationUuid) {
    await sendMessage("Invalid push notification data", "error");
    return;
  }
  await sw.registration.showNotification(data.title, {
    body: data.message,
    icon: data.icon,
    // @ts-ignore
    image: data.image,
    badge: data.badge,
    vibrate: data.vibrate,
    actions: data.actions,
    data: data.extraData,
    timestamp: data.timestamp,
    requireInteraction: data.requireInteraction,
    silent: data.silent,
    renotify: data.renotify,
    tag: data.tag,
    lang: data.lang,
    dir: data.dir
  });
  try {
    await fetch(
      `${env2.API_ENDPOINT}/${env2.API_VERSION}/notification/event`,
      {
        method: "POST",
        headers: {
          "x-app-uuid": await getAppUuid(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventType: "received",
          notificationUuid: data.extraData.notificationUuid
        })
      }
    );
  } catch {
    await sendMessage(
      "Failed to send notification received event",
      "error"
    );
  }
  await sendMessage(
    `Successfully showed push notification: ${data.title}`,
    "info"
  );
  await sw.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "event",
        event: "notificationShown",
        data: JSON.stringify({
          extraData: data.extradata,
          notification: {
            ...data,
            extraData: void 0
          }
        })
      });
    });
  });
});
sw.addEventListener("notificationclick", async (event) => {
  const data = event.notification.data;
  const url = new URL(data.url || sw.location.origin);
  const notificationUuid = data.notificationUuid;
  url.searchParams.append("notificationUuid", notificationUuid);
  event.waitUntil(sw.clients.openWindow(url.toString()));
  try {
    await fetch(
      `${env2.API_ENDPOINT}/${env2.API_VERSION}/notification/event`,
      {
        method: "POST",
        headers: {
          "x-app-uuid": await getAppUuid(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventType: "clicked",
          notificationUuid
        })
      }
    );
  } catch {
    await sendMessage("Failed to send notification clicked event", "error");
  }
});
sw.addEventListener("notificationclose", async (event) => {
  await fetch(`${env2.API_ENDPOINT}/${env2.API_VERSION}/notification/event`, {
    method: "POST",
    headers: {
      "x-app-uuid": await getAppUuid(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      eventType: "closed",
      notificationUuid: (
        // @ts-ignore
        event.notification.data.notificationUuid
      )
    })
  });
});
