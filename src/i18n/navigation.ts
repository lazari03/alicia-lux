import { createNavigation } from "next-intl/navigation"
import { routing } from "./routing"

/** Locale-aware Link / router — use these instead of next/link in the storefront. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
