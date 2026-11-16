const SkeletonProductPreview = () => {
  return (
    <div className="lux-card animate-pulse">
      <div className="lux-card-media" />
      <div className="flex justify-between gap-4">
        <div className="h-4 w-2/5 rounded-full bg-lux-sand" />
        <div className="h-4 w-1/5 rounded-full bg-lux-sand" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
