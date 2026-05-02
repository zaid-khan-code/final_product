"use client";
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Search, Phone, MapPin, Briefcase, Users } from 'lucide-react';

export default function CompanyDirectory() {
  const { employees, departments, workLocations } = useData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => employees.filter((e: any) => {
    if (e.jobStatus === 'Terminated') return false;
    if (deptFilter && e.department !== deptFilter) return false;
    if (locFilter && e.workLocation !== locFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.name.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.id?.toLowerCase().includes(q);
    }
    return true;
  }), [employees, search, deptFilter, locFilter]);

  const deptGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((e: any) => {
      if (!groups[e.department]) groups[e.department] = [];
      groups[e.department].push(e);
    });
    return groups;
  }, [filtered]);

  // Avatar palette
  const avatarColors = ['var(--p)', '#1b7a4e', '#e65100', '#7b1fa2', '#1565c0', '#c62828'];
  const colorFor = (id: string) => avatarColors[parseInt(id.replace(/\D/g, '')) % avatarColors.length];

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">Company Directory</div><div className="pg-sub">Digital phonebook — find anyone in the organisation</div></div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--inp)', borderRadius: 'var(--rsm)', padding: 2, border: '1px solid var(--br)' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: viewMode === 'grid' ? 'var(--p)' : 'transparent', color: viewMode === 'grid' ? '#fff' : 'var(--t3)' }}>Grid</button>
          <button onClick={() => setViewMode('list')} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: viewMode === 'list' ? 'var(--p)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--t3)' }}>List</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
            <input className="input" style={{ paddingLeft: 32 }} placeholder="Search by name, designation, ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input select-input" style={{ width: 180 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d: string) => <option key={d}>{d}</option>)}
          </select>
          <select className="input select-input" style={{ width: 180 }} value={locFilter} onChange={e => setLocFilter(e.target.value)}>
            <option value="">All Locations</option>
            {workLocations.map((l: string) => <option key={l}>{l}</option>)}
          </select>
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Grid view — grouped by dept */
        Object.keys(deptGroups).length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--t3)' }}>
            <Users size={40} style={{ margin: '0 auto 8px', opacity: .3 }} />
            <div>No employees found</div>
          </div>
        ) : (
          Object.entries(deptGroups).map(([dept, emps]) => (
            <div key={dept} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Briefcase size={13} style={{ color: 'var(--p)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 1 }}>{dept}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--t3)' }}>({emps.length})</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10 }}>
                {emps.map((e: any) => (
                  <div key={e.id} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'box-shadow .15s', cursor: 'default' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: colorFor(e.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {e.avatar}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>{e.designation}</div>
                      {e.contact1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--t2)' }}>
                          <Phone size={10} style={{ color: 'var(--p)', flexShrink: 0 }} />
                          <span className="mono">{e.contact1}</span>
                        </div>
                      )}
                      {e.workLocation && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                          <MapPin size={10} style={{ color: 'var(--steel)', flexShrink: 0 }} />
                          <span>{e.workLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )
      ) : (
        /* List view */
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Designation</th><th>Department</th><th>Location</th><th>Shift</th><th>Contact</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>No employees found</td></tr>
                ) : filtered.map((e: any, i: number) => (
                  <tr key={e.id}>
                    <td className="mono" style={{ color: 'var(--t3)', fontSize: 11 }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: colorFor(e.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{e.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12.5 }}>{e.name}</div>
                          <div className="mono" style={{ fontSize: 10, color: 'var(--t3)' }}>{e.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{e.designation}</td>
                    <td style={{ fontSize: 12 }}>{e.department}</td>
                    <td style={{ fontSize: 12 }}>{e.workLocation}</td>
                    <td style={{ fontSize: 11, color: 'var(--t3)' }}>{e.shift}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{e.contact1 || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
