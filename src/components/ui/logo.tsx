import Image from "next/image"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  const t = useTranslations("common")
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 sm:gap-3.5", className)} aria-label={t("home")}>
      <Image
        src="/images/alicia-lux-mark.png"
        alt=""
        width={44}
        height={44}
        priority
        className={cn("h-auto w-7 transition-transform duration-700 ease-lux hover:-rotate-6 sm:w-9", light && "brightness-0 invert-[.91] sepia-[.15]")}
      />
      <span className="font-serif text-[19px] font-medium uppercase leading-none tracking-[0.2em] whitespace-nowrap sm:text-2xl">
        Alicia Lux
      </span>
    </Link>
  )
}
