import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Save, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';

export default function MyProfile() {
  const { employees } = useData();
  const emp = employees[0];
  const { showToast } = useToastContext();
  const [tab, setTab] = useState<'info' | 'security'>('info');
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState(emp.contact1);
  const [ice1, setIce1] = useState(emp.emergency1);
  const [ice2, setIce2] = useState(emp.emergency2 || '');
  const [bankName, setBankName] = useState(emp.bankName || '');
  const [bankAcc, setBankAcc] = useState(emp.bankAccount || '');

  // Security tab state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  const pwdStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'var(--red)', 'var(--amber)', 'var(--green)', 'var(--green)'];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = pwdStrength(newPwd);

  const handleSave = () => {
    localStorage.setItem('ems_profile_contact', contact);
    localStorage.setItem('ems_profile_ice1', ice1);
    localStorage.setItem('ems_profile_ice2', ice2);
    localStorage.setItem('ems_profile_bank', bankName);
    localStorage.setItem('ems_profile_bankAcc', bankAcc);
    showToast('Profile updated');
    setEditing(false);
  };

  const handlePasswordChange = () => {
    if (!currentPwd) { showToast('Enter your current password', 'error'); return; }
    if (currentPwd !== 'Welcome@123') { showToast('Current password is incorrect', 'error'); return; }
    if (newPwd.length < 8) { showToast('New password must be at least 8 characters', 'error'); return; }
    if (newPwd !== confirmPwd) { showToast('Passwords do not match', 'error'); return; }
    setPwdSaving(true);
    setTimeout(() => {
      setPwdSaving(false);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      showToast('Password changed successfully');
    }, 800);
  };

  const InfoItem = ({ label, value, editable, editValue, onEdit }: { label: string; value: string; editable?: boolean; editValue?: string; onEdit?: (v: string) => void }) => (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      {editing && editable ? (
        <input className="input" value={editValue} onChange={e => onEdit?.(e.target.value)} style={{ fontSize: 13 }} />
      ) : (
        <div style={{ fontSize: 13 }}>{value || '—'}</div>
      )}
    </div>
  );

  return (
    <div>
      <div className="pg-head">
        <div><div className="pg-greet">My Profile</div><div className="pg-sub">View and update your information</div></div>
        {tab === 'info' && (editing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}><Save size={13} /> Save Changes</button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
        ))}
      </div>

      {/* Avatar header */}
      <div className="card" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <div className="avatar avatar-lg" style={{ background: 'var(--p)' }}>{emp.avatar}</div>
          {editing && (
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: 'var(--p)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
              <Camera size={10} />
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{emp.name}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>{emp.id} · {emp.department} · {emp.designation}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 12 }}>
        <button className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>Personal Info</button>
        <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}><Lock size={12} /> Change Password</button>
      </div>

      {tab === 'info' && <>
        {/* Personal Info (read-only) */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 12 }}>Personal Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <InfoItem label="Full Name" value={emp.name} />
            <InfoItem label="Father Name" value={emp.fatherName} />
            <InfoItem label="Date of Birth" value={emp.dob} />
            <InfoItem label="CNIC" value={emp.cnic} />
            <InfoItem label="Gender" value={emp.gender} />
            <InfoItem label="Blood Group" value={emp.bloodGroup} />
          </div>
        </div>

        {/* Contact (editable) */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 12 }}>Contact Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <InfoItem label="Phone" value={contact} editable editValue={contact} onEdit={setContact} />
            <InfoItem label="Emergency Contact 1" value={ice1} editable editValue={ice1} onEdit={setIce1} />
            <InfoItem label="Emergency Contact 2" value={ice2 || 'N/A'} editable editValue={ice2} onEdit={setIce2} />
          </div>
        </div>

        {/* Bank (editable with note) */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 12 }}>Bank Details</div>
          {editing && <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 8, background: 'var(--amberl)', padding: '6px 10px', borderRadius: 'var(--rxs)' }}>⚠ Bank detail changes require HR approval and will be reviewed before applying.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <InfoItem label="Bank Name" value={bankName || 'Not provided'} editable editValue={bankName} onEdit={setBankName} />
            <InfoItem label="Account Number" value={bankAcc || 'Not provided'} editable editValue={bankAcc} onEdit={setBankAcc} />
            <InfoItem label="Payment Mode" value={emp.paymentMode} />
          </div>
        </div>

        {/* Job Info (read-only) */}
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 12 }}>Job Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[['Department', emp.department], ['Designation', emp.designation], ['Work Mode', emp.workMode], ['Shift', emp.shift], ['Date of Joining', emp.dateOfJoining], ['Reporting Manager', emp.reportingManager]].map(([l, v], i) => (
              <InfoItem key={i} label={l} value={v} />
            ))}
          </div>
        </div>
      </>}

      {tab === 'security' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 16 }}>Change Your Password</div>

          <div style={{ fontSize: 11, color: 'var(--t3)', background: 'var(--inp)', padding: '8px 12px', borderRadius: 'var(--rsm)', marginBottom: 16 }}>
            Your temporary password is <strong className="mono">Welcome@123</strong>. Please change it to something secure.
          </div>

          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showCurrent ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="Enter current password" style={{ paddingRight: 36 }} />
              <button onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}>
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min 8 characters" style={{ paddingRight: 36 }} />
              <button onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}>
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {newPwd && (
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 4, background: 'var(--br)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(strength.score / 4) * 100}%`, background: strength.color, transition: 'width .3s, background .3s', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 10, color: strength.color, marginTop: 3, fontWeight: 600 }}>{strength.label}</div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showConfirm ? 'text' : 'password'} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Re-enter new password" style={{ paddingRight: 36 }} />
              <button onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}>
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {confirmPwd && newPwd !== confirmPwd && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>✗ Passwords do not match</div>}
            {confirmPwd && newPwd === confirmPwd && <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>✓ Passwords match</div>}
          </div>

          <button className="btn btn-primary" onClick={handlePasswordChange} disabled={pwdSaving} style={{ marginTop: 4 }}>
            <Lock size={13} /> {pwdSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  );
}
