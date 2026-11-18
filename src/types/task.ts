/** A task on /tasks. */
export type TaskIcon =
  | "exam"
  | "trophy"
  | "writing"
  | "speaking"
  | "vocab"
  | "grammar"
  | "challenge"
  | "login"

export type TaskGroup = "daily" | "weekly" | "achievement" | "other"

export interface Task {
  id: number
  group: TaskGroup
  icon: TaskIcon
  title: string
  description: string
  progress: number
  target: number
  done: boolean
  claimed: boolean
  points: number
}
