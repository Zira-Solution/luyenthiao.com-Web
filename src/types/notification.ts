/** In-app notification shown on /notifications (mock data until the backend provides it). */
export type NotificationType = "result" | "challenge" | "reward" | "event" | "system"

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  /** Relative time label shown as-is, e.g. "5 phút trước". */
  time: string
  read: boolean
}
