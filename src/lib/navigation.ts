// Full page load on purpose: it drops the client router cache so the proxy sees the new hint cookie.
export function hardNavigate(path: string): void {
  window.location.replace(path)
}
