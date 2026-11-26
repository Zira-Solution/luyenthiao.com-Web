import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { queryKeys } from '@/lib/query-keys'
import { PrivateDataCleanup } from '@/providers/private-data-cleanup'
import { useAuthStore } from '@/store/auth-store'
import type { User } from '@/types/auth'

const userA = { id: 1, username: 'a' } as unknown as User
const userB = { id: 2, username: 'b' } as unknown as User

function Probe(): React.ReactElement {
  const { data } = useQuery({
    queryKey: queryKeys.tasks(),
    queryFn: () => Promise.resolve(String(useAuthStore.getState().user?.id ?? 'none')),
    staleTime: Infinity,
  })
  return <p>{data ? `user:${data}` : 'loading'}</p>
}

function setup(): QueryClient {
  const client = new QueryClient()
  client.setQueryData(queryKeys.tasks(), ['private'])
  client.setQueryData(['public-thing'], ['public'])
  render(
    <QueryClientProvider client={client}>
      <PrivateDataCleanup />
    </QueryClientProvider>,
  )
  return client
}

describe('PrivateDataCleanup', () => {
  beforeEach(() => {
    act(() => useAuthStore.getState().setSession('token-a', userA))
  })
  afterEach(() => {
    cleanup()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle', signedOut: false })
  })

  it('removes private queries when the session ends', () => {
    const client = setup()
    act(() => useAuthStore.getState().clearSession('logout'))
    expect(client.getQueryData(queryKeys.tasks())).toBeUndefined()
    expect(client.getQueryData(['public-thing'])).toEqual(['public'])
  })

  it('resets private queries when another user signs in', () => {
    const client = setup()
    act(() => useAuthStore.getState().setSession('token-b', userB))
    expect(client.getQueryData(queryKeys.tasks())).toBeUndefined()
  })

  it('removes private queries when clearSession has no reason', () => {
    const client = setup()
    act(() => useAuthStore.getState().clearSession())
    expect(client.getQueryData(queryKeys.tasks())).toBeUndefined()
  })

  it('refetches mounted private queries with the new user after a switch', async () => {
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <PrivateDataCleanup />
        <Probe />
      </QueryClientProvider>,
    )
    expect(await screen.findByText('user:1')).toBeTruthy()
    act(() => useAuthStore.getState().setSession('token-b', userB))
    expect(await screen.findByText('user:2')).toBeTruthy()
    expect(screen.queryByText('user:1')).toBeNull()
  })

  it('keeps private queries when the same user refreshes the token', () => {
    const client = setup()
    act(() => useAuthStore.getState().setSession('token-a2', userA))
    expect(client.getQueryData(queryKeys.tasks())).toEqual(['private'])
  })

  it('drops and resets admin queries when signing out or switching users', () => {
    const client = setup()
    client.setQueryData(queryKeys.adminExams(), [{ id: 'e1' }])

    act(() => useAuthStore.getState().setSession('token-b', userB))
    expect(client.getQueryData(queryKeys.adminExams())).toBeUndefined()

    client.setQueryData(queryKeys.adminExams(), [{ id: 'e2' }])
    act(() => useAuthStore.getState().clearSession('logout'))
    expect(client.getQueryData(queryKeys.adminExams())).toBeUndefined()
  })
})
