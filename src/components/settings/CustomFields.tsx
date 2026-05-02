"use client";
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Plus, Trash2, Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import { useToastContext } from '@/contexts/ToastContext';
import DecisionBanner from '@/components/DecisionBanner';

export default function CustomFields() {
  const { customFields, setCustomFields } = useData();
  const [modal, setModal] = useState(false);
  const { showToast } = useToastContext();
  const [form, setForm] = useState({ label: '', type: 'text', section: 'Personal', required: false, options: '' });

  const handleAdd = () => {
    setCustomFields(prev => [...prev, {
      id: 'CF' + String(Date.now()).slice(-3),
      ...form,
      options: form.options ? form.options.split(',').map(s => s.trim()) : undefined,
    }]);
    setModal(false);
    showToast('Custom field added');
    setForm({ label: '', type: 'text', section: 'Personal', required: false, options: '' });
  };

  const deleteField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
    showToast('Field removed');
  };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Custom Fields</div><div className="pg-sub">Extend employee profiles with your own data points</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={13} /> Add Custom Field</button>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <DecisionBanner>DECISION NEEDED — Data Types & Validation: What types of custom fields are needed? Confirm in meeting.</DecisionBanner>
      </div>

      <div className="card">
        {customFields.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>No custom fields yet. Click Add to create one.</div> : (
          <table>
            <thead><tr><th>Label</th><th>Type</th><th>Section</th><th>Required</th><th>Options</th><th>Actions</th></tr></thead>
            <tbody>
              {customFields.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.label}</td>
                  <td><span className="pill pill-blue">{f.type}</span></td>
                  <td>{f.section}</td>
                  <td>{f.required ? 'Yes' : 'No'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.options?.join(', ') || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="ico-btn" style={{ width: 28, height: 28 }}><Pencil size={13} /></button>
                      <button className="ico-btn" style={{ width: 28, height: 28 }} onClick={() => deleteField(f.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Custom Field" footer={
        <><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd}>Add Field</button></>
      }>
        <div className="form-group"><label className="form-label">Field Label</label><input className="input" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Passport Number" /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Type</label><select className="input select-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="text">Text</option><option value="number">Number</option><option value="date">Date</option><option value="select">Dropdown</option></select></div>
          <div className="form-group"><label className="form-label">Section</label><select className="input select-input" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}><option>Personal</option><option>Job Info</option><option>Medical</option></select></div>
        </div>
        {form.type === 'select' && <div className="form-group"><label className="form-label">Options (comma separated)</label><input className="input" value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} placeholder="Option 1, Option 2, ..." /></div>}
        <div className="form-group"><label style={{ fontSize: 12, cursor: 'pointer' }}><input type="checkbox" checked={form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} /> Mandatory field</label></div>
      </Modal>
    </div>
  );
}
