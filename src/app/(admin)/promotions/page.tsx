"use client";
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { formatPKR, getStatusColor } from '@/data/dummyData';
import { Plus } from 'lucide-react';
import Modal from '@/components/Modal';
import DecisionBanner from '@/components/DecisionBanner';
import { useToastContext } from '@/contexts/ToastContext';

export default function PromotionsPage() {
  const { promotions, setPromotions, employees } = useData();
  const [modal, setModal] = useState(false);
  const { showToast } = useToastContext();
  const [empId, setEmpId] = useState('EMP001');
  const [promoDate, setPromoDate] = useState('');
  const [newDesig, setNewDesig] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [notes, setNotes] = useState('');

  const emp = employees.find((e: any) => e.id === empId);

  const savePromo = () => {
    setPromotions(prev => [...prev, {
      id: 'PR' + String(prev.length + 1).padStart(3, '0'),
      empId, empName: emp?.name || '',
      oldDesignation: emp?.designation || '', newDesignation: newDesig,
      oldSalary: emp?.salary.basic || 0, newSalary: parseInt(newSalary) || 0,
      date: promoDate || new Date().toISOString().split('T')[0],
      approvedBy: 'Super Admin',
    }]);
    showToast('Promotion recorded'); setModal(false);
    setNewDesig(''); setNewSalary(''); setPromoDate(''); setNotes('');
  };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Promotions</div><div className="pg-sub">Track employee promotions and career growth</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={13} /> Record Promotion</button>
      </div>
      <DecisionBanner>
        DECISION NEEDED — Promotion Trigger Method: Manual / Automatic / Both? Confirm in meeting.
      </DecisionBanner>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Old Designation</th><th>New Designation</th><th>Before</th><th>After</th><th>Date</th><th>Approved By</th></tr></thead>
            <tbody>
              {promotions.map((p: any, i: number) => (
                <tr key={i}><td style={{ fontWeight: 600 }}>{p.empName}</td><td>{p.oldDesignation}</td><td>{p.newDesignation}</td><td className="mono">{formatPKR(p.oldSalary)}</td><td className="mono" style={{ color: 'var(--green)' }}>{formatPKR(p.newSalary)}</td><td className="mono">{p.date}</td><td>{p.approvedBy}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Record Promotion" footer={
        <><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={savePromo}>Save</button></>
      }>
        <div className="form-group"><label className="form-label">Employee</label>
          <select className="input select-input" value={empId} onChange={e => setEmpId(e.target.value)}>
            {employees.map((e: any) => <option key={e.id} value={e.id}>{e.id} — {e.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Promotion Date</label><input className="input" type="date" value={promoDate} onChange={e => setPromoDate(e.target.value)} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Old Designation</label><input className="input" value={emp?.designation || ''} disabled /></div>
          <div className="form-group"><label className="form-label">New Designation</label><input className="input" value={newDesig} onChange={e => setNewDesig(e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Old Salary</label><input className="input mono" value={formatPKR(emp?.salary.basic || 0)} disabled /></div>
          <div className="form-group"><label className="form-label">New Salary</label><input className="input mono" value={newSalary} onChange={e => setNewSalary(e.target.value)} placeholder="PKR" /></div>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} /></div>
      </Modal>
    </div>
  );
}
