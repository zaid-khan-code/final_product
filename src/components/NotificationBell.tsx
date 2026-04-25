'use client'

import { useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mutateJson } from '@/lib/mutations'
import { apiFetch } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { useToast } from '@/contexts/ToastContext'

type NotificationItem = {
  id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
  created_by_email?: string | null
}

type NotificationResponse = {
  unread_count: number
  items: NotificationItem[]
}

type Props = {
  initialData: NotificationResponse
}

const queryKey = ['notifications', 'me']

export default function NotificationBell({ initialData }: Props) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const notificationsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await apiFetch<NotificationResponse>('/proxy/notifications?scope=me')
      if (!result.ok) {
        throw new Error(result.error)
      }
      return result.data
    },
    initialData,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => mutateJson(`/proxy/notifications/${id}/read`, { method: 'PATCH', body: {} }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<NotificationResponse>(queryKey)

      queryClient.setQueryData<NotificationResponse>(queryKey, (current) => {
        if (!current) return current

        const nextItems = current.items.map((item) => (item.id === id ? { ...item, is_read: true } : item))
        const unreadCount = nextItems.filter((item) => !item.is_read).length
        return { unread_count: unreadCount, items: nextItems }
      })

      return { previous }
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      showToast(error instanceof Error ? error.message : 'Unable to update notification.', 'error')
    },
    onSuccess: () => {
      showToast('Notification marked as read.', 'success')
    },
  })

  const unreadCount = notificationsQuery.data?.unread_count ?? 0
  const items = useMemo(() => notificationsQuery.data?.items ?? [], [notificationsQuery.data])

  return (
    <div style={{ position: 'relative' }}>
      <Button variant="secondary" onClick={() => setOpen((value) => !value)}>
        <Bell size={14} />
        Notifications
        {unreadCount > 0 ? <Pill tone="info">{unreadCount}</Pill> : null}
      </Button>

      {open ? (
        <Card style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 360, zIndex: 20, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
            <div style={{ fontWeight: 900 }}>Notification Feed</div>
            <Pill tone={unreadCount > 0 ? 'warning' : 'neutral'}>{unreadCount} unread</Pill>
          </div>

          {items.length === 0 ? (
            <div style={{ color: 'var(--t3)', fontSize: 12 }}>No notifications right now.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={item.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12, display: 'grid', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontWeight: 800 }}>{item.type}</div>
                    <Pill tone={item.is_read ? 'neutral' : 'warning'}>{item.is_read ? 'Read' : 'Unread'}</Pill>
                  </div>
                  <div style={{ color: 'var(--t2)', lineHeight: 1.4 }}>{item.message}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    {new Date(item.created_at).toLocaleString('en-PK')}
                    {item.created_by_email ? ` • ${item.created_by_email}` : ''}
                  </div>
                  {!item.is_read ? (
                    <div>
                      <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(item.id)}>
                        Mark Read
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  )
}
