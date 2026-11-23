import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/shop/cart-drawer"

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="top">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-card focus:p-3">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
