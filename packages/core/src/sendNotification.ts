import { env } from "./env";

type LanguageCode =
	| "aa"
	| "ab"
	| "ae"
	| "af"
	| "ak"
	| "am"
	| "an"
	| "ar"
	| "as"
	| "av"
	| "ay"
	| "az"
	| "ba"
	| "be"
	| "bg"
	| "bh"
	| "bi"
	| "bm"
	| "bn"
	| "bo"
	| "br"
	| "bs"
	| "ca"
	| "ce"
	| "ch"
	| "co"
	| "cr"
	| "cs"
	| "cu"
	| "cv"
	| "cy"
	| "da"
	| "de"
	| "dv"
	| "dz"
	| "ee"
	| "el"
	| "en"
	| "eo"
	| "es"
	| "et"
	| "eu"
	| "fa"
	| "ff"
	| "fi"
	| "fj"
	| "fo"
	| "fr"
	| "fy"
	| "ga"
	| "gd"
	| "gl"
	| "gn"
	| "gu"
	| "gv"
	| "ha"
	| "he"
	| "hi"
	| "ho"
	| "hr"
	| "ht"
	| "hu"
	| "hy"
	| "hz"
	| "ia"
	| "id"
	| "ie"
	| "ig"
	| "ii"
	| "ik"
	| "io"
	| "is"
	| "it"
	| "iu"
	| "ja"
	| "jv"
	| "ka"
	| "kg"
	| "ki"
	| "kj"
	| "kk"
	| "kl"
	| "km"
	| "kn"
	| "ko"
	| "kr"
	| "ks"
	| "ku"
	| "kv"
	| "kw"
	| "ky"
	| "la"
	| "lb"
	| "lg"
	| "li"
	| "ln"
	| "lo"
	| "lt"
	| "lu"
	| "lv"
	| "mg"
	| "mh"
	| "mi"
	| "mk"
	| "ml"
	| "mn"
	| "mr"
	| "ms"
	| "mt"
	| "my"
	| "na"
	| "nb"
	| "nd"
	| "ne"
	| "ng"
	| "nl"
	| "nn"
	| "no"
	| "nr"
	| "nv"
	| "ny"
	| "oc"
	| "oj"
	| "om"
	| "or"
	| "os"
	| "pa"
	| "pi"
	| "pl"
	| "ps"
	| "pt"
	| "qu"
	| "rm"
	| "rn"
	| "ro"
	| "ru"
	| "rw"
	| "sa"
	| "sc"
	| "sd"
	| "se"
	| "sg"
	| "si"
	| "sk"
	| "sl"
	| "sm"
	| "sn"
	| "so"
	| "sq"
	| "sr"
	| "ss"
	| "st"
	| "su"
	| "sv"
	| "sw"
	| "ta"
	| "te"
	| "tg"
	| "th"
	| "ti"
	| "tk"
	| "tl"
	| "tn"
	| "to"
	| "tr"
	| "ts"
	| "tt"
	| "tw"
	| "ty"
	| "ug"
	| "uk"
	| "ur"
	| "uz"
	| "ve"
	| "vi"
	| "vo"
	| "wa"
	| "wo"
	| "xh"
	| "yi"
	| "yo"
	| "za"
	| "zh"
	| "zu";

export type SendNotification = {
	/** The title of the notification. This is the first thing users will see */
	title: string;
	/** The message of the notification users see when they expand it */
	message: string;
	/** The URL to open when the user clicks the notification. Defaults to the root of your website */
	url?: string;
	/** URL of the image used to represent the notification when there isn't enough space to display the notification itself */
	badge?: string;
	/** Arbitrary data you may want to send together with the notification.
	 * You'll be able to access this data on the 'notificationReceived' event
	 */
	extraData?: Record<string, any>;
	/** The direction in which to display the notification. Most browsers ignore this setting */
	dir?: "auto" | "ltr" | "rtl";
	/** URL of an image to be displayed together with the notification as an icon. This is usually your logo */
	icon?: string;
	/** The notification's language. Must be a language tag according to {@link https://www.sitepoint.com/iso-2-letter-language-codes/|RFC 5646} */
	lang?: LanguageCode;
	/** Whether the user should be notified after a new notification replaces an old one */
	renotify?: boolean;
	/** If set to 'true', the notification should remain active until the user clicks or dismisses it, rather than closing automatically */
	requireInteraction?: boolean;
	/** Whether the notification is silent (no sounds or vibrations issued), regardless of the device settings.
	 * If set to 'auto' will be set based on the device's settings
	 **/
	silent?: boolean | "auto";
	/**
	 * The {@link https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API#vibration_patterns |vibration pattern} to use. The pattern is an array of numbers that describe a
	 * vibration pattern where the even indices (0, 2, 4, etc.) are the vibration time in
	 * milliseconds and the odd indices are the pause time in milliseconds.
	 */
	vibration?: number | number[];
	/**
	 * The UUID of the app to send notifications to
	 */
	appUuid: string;
	/** The API key associated with your app */
	apiKey: string;
	/**
	 * If topic is provided we'll send a message to everyone subscribed to these topics.
	 * At least one of 'topic', 'userId' or 'browserUuid' must be provided
	 * */
	topic?: string | string[];
	/**
	 * If userId is provided we'll send a message to the users with these userIds.
	 * At least one of 'topic', 'userId' or 'browserUuid' must be provided
	 * */
	userId?: string | string[];
	/**
	 * If browserUuid is provided we'll send a message to the users with these browserUuids.
	 * At least one of 'topic', 'userId' or 'browserUuid' must be provided
	 */
	browserUuid?: string | string[];
	// TODO: Add support for natural language date strings
	/**
	 * The time to send the notification. If not provided, the notification will be sent immediately
	 */
	sendAt?: string | number;
};

export async function sendNotification({
	title,
	message,
	badge,
	extraData,
	dir,
	icon,
	lang,
	renotify,
	requireInteraction,
	silent,
	vibration,
	appUuid,
	topic,
	userId,
	browserUuid,
	apiKey,
	url,
}: SendNotification): Promise<{
	error?:
		| "ClientError"
		| "InternalError"
		| "MissingRequiredField"
		| "NotFound"
		| "MethodNotAllowed";
	message: "string";
}> {
	return (
		await fetch(`${env.API_ENDPOINT}/${env.API_VERSION}/notification`, {
			method: "POST",
			headers: {
				"x-api-key": apiKey,
				"x-app-uuid": appUuid,
			},
			body: JSON.stringify({
				notification: {
					title,
					message,
					badge,
					extraData: {
						...extraData,
					},
					url,
					dir,
					icon,
					lang,
					renotify,
					requireInteraction,
					silent,
					vibration,
				},
				topic,
				userId,
				browserUuid,
			}),
		})
	).json();
}
