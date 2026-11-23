import { useTranslations } from "next-intl"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/shop/cart-drawer"
import { Pageviews } from "@/components/analytics/pageviews"

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("common")
  return (
    <div id="top">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-card focus:p-3">
        {t("skipToContent")}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
      <Pageviews />
    </div>
  )
}
