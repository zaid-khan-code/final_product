"use client";
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { formatPKR } from '@/data/dummyData';
import { AlertTriangle, Plus, Check, X, Search, Shield } from 'lucide-react';
import Modal from '@/components/Modal';
import { useToastContext } from '@/contexts/ToastContext';

type Penalty = {
  id: string; empId: string; empName: string; dept: string;
  date: string; type: string; reason: string; amount: number;
  status: 'Proposed' | 'HO Approved' | 'Applied' | 'Waived' | 'Rejected';
  appliedBy: string; waivedReason?: string;
};

const PENALTY_TYPES = [
  { label: 'Late Arrival (15–30 min)', amount: 200 },
  { label: 'Late Arrival (30–60 min)', amount: 500 },
  { label: 'Late Arrival (>60 min)', amount: 1000 },
  { label: 'Early Leave (without approval)', amount: 1000 },
  { label: 'Unmarked Absence', amount: 2500 },
  { label: 'Policy Violation', amount: 500 },
  { label: 'Custom', amount: 0 },
];

const INIT_PENALTIES: Penalty[] = [
  { id: 'PA001', empId: 'EMP001', empName: 'Ahmed Ali',    dept: 'Engineering', date: '2026-03-24', type: 'Late Arrival (30–60 min)',        reason: 'Arrived 45 min late (10:45 AM)',         amount: 500,  status: 'Applied',    appliedBy: 'System' },
  { id: 'PA002', empId: 'EMP003', empName: 'Ali Hassan',   dept: 'Sales',       date: '2026-03-22', type: 'Unmarked Absence',                  reason: 'No leave applied, no attendance',        amount: 2500, status: 'Proposed',   appliedBy: 'HR Admin' },
  { id: 'PA003', empId: 'EMP002', empName: 'Sara Khan',    dept: 'Marketing',   date: '2026-03-20', type: 'Policy Violation',                  reason: 'Dress code non-compliance',              amount: 500,  status: 'HO Approved', appliedBy: 'HR Admin' },
  { id: 'PA004', empId: 'EMP001', empName: 'Ahmed Ali',    dept: 'Engineering', date: '2026-02-18', type: 'Late Arrival (15–30 min)',           reason: 'Arrived 20 min late due to traffic',     amount: 200,  status: 'Waived',     appliedBy: 'System', waivedReason: 'First offence — warning issued' },
  { id: 'PA005', empId: 'EMP005', empName: 'Bilal Ahmed',  dept: 'HR',          date: '2026-03-15', type: 'Early Leave (without approval)',     reason: 'Left 2 hrs early without informing',     amount: 1000, status: 'Proposed',   appliedBy: 'HR Admin' },
];

const statusColor: Record<string, string> = {
  Proposed: 'pill-amber', 'HO Approved': 'pill-blue', Applied: 'pill-red', Waived: 'pill-green', Rejected: 'pill-steel',
};

