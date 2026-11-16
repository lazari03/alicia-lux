import { clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string | null }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  /** Describe the product; leave empty when a visible title sits next to it. */
  alt?: string
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  alt = "",
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url || undefined

  return (
    <div
      className={clx(
        "relative w-full overflow-hidden rounded-[8px] bg-lux-sand",
        className,
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[4/5]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      {initialImage ? (
        <Image
          src={initialImage}
          alt={alt}
          className="absolute inset-0 object-cover object-center"
          draggable={false}
          quality={60}
          sizes={
            size === "full"
              ? "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
              : "(max-width: 576px) 180px, 440px"
          }
          fill
        />
      ) : (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center text-lux-taupe">
          <PlaceholderImage size={size === "small" ? 16 : 24} />
        </div>
      )}
    </div>
  )
}

export default Thumbnail
