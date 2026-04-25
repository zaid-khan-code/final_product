'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Suggestion = {
  employee_id: string
  name: string
}

type Props = {
  initialSearch: string
  initialTab: string
  suggestions: Suggestion[]
}

export default function EmployeeDirectorySearch({ initialSearch, initialTab, suggestions }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)

  const filteredSuggestions = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) {
      return suggestions.slice(0, 6)
    }

    return suggestions
      .filter((item) => item.employee_id.toLowerCase().includes(value) || item.name.toLowerCase().includes(value))
      .slice(0, 6)
  }, [search, suggestions])

  const goToSearch = (value: string) => {
    const params = new URLSearchParams()
    if (value.trim()) {
      params.set('search', value.trim())
      params.set('tab', initialTab || 'personal')
    }

    const query = params.toString()
    router.replace(query ? `/employees?${query}` : '/employees')
  }

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: 14, color: 'var(--t3)' }} />
        <input
          className="input"
          style={{ paddingLeft: 32 }}
          placeholder="Search by employee ID or name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              goToSearch(search)
            }
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filteredSuggestions.map((item) => (
            <Button
              key={item.employee_id}
              variant="secondary"
              style={{ padding: '6px 10px' }}
              onClick={() => {
                setSearch(item.employee_id)
                goToSearch(item.employee_id)
              }}
            >
              <span className="mono">{item.employee_id}</span> {item.name}
            </Button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => goToSearch('')}>
            Clear
          </Button>
          <Button variant="primary" onClick={() => goToSearch(search)}>
            Search
          </Button>
        </div>
      </div>
    </Card>
  )
}
