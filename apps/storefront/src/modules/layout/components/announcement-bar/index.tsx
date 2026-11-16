const messages = [
  "A beautiful home for the things you treasure",
  "One signature · Three finishes",
  "Illuminated mirror · Considered compartments",
  "Objects for the everyday extraordinary",
]

/**
 * Slim marquee above the header. The track is rendered twice so the
 * CSS animation can loop seamlessly; the copy is announced once.
 */
export default function AnnouncementBar() {
  return (
    <div className="overflow-hidden bg-lux-ink text-lux-paper" role="region" aria-label="Announcements">
      <p className="sr-only">{messages.join(". ")}</p>
      <div className="lux-marquee py-2.5" aria-hidden="true">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {messages.map((message) => (
              <li
                key={message}
                className="flex items-center whitespace-nowrap text-[10.5px] font-medium uppercase tracking-[0.22em]"
              >
                <span className="px-8">{message}</span>
                <span className="h-1 w-1 rounded-full bg-lux-gold-soft" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
