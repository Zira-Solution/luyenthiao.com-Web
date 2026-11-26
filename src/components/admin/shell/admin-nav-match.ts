/** True when the pathname matches the nav item (or a nested route when exact is false). */
export function isAdminNavActive(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
