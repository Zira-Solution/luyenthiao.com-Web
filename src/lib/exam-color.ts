const COLOR_NAMES: Record<string, string> = {
  "#ff0000": "Red",
  "#590165": "Purple",
  "#563201": "Brown",
  "#ff7e05": "Orange",
  "#0000ff": "Blue",
  "#00ff00": "Green",
  "#ffff00": "Yellow",
  "#ffc0cb": "Pink",
}

export function isColorCode(text: string | null | undefined): boolean {
  return Boolean(text && String(text).startsWith("#"))
}

export function getColorName(text: string | null | undefined): string {
  const key = (text ?? "").toLowerCase()
  return COLOR_NAMES[key] ?? text ?? ""
}