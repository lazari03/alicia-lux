"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** True after hydration — guards UI that reads from localStorage (the cart). */
export const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false)
