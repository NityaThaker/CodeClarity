import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../services/api'
import { Code2, Eye, EyeOff, AlertCircle, ArrowRight, Cpu, GitBranch, Zap } from 'lucide-react'

const FEATURES = [
  {
    icon: <Cpu size={22} />,
    title: 'Deep Code Analysis',
    desc: 'AI analyzes your control flow, time complexity, and memory usage with detailed paragraph feedback',
  },
  {
    icon: <GitBranch size={22} />,
    title: 'Requirement Tracking',
    desc: 'See exactly which requirements you met, partially met, or missed — with progress bars per requirement',
  },
  {
    icon: <Zap size={22} />,
    title: 'Instant AI Hints',
    desc: 'Socratic hints guide you toward the answer without giving it away — learn by thinking, not copying',
  },
]

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form)
      const token = res.data.access_token
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userData = {
        user_id: payload.user_id,
        full_name: payload.full_name,
        role: payload.role,
        email: payload.email,
      }
      loginUser(token, userData)
      navigate(payload.role === 'instructor' ? '/instructor' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%', display: 'flex',
      background: '#0a0a0f', fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: '55%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px 80px',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d1117 0%, #090d18 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>

        {/* Orbs */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 65%)',
          top: '-150px', left: '-150px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)',
          bottom: '-100px', right: '-50px', pointerEvents: 'none',
        }} />

        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '540px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '72px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 28px rgba(59,130,246,0.45)',
            }}>
              <Code2 size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', letterSpacing: '-0.3px' }}>CodeClarity</div>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>AI-Powered Evaluation Platform</div>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: '56px', fontWeight: '800', lineHeight: '1.08',
            letterSpacing: '-2px', color: 'white', marginBottom: '24px',
          }}>
            Code smarter.<br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Learn faster.
            </span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: '18px', color: '#64748b', lineHeight: '1.75',
            marginBottom: '56px', maxWidth: '460px', fontWeight: '400',
          }}>
            The AI-powered platform that tells you{' '}
            <em style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: '500' }}>exactly</em>{' '}
            what went wrong — and guides you step by step to the solution.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '13px', flexShrink: 0,
                  background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa',
                }}>
                  {f.icon}
                </div>
                <div style={{ paddingTop: '2px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Badge */}
          <div style={{
            marginTop: '60px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '9px 18px', borderRadius: '100px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              Built for academic excellence
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: '45%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '80px 80px',
        position: 'relative',
      }}>

        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Secure badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '6px 14px', borderRadius: '100px', marginBottom: '32px',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '12px', color: '#86efac', fontWeight: '500' }}>Secure Login</span>
          </div>

          <h2 style={{
            fontSize: '32px', fontWeight: '700', color: 'white',
            letterSpacing: '-0.8px', marginBottom: '10px',
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '36px', lineHeight: '1.6' }}>
            Sign in to continue your learning journey and track your progress
          </p>

          {error && (
            <div style={{
              marginBottom: '24px', padding: '14px 16px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5', fontSize: '14px',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '14px', fontWeight: '500',
                color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.1px',
              }}>
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-dark"
                style={{ width: '100%', padding: '14px 16px', fontSize: '15px', display: 'block' }}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block', fontSize: '14px', fontWeight: '500',
                color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.1px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-dark"
                  style={{ width: '100%', padding: '14px 48px 14px 16px', fontSize: '15px', display: 'block' }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#374151',
                    display: 'flex', alignItems: 'center', padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, letterSpacing: '-0.1px',
              }}
            >
              {loading
                ? <div style={{
                    width: '18px', height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                : <><span>Sign In</span><ArrowRight size={18} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            margin: '28px 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Register link */}
          <div style={{
            padding: '18px', borderRadius: '12px', textAlign: 'center',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>New to CodeClarity? </span>
            <Link to="/register" style={{
              fontSize: '14px', color: '#60a5fa', fontWeight: '600',
              textDecoration: 'none', letterSpacing: '-0.1px',
            }}>
              Create a free account →
            </Link>
          </div>

          {/* Trust indicators */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '24px',
            marginTop: '28px',
          }}>
            {['100% Free', 'No Credit Card', 'Instant Access'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1d4ed8' }} />
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}