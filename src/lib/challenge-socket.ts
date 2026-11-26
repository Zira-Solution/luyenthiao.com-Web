import { io, type Socket } from 'socket.io-client'

import { env } from '@/lib/env'

export function getChallengeSocketOrigin(): string {
  return env.API_URL.replace(/\/api\/?$/, '')
}

let sharedSocket: Socket | null = null
let sharedToken: string | null = null

export function createChallengeSocket(token: string | null): Socket {
  const origin = getChallengeSocketOrigin()
  return io(`${origin}/challenge`, {
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
  })
}

/**
 * Shared Socket.IO client for /challenge across Lobby -> Room transitions so creating
 * a room and navigating to /challenges/room/[code] keeps the host socket unbroken.
 */
export function getSharedChallengeSocket(token: string | null): Socket {
  if (sharedSocket && sharedToken === token) {
    if (!sharedSocket.connected) sharedSocket.connect()
    return sharedSocket
  }
  if (sharedSocket) {
    sharedSocket.disconnect()
    sharedSocket = null
  }
  sharedToken = token
  sharedSocket = createChallengeSocket(token)
  return sharedSocket
}
