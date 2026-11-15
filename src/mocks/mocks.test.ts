import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { notificationsMock } from "./notifications"
import { schoolRankingMock } from "./school-ranking"
import { speakingTestMock } from "./speaking"
import { tasksMock } from "./tasks"
import { writingTestMock } from "./writing"

import type { SpeakingPart } from "@/types/speaking"

const PUBLIC_DIR = path.resolve(import.meta.dirname, "..", "public")

function publicFileExists(src: string): boolean {
  return fs.existsSync(path.join(PUBLIC_DIR, src.replace(/^\//, "")))
}

describe("notificationsMock", () => {
  it("covers every notification type with unique ids", () => {
    const types = new Set(notificationsMock.map((n) => n.type))
    expect([...types].sort()).toEqual(["challenge", "event", "result", "reward", "system"])
    expect(new Set(notificationsMock.map((n) => n.id)).size).toBe(notificationsMock.length)
  })

  it("has both read and unread items", () => {
    expect(notificationsMock.some((n) => n.read)).toBe(true)
    expect(notificationsMock.some((n) => !n.read)).toBe(true)
  })
})

describe("tasksMock", () => {
  it("covers every icon and both reward types with unique ids", () => {
    expect(new Set(tasksMock.map((t) => t.icon)).size).toBe(8)
    expect(new Set(tasksMock.map((t) => t.rewardType))).toEqual(new Set(["diamond", "coin"]))
    expect(new Set(tasksMock.map((t) => t.id)).size).toBe(tasksMock.length)
  })

  it("marks a task done exactly when progress reaches target", () => {
    for (const t of tasksMock) {
      expect(t.done).toBe(t.progress >= t.target)
      expect(t.progress).toBeLessThanOrEqual(t.target)
    }
    expect(tasksMock.some((t) => t.done)).toBe(true)
  })
})

describe("schoolRankingMock", () => {
  it("ranks 1..n with scores strictly descending", () => {
    schoolRankingMock.forEach((s, i) => expect(s.rank).toBe(i + 1))
    for (let i = 1; i < schoolRankingMock.length; i++) {
      const prev = schoolRankingMock[i - 1]
      const cur = schoolRankingMock[i]
      expect(prev && cur && prev.score > cur.score).toBe(true)
    }
  })
})

describe("speakingTestMock", () => {
  // `satisfies` keeps narrow literal types; widen to the declared type before reading optional fields.
  const parts: SpeakingPart[] = speakingTestMock.attempt.parts
  const questions = parts.flatMap((p) => p.questions)

  it("uses the neutral demo ids", () => {
    expect(speakingTestMock.id).toBe("speaking-demo-1")
    expect(speakingTestMock.attempt.id).toBe("speaking-demo-1-attempt")
  })

  it("covers all six question kinds with unique ids", () => {
    expect(new Set(questions.map((q) => q.kind))).toEqual(
      new Set(["scene-mark", "choose-object", "drag-object", "mic-answer", "mic-zoom", "mic-plain"]),
    )
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length)
  })

  it("has consistent answer keys", () => {
    for (const q of questions) {
      if (q.kind === "scene-mark") {
        expect(q.scene?.some((s) => s.id === q.correctSlotId)).toBe(true)
      }
      if (q.kind === "choose-object") {
        expect(q.choices?.filter((c) => c.correct).length).toBe(1)
      }
      if (q.kind === "drag-object") {
        expect(q.palette?.some((p) => p.id === q.correctDraggableId)).toBe(true)
        expect(q.scene?.some((s) => s.id === q.correctTargetId)).toBe(true)
      }
      if (q.kind === "mic-answer") {
        expect(q.pointer).toBeDefined()
      }
      if (q.kind === "mic-zoom") {
        expect(q.cards?.length).toBe(4)
        expect(q.cards?.some((c) => c.src === q.zoomCard)).toBe(true)
      }
    }
  })

  it("keeps every scene slot inside the picture", () => {
    for (const s of questions.flatMap((q) => q.scene ?? [])) {
      expect(s.left + s.width).toBeLessThanOrEqual(100)
      expect(s.top + s.height).toBeLessThanOrEqual(100)
    }
  })

  it("references only images that exist in public/", () => {
    const srcs = questions.flatMap((q) => [
      q.sceneBg,
      q.zoomCard,
      ...(q.scene ?? []).map((s) => s.src),
      ...(q.choices ?? []).map((c) => c.src),
      ...(q.palette ?? []).map((p) => p.src),
      ...(q.cards ?? []).map((c) => c.src),
    ])
    for (const src of srcs.filter((s): s is string => Boolean(s))) {
      expect(publicFileExists(src), src).toBe(true)
    }
  })
})

describe("writingTestMock", () => {
  it("uses the neutral demo ids and three story images that exist", () => {
    expect(writingTestMock.id).toBe("writing-demo-1")
    expect(writingTestMock.attempt.id).toBe("writing-demo-1-attempt")
    const images = writingTestMock.attempt.prompt.images
    expect(images.map((i) => i.slot)).toEqual(["story-img-1", "story-img-2", "story-img-3"])
    for (const img of images) {
      expect(img.src && publicFileExists(img.src), String(img.src)).toBe(true)
    }
  })

  it("keeps the score within the maximum", () => {
    const { score, maxScore } = writingTestMock.attempt
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(maxScore)
  })
})
