import { createServerClient } from "@supabase/ssr"
import createIntlMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { routing } from "./i18n/routing"

const intl = createIntlMiddleware(routing)

/** /admin: refresh the Supabase session and require sign-in. */
async function admin(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user && !request.nextUrl.pathname.startsWith("/admin/login")) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.search = ""
    return NextResponse.redirect(url)
  }
  return response
}

export function middleware(request: NextRequest) {
  return request.nextUrl.pathname.startsWith("/admin") ? admin(request) : intl(request)
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
