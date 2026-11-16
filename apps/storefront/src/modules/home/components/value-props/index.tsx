const icon = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}

const props = [
  {
    title: "Illuminated mirror",
    body: "Soft light at the heart of your daily ritual.",
    icon: (
      <svg {...icon}>
        <rect x="5" y="3" width="14" height="18" rx="7" />
        <path d="M9.5 8.5c.6-1 1.5-1.6 2.5-1.6M12 1v.5M3 12h.5M20.5 12h.5" />
      </svg>
    ),
  },
  {
    title: "Considered compartments",
    body: "A place for jewelry and beauty essentials.",
    icon: (
      <svg {...icon}>
        <rect x="3" y="4" width="18" height="16" rx="1.5" />
        <path d="M3 10h18M3 15h18M10 4v6M15 15v5" />
      </svg>
    ),
  },
  {
    title: "Three signature finishes",
    body: "Coffee Brown, Champagne and Noir.",
    icon: (
      <svg {...icon}>
        <circle cx="8" cy="9" r="5" />
        <circle cx="16" cy="9" r="5" />
        <circle cx="12" cy="15" r="5" />
      </svg>
    ),
  },
  {
    title: "Beautiful, inside and out",
    body: "Soft textures and warm metallic accents.",
    icon: (
      <svg {...icon}>
        <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3zM19 16v4M17 18h4" />
      </svg>
    ),
  },
]

export default function ValueProps() {
  return (
    <section aria-label="Why Alicia Lux" className="border-b border-lux-line bg-lux-paper">
      <ul className="content-container grid grid-cols-2 gap-x-6 gap-y-9 py-10 small:grid-cols-4 small:py-12">
        {props.map((prop) => (
          <li key={prop.title} className="flex flex-col items-start gap-3 small:flex-row small:gap-4">
            <span className="text-lux-gold">{prop.icon}</span>
            <span>
              <span className="block text-[13px] font-medium uppercase tracking-[0.12em]">{prop.title}</span>
              <span className="mt-1 block text-[13px] leading-5 text-lux-muted">{prop.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
