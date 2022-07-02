/**
 * Stolen from stackoverflow: https://stackoverflow.com/a/48161723
 *
 * Calculates the SHA-256 hash of the input string.
 */
export default async function (message: string) {
	// encode as UTF-8
	const msgBuffer = new TextEncoder().encode(message)

	// hash the message
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)

	// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer))

	// convert bytes to hex string
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
