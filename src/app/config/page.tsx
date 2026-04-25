import ComingSoonCard from '@/components/ComingSoonCard'

export default function ConfigPage() {
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
