'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export default function LoginPage() {
  const router = useRouter()
  const { ready, session, login, isEmployee } = useAuth()
  const { showToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ready || !session) return
    router.replace(isEmployee ? '/me/dashboard' : '/launchpad')
  }, [isEmployee, ready, router, session])

  if (!ready) return null
  if (session) return null

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }

    showToast('Login successful', 'success')
    router.replace('/')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div className="sb-mark" style={{ width: 48, height: 48 }}>
            <Zap size={22} />
          </div>
        </div>
        <div className="login-title">Employee Management System</div>
        <div className="login-sub">Sign in to your account</div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t2)', marginBottom: 6, display: 'block' }}>
              Email
            </label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t2)', marginBottom: 6, display: 'block' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--t3)',
                  padding: 4,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '10px 14px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 18, padding: 12, background: 'var(--inp)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--t3)' }}>
          <div style={{ fontWeight: 800, marginBottom: 6, color: 'var(--t2)' }}>Seed Accounts</div>
          <div className="mono" style={{ fontSize: 10.5 }}>
            Use the seeded emails/passwords from your backend dev seed.
          </div>
        </div>
      </div>
    </div>
  )
}
