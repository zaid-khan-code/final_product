import React, { useState, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { getStatusColor } from '../data/dummyData';
import { Download, Save, Copy, Undo2, Upload, Calendar as CalendarIcon, Lock } from 'lucide-react';
import DecisionBanner from '../components/DecisionBanner';
import { useToastContext } from '../contexts/ToastContext';

type AttRow = {
  empId: string; name: string; dept: string; shift: string; expectedIn: string;
  checkIn: string; checkOut: string; status: string; lateBy: string; notes: string; acknowledged: boolean;
};

const STATUSES = ['Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Holiday'];

function calcLateBy(expectedIn: string, checkIn: string, lateAfter: number): string {
  if (!checkIn || checkIn === '-') return '';
  const [eh, em] = expectedIn.split(':').map(Number);
  const [ch, cm] = checkIn.split(':').map(Number);
  const diff = (ch * 60 + cm) - (eh * 60 + em);
  if (diff > lateAfter) return `${diff} min`;
  return '';
}

function autoStatus(expectedIn: string, checkIn: string, lateAfter: number, currentStatus: string): string {
  if (!checkIn || checkIn === '-') return currentStatus;
  const late = calcLateBy(expectedIn, checkIn, lateAfter);
  if (late && currentStatus !== 'Absent' && currentStatus !== 'On Leave' && currentStatus !== 'Holiday') return 'Late';
  return currentStatus === '' ? 'Present' : currentStatus;
}

export default function Attendance() {
  const { employees, departments, workLocations, shifts } = useData();
  const [tab, setTab] = useState('daily');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedDate, setSelectedDate] = useState('2026-03-19');
  const [deptFilter, setDeptFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const { showToast } = useToastContext();
  const [undoStack, setUndoStack] = useState<AttRow[][]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const initRows = (): AttRow[] => employees.map((e: any) => {
    const s = shifts.find((sh: any) => sh.name === e.shift);
    const existing = e.id === 'EMP001' ? { checkIn: '09:02', checkOut: '18:05', status: 'Present' } :
      e.id === 'EMP002' ? { checkIn: '08:55', checkOut: '18:00', status: 'Present' } :
      e.id === 'EMP003' ? { checkIn: '09:22', checkOut: '18:10', status: 'Late' } :
      e.id === 'EMP004' ? { checkIn: '-', checkOut: '-', status: 'On Leave' } :
      { checkIn: '-', checkOut: '-', status: 'Absent' };
    return {
      empId: e.id, name: e.name, dept: e.department, shift: e.shift,
      expectedIn: s?.start || '09:00', checkIn: existing.checkIn, checkOut: existing.checkOut,
      status: existing.status, lateBy: calcLateBy(s?.start || '09:00', existing.checkIn, s?.lateAfter || 15),
      notes: e.id === 'EMP004' ? 'Annual Leave' : '', acknowledged: e.id !== 'EMP005',
    };
  });

  const [rows, setRows] = useState<AttRow[]>(initRows);

  const filteredRows = rows.filter(r => {
    if (deptFilter && r.dept !== deptFilter) return false;
    if (shiftFilter && r.shift !== shiftFilter) return false;
    const emp = employees.find((e: any) => e.id === r.empId);
    if (locFilter && emp?.workLocation !== locFilter) return false;
    return true;
  });

  const summary = {
    Present: filteredRows.filter(r => r.status === 'Present').length,
    Absent: filteredRows.filter(r => r.status === 'Absent').length,
    Late: filteredRows.filter(r => r.status === 'Late').length,
    'On Leave': filteredRows.filter(r => r.status === 'On Leave').length,
    Holiday: filteredRows.filter(r => r.status === 'Holiday').length,
    Unmarked: filteredRows.filter(r => !r.status).length,
  };

  const updateRow = (idx: number, field: keyof AttRow, value: string | boolean) => {
    setRows(prev => {
      const next = [...prev];
      const realIdx = rows.indexOf(filteredRows[idx]);
      next[realIdx] = { ...next[realIdx], [field]: value };
      if (field === 'checkIn') {
        const s = shifts.find((sh: any) => sh.name === next[realIdx].shift);
        next[realIdx].lateBy = calcLateBy(next[realIdx].expectedIn, value as string, s?.lateAfter || 15);
        next[realIdx].status = autoStatus(next[realIdx].expectedIn, value as string, s?.lateAfter || 15, next[realIdx].status);
      }
      return next;
    });
  };

  const saveAll = () => {
    localStorage.setItem('ems_attendanceSheet_' + selectedDate, JSON.stringify(rows));
    showToast('Draft changes saved');
  };

  const lockSheet = () => {
    setIsLocked(true);
    showToast('Sheet officially submitted and locked');
  };

  const markAllPresent = () => {
    setUndoStack(prev => [...prev, [...rows]]);
    setRows(prev => prev.map(r => (!r.status || r.status === '') ? { ...r, status: 'Present', checkIn: r.expectedIn, checkOut: '18:00' } : r));
    showToast('All unmarked set to Present');
  };

  const copyPrevDay = () => {
    showToast('Copied from previous day');
  };

  const undo = () => {
    if (undoStack.length > 0) {
      setRows(undoStack[undoStack.length - 1]);
      setUndoStack(prev => prev.slice(0, -1));
      showToast('Undone');
    }
  };

  const borderColor = (status: string) => status === 'Present' ? 'var(--green)' : status === 'Late' ? 'var(--amber)' : status === 'Absent' ? 'var(--red)' : status === 'On Leave' ? 'var(--p)' : 'var(--br)';

  // Calendar view data
  const calDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const calStatuses: Record<number, string> = { 1: 'P', 2: 'P', 3: 'L', 4: 'P', 5: 'A', 6: 'P', 7: 'P', 8: 'H', 9: 'H', 10: 'P', 11: 'P', 12: 'P', 13: 'A', 14: 'P', 15: 'P', 16: 'H', 17: 'P', 18: 'L', 19: 'P' };
  const calColors: Record<string, string> = { P: 'var(--greenl)', A: 'var(--redl)', L: 'var(--amberl)', H: 'var(--steell)', OL: 'var(--pl)' };
  const calTextColors: Record<string, string> = { P: 'var(--green)', A: 'var(--red)', L: 'var(--amber)', H: 'var(--steel)', OL: 'var(--p)' };

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Attendance</div><div className="pg-sub">Track and manage employee attendance</div></div>
        <div style={{ display: 'flex', gap: 8 }} />
      </div>
      <DecisionBanner>DECISION NEEDED — Attendance Verification Method: Manual / Self-mark / Biometric? Confirm in meeting.</DecisionBanner>
      <div className="tabs" style={{ marginTop: 12 }}>
        <button className={`tab ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>Daily Sheet</button>
        <button className={`tab ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>Monthly Report</button>
      </div>
      {tab === 'daily' && (
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input className="input" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: 160 }} />
              <select className="input select-input" style={{ width: 160 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                <option value="">All Departments</option>{departments.map((d: string) => <option key={d}>{d}</option>)}
              </select>
              <select className="input select-input" style={{ width: 160 }} value={locFilter} onChange={e => setLocFilter(e.target.value)}>
                <option value="">All Locations</option>{workLocations.map((l: string) => <option key={l}>{l}</option>)}
              </select>
              <select className="input select-input" style={{ width: 140 }} value={shiftFilter} onChange={e => setShiftFilter(e.target.value)}>
                <option value="">All Shifts</option>{shifts.map((s: any) => <option key={s.name}>{s.name}</option>)}
              </select>
              <div style={{ flex: 1 }} />
              {/* View toggle */}
              <div style={{ display: 'flex', gap: 2, background: 'var(--inp)', borderRadius: 'var(--rsm)', padding: 2, border: '1px solid var(--br)' }}>
                <button onClick={() => setViewMode('table')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, background: viewMode === 'table' ? 'var(--p)' : 'transparent', color: viewMode === 'table' ? '#fff' : 'var(--t3)' }}>Table</button>
                <button onClick={() => setViewMode('calendar')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, background: viewMode === 'calendar' ? 'var(--p)' : 'transparent', color: viewMode === 'calendar' ? '#fff' : 'var(--t3)' }}>Calendar</button>
              </div>
              {!isLocked && <button className="btn btn-secondary" onClick={saveAll}><Save size={13} /> Save Draft</button>}
              {!isLocked && <button className="btn btn-primary" onClick={lockSheet}><Lock size={13} /> Submit & Lock</button>}
              {isLocked && <div className="pill pill-green"><Lock size={12} /> Submitted</div>}
            </div>
          </div>

          {/* Bulk actions */}
          {!isLocked && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className="btn btn-sm btn-ghost" onClick={markAllPresent}>✓ Mark All Present</button>
              <button className="btn btn-sm btn-ghost" onClick={copyPrevDay}><Copy size={12} /> Copy Previous Day</button>
              <button className="btn btn-sm btn-ghost" onClick={undo} disabled={undoStack.length === 0}><Undo2 size={12} /> Undo</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {Object.entries(summary).map(([k, v]) => <span key={k} className={`pill ${k === 'Present' ? 'pill-green' : k === 'Late' ? 'pill-amber' : k === 'Absent' ? 'pill-red' : k === 'On Leave' ? 'pill-blue' : 'pill-steel'}`}>{k}: {v}</span>)}
          </div>
          {summary.Unmarked > 0 && <div className="decision-banner" style={{ marginBottom: 12, background: 'var(--amberl)', border: '1px solid var(--amber)' }}>⚠ {summary.Unmarked} employee(s) not yet marked</div>}

          {viewMode === 'table' ? (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Employee</th><th>Shift</th><th>Expected In</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Late By</th><th>Notes</th><th>Ack</th></tr></thead>
                  <tbody>
                    {filteredRows.map((r, i) => (
                      <tr key={r.empId} style={{ borderLeft: `3px solid ${borderColor(r.status)}`, background: r.status === 'On Leave' ? 'var(--pl)' : !r.status ? '#fffbeb' : 'transparent' }}>
                        <td className="mono" style={{ color: 'var(--t3)' }}>{i + 1}</td>
                        <td><div style={{ fontWeight: 600, fontSize: 12.5 }}>{r.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--t3)' }}>{r.empId} · {r.dept}</div></td>
                        <td style={{ fontSize: 11 }}>{r.shift}</td>
                        <td className="mono">{r.expectedIn}</td>
                        <td><input className="input mono" type="time" disabled={isLocked} value={r.checkIn === '-' ? '' : r.checkIn} onChange={e => updateRow(i, 'checkIn', e.target.value)} style={{ padding: '4px 6px', fontSize: 12, width: 80 }} /></td>
                        <td><input className="input mono" type="time" disabled={isLocked} value={r.checkOut === '-' ? '' : r.checkOut} onChange={e => updateRow(i, 'checkOut', e.target.value)} style={{ padding: '4px 6px', fontSize: 12, width: 80 }} /></td>
                        <td><select className="input select-input" disabled={isLocked} value={r.status} onChange={e => updateRow(i, 'status', e.target.value)} style={{ padding: '4px 6px', fontSize: 11, width: 110 }}><option value="">—</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
                        <td className="mono" style={{ fontSize: 11, color: 'var(--amber)' }}>{r.lateBy || '-'}</td>
                        <td><input className="input" disabled={isLocked} value={r.notes} onChange={e => updateRow(i, 'notes', e.target.value)} style={{ padding: '4px 6px', fontSize: 11, width: 100 }} /></td>
                        <td style={{ textAlign: 'center' }}><input type="checkbox" disabled={isLocked} checked={r.acknowledged} onChange={e => updateRow(i, 'acknowledged', e.target.checked)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Calendar View */
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>March 2026 — Ahmed Ali (EMP001)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => <div key={i} style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', padding: 6 }}>{d}</div>)}
                {/* March 2026 starts on Sunday */}
                {calDays.map(d => {
                  const st = calStatuses[d] || '';
                  return (
                    <div key={d} style={{ padding: 8, borderRadius: 6, background: calColors[st] || 'var(--inp)', cursor: 'pointer', minHeight: 40 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: calTextColors[st] || 'var(--t3)' }}>{d}</div>
                      {st && <div style={{ fontSize: 9, fontWeight: 700, color: calTextColors[st], marginTop: 2 }}>{st}</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 10 }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--greenl)', marginRight: 4 }} />Present</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--redl)', marginRight: 4 }} />Absent</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--amberl)', marginRight: 4 }} />Late</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--steell)', marginRight: 4 }} />Holiday</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--t2)' }}>Total: {filteredRows.length} | Present: {summary.Present} | Late: {summary.Late} | Absent: {summary.Absent}</span>
            {!isLocked && <button className="btn btn-secondary" onClick={saveAll}><Save size={13} /> Save Draft</button>}
          </div>
        </div>
      )}
      {tab === 'monthly' && (
        <div className="card">
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <select className="input select-input" style={{ width: 120 }}><option>March</option><option>February</option></select>
            <input className="input mono" style={{ width: 80 }} value="2026" readOnly />
          </div>
          <table>
            <thead><tr><th>Employee</th><th>Present</th><th>Absent</th><th>Late</th><th>Half Day</th><th>On Leave</th><th>Total</th><th>%</th></tr></thead>
            <tbody>
              {employees.map((e: any, i: number) => {
                const p = Math.floor(Math.random() * 5) + 15;
                const a = Math.floor(Math.random() * 2);
                const l = Math.floor(Math.random() * 3);
                const h = 0;
                const ol = Math.floor(Math.random() * 2);
                const total = p + a + l + h + ol;
                const pct = Math.round((p / total) * 100);
                return <tr key={i}><td style={{ fontWeight: 600 }}>{e.name}<div className="mono" style={{ fontSize: 10, color: 'var(--t3)' }}>{e.shift}</div></td><td className="mono">{p}</td><td className="mono">{a}</td><td className="mono">{l}</td><td className="mono">{h}</td><td className="mono">{ol}</td><td className="mono">{total}</td><td className="mono" style={{ fontWeight: 600, color: pct >= 90 ? 'var(--green)' : pct >= 75 ? 'var(--amber)' : 'var(--red)' }}>{pct}%</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
