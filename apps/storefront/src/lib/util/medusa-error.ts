/**
 * Normalises errors thrown by the Medusa JS SDK (FetchError) and legacy
 * axios-shaped errors into a single readable Error. Never leaks request
 * internals to the shopper.
 */
export default function medusaError(error: any): never {
  const raw =
    error?.response?.data?.message ??
    (typeof error?.response?.data === "string" ? error.response.data : undefined) ??
    error?.message ??
    "Something went wrong. Please try again."

  if (error?.status || error?.response?.status) {
    console.error("Medusa request failed:", error?.status ?? error?.response?.status, raw)
  }

  const message = String(raw).trim()
  throw new Error(
    message.charAt(0).toUpperCase() + message.slice(1) + (/[.!?]$/.test(message) ? "" : ".")
  )
}
