import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  title?: string
}

/**
 * Swipeable scroll-snap strip on small screens, editorial grid on desktop.
 * Layout is pure CSS (`.lux-gallery`), so no client JavaScript is shipped.
 */
const ImageGallery = ({ images, title = "Product" }: ImageGalleryProps) => {
  const usable = images.filter((image) => !!image.url)

  if (!usable.length) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-[10px] bg-lux-sand text-lux-taupe">
        <PlaceholderImage size={32} />
      </div>
    )
  }

  return (
    <ul className="lux-gallery" aria-label={`${title} images`}>
      {usable.map((image, index) => (
        <li key={image.id} id={image.id}>
          <Image
            src={image.url}
            priority={index === 0}
            alt={`${title}, image ${index + 1} of ${usable.length}`}
            fill
            sizes="(min-width: 1024px) 56vw, 88vw"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  )
}

export default ImageGallery
