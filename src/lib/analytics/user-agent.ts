/** Tiny, dependency-free UA classifier — enough for dashboard breakdowns. */
export function parseUserAgent(ua: string) {
  const device = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)
    ? "tablet"
    : /Mobi|iPhone|iPod|Android|BlackBerry|Opera Mini|IEMobile/i.test(ua)
      ? "mobile"
      : "desktop"

  const browser =
    /Edg(e|A|iOS)?\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /SamsungBrowser/.test(ua) ? "Samsung Internet"
    : /FxiOS|Firefox\//.test(ua) ? "Firefox"
    : /Instagram/.test(ua) ? "Instagram"
    : /FBAN|FBAV/.test(ua) ? "Facebook"
    : /TikTok|BytedanceWebview|musical_ly/i.test(ua) ? "TikTok"
    : /CriOS|Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : "Other"

  const os =
    /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS X|Macintosh/.test(ua) ? "macOS"
    : /CrOS/.test(ua) ? "ChromeOS"
    : /Linux/.test(ua) ? "Linux"
    : "Other"

  return { device, browser, os }
}
