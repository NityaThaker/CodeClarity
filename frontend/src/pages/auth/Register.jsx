import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/api'
import { Code2, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, BookOpen, BarChart2, Users } from 'lucide-react'

const FEATURES = [
  {
    icon: <BookOpen size={22} />,
    title: 'Smart Assignment System',
    desc: 'Submit code in Python, Java, C++, or JavaScript and get evaluated instantly against real test cases',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Track Your Progress',
    desc: 'Watch your score trend over time and identify which requirements need more attention',
  },
  {
    icon: <Users size={22} />,
    title: 'Built for Students',
    desc: 'Designed for academic environments — get the feedback your professor would give, instantly',
  },
]

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', full_name: '', role: 'student'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
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
          background: 'radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 65%)',
          top: '-150px', left: '-150px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 65%)',
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
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 28px rgba(139,92,246,0.45)',
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
            fontSize: '52px', fontWeight: '800', lineHeight: '1.08',
            letterSpacing: '-2px', color: 'white', marginBottom: '24px',
          }}>
            Start your journey<br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              to mastery.
            </span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: '18px', color: '#64748b', lineHeight: '1.75',
            marginBottom: '56px', maxWidth: '460px', fontWeight: '400',
          }}>
            Join thousands of students getting{' '}
            <em style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: '500' }}>real feedback</em>{' '}
            on their code — not just a score, but a path forward.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '13px', flexShrink: 0,
                  background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa',
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
              Free forever — no credit card required
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: '45%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '60px 80px',
        position: 'relative',
      }}>

        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Top badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '6px 14px', borderRadius: '100px', marginBottom: '32px',
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa' }} />
            <span style={{ fontSize: '12px', color: '#c4b5fd', fontWeight: '500' }}>Join CodeClarity Free</span>
          </div>

          <h2 style={{
            fontSize: '32px', fontWeight: '700', color: 'white',
            letterSpacing: '-0.8px', marginBottom: '10px',
          }}>
            Create account
          </h2>
          <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '32px', lineHeight: '1.6' }}>
            Set up your account in under a minute
          </p>

          {error && (
            <div style={{
              marginBottom: '20px', padding: '14px 16px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5', fontSize: '14px',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {success && (
            <div style={{
              marginBottom: '20px', padding: '14px 16px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              color: '#86efac', fontSize: '14px',
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              Account created! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#94a3b8', marginBottom: '8px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="input-dark"
                style={{ width: '100%', padding: '13px 16px', fontSize: '15px', display: 'block' }}
                placeholder="Your full name"
                required
              />
            </div>

            {/* Username + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#94a3b8', marginBottom: '8px' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="input-dark"
                  style={{ width: '100%', padding: '13px 16px', fontSize: '15px', display: 'block' }}
                  placeholder="username"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#94a3b8', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-dark"
                  style={{ width: '100%', padding: '13px 16px', fontSize: '15px', display: 'block' }}
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#94a3b8', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-dark"
                  style={{ width: '100%', padding: '13px 48px 13px 16px', fontSize: '15px', display: 'block' }}
                  placeholder="Create a strong password"
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

            {/* Role selector */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#94a3b8', marginBottom: '10px' }}>
                I am a...
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['student', 'instructor'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    style={{
                      padding: '12px', borderRadius: '12px', fontSize: '14px',
                      fontWeight: '600', textTransform: 'capitalize', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      ...(form.role === r ? {
                        background: 'rgba(139,92,246,0.15)',
                        border: '1px solid rgba(139,92,246,0.4)',
                        color: '#c4b5fd',
                      } : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#374151',
                      })
                    }}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary"
              style={{
                width: '100%', padding: '15px', borderRadius: '12px', fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                boxShadow: '0 0 24px rgba(139,92,246,0.35)',
              }}
            >
              {loading
                ? <div style={{
                    width: '18px', height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                : <><span>Create Account</span><ArrowRight size={17} /></>
              }
            </button>
          </form>

          {/* Sign in link */}
          <div style={{
            marginTop: '24px', paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Already have an account? </span>
            <Link to="/login" style={{
              fontSize: '14px', color: '#a78bfa', fontWeight: '600', textDecoration: 'none',
            }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}