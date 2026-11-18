import { z } from 'zod'

// Production CSP has no 'unsafe-eval': zod must not probe or use `new Function`.
z.config({ jitless: true })

export { z }
