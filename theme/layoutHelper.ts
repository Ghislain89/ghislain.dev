// Prefix absolute public paths with the build base (e.g. /playwright/slides/ui/)
export function resolveAssetUrl(url?: string) {
  return url?.startsWith('/') ? import.meta.env.BASE_URL + url.slice(1) : url
}

export function backgroundStyle(image?: string) {
  if (!image)
    return {}
  if (['#', 'rgb', 'hsl'].some(v => image.startsWith(v)))
    return { background: image }
  return { background: `url("${resolveAssetUrl(image)}") center / cover no-repeat` }
}
