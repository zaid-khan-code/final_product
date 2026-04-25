import ComingSoonCard from '@/components/ComingSoonCard'
import { getSessionUserFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ConfigPage() {
  const user = await getSessionUserFromCookies()
  if (!user?.is_super_admin) redirect('/launchpad')

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="pg-head">
        <div>
          <div className="pg-greet">System Config</div>
          <div className="pg-sub">Configuration surfaces are being migrated behind the new role guard flow.</div>
        </div>
      </div>

      <ComingSoonCard
        title="Configuration workspace"
        description="Lookup management and configuration authoring will be added after the core HCM dashboards complete the migration."
      />
    </div>
  )
}
