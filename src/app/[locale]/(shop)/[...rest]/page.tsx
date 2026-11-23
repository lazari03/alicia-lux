import { notFound } from "next/navigation"

/** Any unknown URL renders the translated 404 inside the shop layout. */
export default function CatchAll() {
  notFound()
}