export default function PenaltiesAdminPage() {
  const { employees, departments } = useData();
  const { showToast } = useToastContext();
  const [penalties, setPenalties] = useState<Penalty[]>(INIT_PENALTIES);
  const [tab, setTab] = useState<'all' | 'proposed' | 'applied' | 'waived'>('all');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // New penalty modal
  const [newModal, setNewModal] = useState(false);
  const [newEmp, setNewEmp] = useState('');
  const [newType, setNewType] = useState(PENALTY_TYPES[0].label);
  const [newAmount, setNewAmount] = useState(PENALTY_TYPES[0].amount);
  const [newReason, setNewReason] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // Waive modal
  const [waiveModal, setWaiveModal] = useState<Penalty | null>(null);
  const [waiveReason, setWaiveReason] = useState('');

  const filtered = penalties.filter(p => {
    if (tab !== 'all' && p.status.toLowerCase() !== tab) return false;
    if (deptFilter && p.dept !== deptFilter) return false;
    if (search && !p.empName.toLowerCase().includes(search.toLowerCase()) && !p.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totals = {
    proposed: penalties.filter(p => p.status === 'Proposed').length,
    hoApproved: penalties.filter(p => p.status === 'HO Approved').length,
    applied: penalties.reduce((s, p) => p.status === 'Applied' ? s + p.amount : s, 0),
    waived: penalties.reduce((s, p) => p.status === 'Waived' ? s + p.amount : s, 0),
  };

  function handleTypeChange(label: string) {
    setNewType(label);
    const pt = PENALTY_TYPES.find(t => t.label === label);
    if (pt && pt.amount > 0) setNewAmount(pt.amount);
    else setNewAmount(0);
  }

  function submitPenalty() {
    if (!newEmp || !newReason) { showToast('Fill all required fields', 'error'); return; }
    const emp = employees.find((e: any) => e.id === newEmp);
    const newP: Penalty = {
      id: 'PA' + String(penalties.length + 1).padStart(3, '0'),
      empId: newEmp, empName: emp?.name || '', dept: emp?.department || '',
      date: newDate, type: newType, reason: newReason, amount: newAmount,
      status: 'Proposed', appliedBy: 'HR Admin',
    };
    setPenalties(prev => [newP, ...prev]);
    setNewModal(false); setNewEmp(''); setNewReason(''); setNewType(PENALTY_TYPES[0].label); setNewAmount(PENALTY_TYPES[0].amount);
    showToast('Penalty proposed — pending HO approval');
  }

  function hoApprove(id: string) {
    setPenalties(prev => prev.map(p => p.id === id ? { ...p, status: 'HO Approved' } : p));
    showToast('Forwarded for HO approval');
  }

  function applyPenalty(id: string) {
    setPenalties(prev => prev.map(p => p.id === id ? { ...p, status: 'Applied' } : p));
    showToast('Penalty applied to payroll');
  }

  function confirmWaive() {
    if (!waiveModal || !waiveReason.trim()) { showToast('Waive reason required', 'error'); return; }
    setPenalties(prev => prev.map(p => p.id === waiveModal.id ? { ...p, status: 'Waived', waivedReason: waiveReason } : p));
    setWaiveModal(null); setWaiveReason('');
    showToast('Penalty waived');
  }

  function rejectPenalty(id: string) {
    setPenalties(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));
    showToast('Penalty rejected');
  }

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Penalties Admin</div><div className="pg-sub">Manage penalty proposals, HO approvals and ledger</div></div>
        <button className="btn btn-primary" onClick={() => setNewModal(true)}><Plus size={13} /> Propose Penalty</button>
      </div>

      {/* KPI strip */}
      <div className="kpi-strip" style={{ marginBottom: 12 }}>
        {[
          { l: 'Pending Proposal', v: totals.proposed, c: 'k3' },
          { l: 'HO Approved', v: totals.hoApproved, c: 'k1' },
          { l: 'Total Applied (PKR)', v: formatPKR(totals.applied), c: 'k4' },
          { l: 'Total Waived (PKR)', v: formatPKR(totals.waived), c: 'k2' },
        ].map((k, i) => (
          <div key={i} className={`kpi-item ${k.c}`}>
            <div><div className="kpi-val" style={{ fontSize: typeof k.v === 'string' ? 14 : 22 }}>{k.v}</div><div className="kpi-lbl">{k.l}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs + Filters */}
      <div className="tabs">
        {(['all', 'proposed', 'applied', 'waived'] as const).map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'proposed' && totals.proposed > 0 && <span style={{ marginLeft: 6, background: 'var(--amber)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 9 }}>{totals.proposed}</span>}
          </button>
        ))}
      </div>

      <div className="card">
        {/* Filters bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
            <input className="input" style={{ paddingLeft: 32 }} placeholder="Search employee or type..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input select-input" style={{ width: 180 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d: string) => <option key={d}>{d}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}><AlertTriangle size={32} style={{ margin: '0 auto 8px', opacity: .3 }} /><div>No penalties found</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Employee</th><th>Date</th><th>Type</th><th>Reason</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td className="mono" style={{ fontSize: 11 }}>{p.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{p.empName}</div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--t3)' }}>{p.empId} · {p.dept}</div>
                    </td>
                    <td className="mono">{p.date}</td>
                    <td>
                      <span style={{ fontSize: 11, color: '#e65100', fontWeight: 600, background: '#fff3e0', padding: '2px 8px', borderRadius: 4 }}>{p.type}</span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--t2)', maxWidth: 220 }}>
                      {p.reason}
                      {p.waivedReason && <div style={{ fontSize: 10, color: 'var(--green)', fontStyle: 'italic', marginTop: 2 }}>Waived: {p.waivedReason}</div>}
                    </td>
                    <td className="mono" style={{ fontWeight: 700, color: p.status === 'Waived' ? 'var(--t3)' : '#c62828', textDecoration: p.status === 'Waived' ? 'line-through' : 'none' }}>
                      {formatPKR(p.amount)}
                    </td>
                    <td><span className={`pill ${statusColor[p.status]}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.status === 'Proposed' && <>
                          <button className="btn btn-sm btn-ghost" title="Forward to HO" onClick={() => hoApprove(p.id)}><Shield size={12} /> HO Approve</button>
                          <button className="ico-btn" title="Waive" style={{ background: 'var(--greenl)', color: 'var(--green)', border: 'none', width: 28, height: 28 }} onClick={() => { setWaiveModal(p); setWaiveReason(''); }}><Check size={12} /></button>
                          <button className="ico-btn" title="Reject" style={{ background: 'var(--redl)', color: 'var(--red)', border: 'none', width: 28, height: 28 }} onClick={() => rejectPenalty(p.id)}><X size={12} /></button>
                        </>}
                        {p.status === 'HO Approved' && <>
                          <button className="btn btn-sm btn-ghost" style={{ color: '#c62828' }} onClick={() => applyPenalty(p.id)}>Apply to Payroll</button>
                          <button className="ico-btn" title="Waive" style={{ background: 'var(--greenl)', color: 'var(--green)', border: 'none', width: 28, height: 28 }} onClick={() => { setWaiveModal(p); setWaiveReason(''); }}><Check size={12} /></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Propose Penalty Modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="Propose Penalty"
        footer={<><button className="btn btn-secondary" onClick={() => setNewModal(false)}>Cancel</button><button className="btn btn-primary" onClick={submitPenalty}>Submit for HO Review</button></>}>
        <div className="form-group"><label className="form-label">Employee *</label>
          <select className="input select-input" value={newEmp} onChange={e => setNewEmp(e.target.value)}>
            <option value="">Select employee...</option>
            {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Date</label>
          <input className="input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
        </div>
        <div className="form-group"><label className="form-label">Penalty Type *</label>
          <select className="input select-input" value={newType} onChange={e => handleTypeChange(e.target.value)}>
            {PENALTY_TYPES.map(t => <option key={t.label}>{t.label}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Amount (PKR) *</label>
          <input className="input mono" type="number" value={newAmount || ''} onChange={e => setNewAmount(+e.target.value)} />
        </div>
        <div className="form-group"><label className="form-label">Reason / Details *</label>
          <textarea className="input" rows={3} value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="Describe the incident..." />
        </div>
        <div style={{ fontSize: 11, color: 'var(--t3)', background: 'var(--inp)', padding: '8px 12px', borderRadius: 'var(--rsm)' }}>
          ⚠ Proposed penalties are sent to Head Office for approval before being applied to payroll.
        </div>
      </Modal>

      {/* Waive Modal */}
      <Modal open={!!waiveModal} onClose={() => setWaiveModal(null)} title="Waive Penalty"
        footer={<><button className="btn btn-secondary" onClick={() => setWaiveModal(null)}>Cancel</button><button className="btn btn-primary" onClick={confirmWaive}>Confirm Waive</button></>}>
        <div style={{ background: 'var(--inp)', padding: 12, borderRadius: 'var(--rsm)', marginBottom: 12, fontSize: 12.5 }}>
          <strong>{waiveModal?.empName}</strong> — {waiveModal?.type}<br />
          <span className="mono" style={{ fontSize: 11, color: '#c62828' }}>{formatPKR(waiveModal?.amount || 0)}</span>
        </div>
        <div className="form-group"><label className="form-label">Waive Reason *</label>
          <textarea className="input" rows={3} value={waiveReason} onChange={e => setWaiveReason(e.target.value)} placeholder="Reason for waiving this penalty..." />
        </div>
      </Modal>
    </div>
  );
}
