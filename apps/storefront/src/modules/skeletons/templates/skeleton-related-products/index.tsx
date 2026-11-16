import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div>
      <div className="mb-10 flex animate-pulse flex-col gap-4 small:mb-14">
        <div className="h-3 w-32 rounded-full bg-lux-sand" />
        <div className="h-10 w-72 max-w-full rounded-full bg-lux-sand" />
      </div>
      <ul className="lux-rail">
        {repeat(4).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
