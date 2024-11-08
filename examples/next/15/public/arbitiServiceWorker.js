//Arbiti_Service_Worker_Identifier_Comment_Do_Not_Modify_Or_Use_In_Your_Code

// src/arbitiServiceWorker.ts
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
sw.addEventListener("push", async (event) => {
  sendMessage("Received push notification", "info");
  const data = event.data?.json();
  if (!data || !data.title) {
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
    data: data.data,
    timestamp: data.timestamp,
    requireInteraction: data.requireInteraction,
    silent: data.silent,
    renotify: data.renotify,
    tag: data.tag,
    lang: data.lang,
    dir: data.dir
  });
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
