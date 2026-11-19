/** In-app notification shown on /notifications. */
export type NotificationType = "result" | "challenge" | "reward" | "event" | "system"

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  /** ISO time; the view formats it with formatRelativeTimeVi. */
  createdAt: string
  read: boolean
}
