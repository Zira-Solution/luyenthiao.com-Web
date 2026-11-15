/** Daily task shown on /tasks (mock data until the backend provides it). */
export type TaskIcon =
  | "exam"
  | "trophy"
  | "writing"
  | "speaking"
  | "vocab"
  | "grammar"
  | "challenge"
  | "login"

export type TaskRewardType = "diamond" | "coin"

export interface Task {
  id: number
  icon: TaskIcon
  title: string
  description: string
  progress: number
  target: number
  done: boolean
  rewardType: TaskRewardType
  rewardValue: number
}
