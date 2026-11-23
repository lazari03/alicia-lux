"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"
import { blurData } from "@/lib/blur-data"
import { cn } from "@/lib/utils"

/**
 * next/image with an instant preview: bundled images get a tiny blurred
 * placeholder, uploaded images get a shimmer until they finish loading.
 * Use inside a positioned parent when `fill` is set.
 */
export function LuxImage({ src, alt, className, onLoad, ...props }: ImageProps) {
  const key = typeof src === "string" ? src : undefined
  const blur = key ? blurData[key] : undefined
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!blur && !loaded && <span aria-hidden className="skeleton absolute inset-0 rounded-none" />}
      <Image
        src={src}
        alt={alt}
        placeholder={blur ? "blur" : "empty"}
        blurDataURL={blur}
        className={cn(!blur && "transition-opacity duration-500", !blur && !loaded && "opacity-0", className)}
        onLoad={(e) => {
          setLoaded(true)
          onLoad?.(e)
        }}
        {...props}
      />
    </>
  )
}
