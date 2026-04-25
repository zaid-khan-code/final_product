'use client'

import { Card } from '@/components/ui/Card'

type ChartPoint = {
  month: string
  attendance_count?: number
  headcount?: number
}

type Props = {
  attendance: ChartPoint[]
  headcount: ChartPoint[]
}

const getPeak = (values: number[]) => Math.max(...values, 1)

function MiniBarChart({
  title,
  points,
  accessor,
  tone,
}: {
  title: string
  points: ChartPoint[]
  accessor: (point: ChartPoint) => number
  tone: 'attendance' | 'headcount'
}) {
  const values = points.map(accessor)
  const peak = getPeak(values)

  return (
    <Card>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(points.length, 1)}, minmax(0, 1fr))`, gap: 10, alignItems: 'end' }}>
        {points.map((point) => {
          const value = accessor(point)
          const height = `${Math.max((value / peak) * 100, value > 0 ? 12 : 4)}%`
          return (
            <div key={`${tone}-${point.month}`} style={{ display: 'grid', gap: 8 }}>
              <div style={{ height: 140, display: 'flex', alignItems: 'flex-end' }}>
                <div
                  style={{
                    width: '100%',
                    height,
                    minHeight: 4,
                    borderRadius: 'var(--radius-sm)',
                    background: tone === 'attendance' ? 'var(--p2)' : 'var(--teal)',
                  }}
                  title={`${point.month}: ${value}`}
                />
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)', textAlign: 'center' }}>
                {point.month.slice(5)}
              </div>
              <div style={{ textAlign: 'center', fontWeight: 800 }}>{value}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function DashboardCharts({ attendance, headcount }: Props) {
  return (
    <div className="section-grid-2">
      <MiniBarChart title="Attendance Trend" points={attendance} accessor={(point) => point.attendance_count ?? 0} tone="attendance" />
      <MiniBarChart title="Headcount Trend" points={headcount} accessor={(point) => point.headcount ?? 0} tone="headcount" />
    </div>
  )
}
