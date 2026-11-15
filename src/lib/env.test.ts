import { afterEach, describe, expect, it, vi } from "vitest"

/**
 * `env` is evaluated at module load, so every case re-imports the module with a fresh
 * `process.env`. Production with no env vars is the exact condition that broke the
 * 2026-11-15 deploy: the host had no variables set and `next build` failed while
 * collecting page data.
 */
async function loadEnv(vars: Record<string, string | undefined>) {
  vi.resetModules()
  vi.stubEnv("NODE_ENV", vars.NODE_ENV ?? "test")
  vi.stubEnv("NEXT_PUBLIC_APP_URL", vars.NEXT_PUBLIC_APP_URL ?? "")
  vi.stubEnv("NEXT_PUBLIC_API_URL", vars.NEXT_PUBLIC_API_URL ?? "")
  return (await import("./env")).env
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
  vi.restoreAllMocks()
})

describe("env", () => {
  it("never throws in production when no variables are set", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const env = await loadEnv({ NODE_ENV: "production" })
    expect(env.APP_URL).toBe("https://luyenthiao.com")
    expect(env.API_URL).toBeTruthy()
  })

  it("prefers the configured values and strips trailing slashes", async () => {
    const env = await loadEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://staging.luyenthiao.com/",
      NEXT_PUBLIC_API_URL: "https://api.luyenthiao.com/api//",
    })
    expect(env.APP_URL).toBe("https://staging.luyenthiao.com")
    expect(env.API_URL).toBe("https://api.luyenthiao.com/api")
  })

  it("falls back to localhost outside production", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const env = await loadEnv({ NODE_ENV: "development" })
    expect(env.APP_URL).toBe("http://localhost:3000")
    expect(env.API_URL).toBe("http://localhost:3005/api")
  })

  it("warns once when the API url is missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    await loadEnv({ NODE_ENV: "production" })
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain("NEXT_PUBLIC_API_URL")
  })
})
