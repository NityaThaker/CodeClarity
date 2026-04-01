import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAssignments, getStudentAnalytics } from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import {
  BookOpen, CheckCircle, BarChart2, Award,
  Clock, ChevronRight, AlertCircle, ArrowUpRight,
  Calendar, Flame
} from 'lucide-react'

const difficultyConfig = {
  easy: { label: 'Easy', bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  medium: { label: 'Medium', bg: 'rgba(251,146,60,0.12)', color: '#fb923c', border: 'rgba(251,146,60,0.25)' },
  hard: { label: 'Hard', bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '12px 16px',
      }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#60a5fa', fontSize: '16px', fontWeight: '700' }}>{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

function StatCard({ icon, label, value, color, iconBg, trend }) {
  return (
    <div style={{
      background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px', padding: '24px', transition: 'all 0.2s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </div>
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', color: '#4ade80', fontWeight: '500',
          }}>
            <ArrowUpRight size={12} />
            {trend}
          </div>
        )}
      </div>
      <p style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '4px' }}>
        {value}
      </p>
      <p style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{label}</p>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [assignRes, analyticsRes] = await Promise.all([
        getAssignments(), getStudentAnalytics(),
      ])
      setAssignments(assignRes.data)
      setAnalytics(analyticsRes.data)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )
  const upcoming = assignments
    .filter(a => a.deadline && new Date(a.deadline) > now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4)

  const daysUntil = (deadline) => {
    const diff = new Date(deadline) - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const scoreTrend = analytics?.score_trend?.length > 0
    ? analytics.score_trend
    : [{ name: 'No data', score: 0 }]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px' }}>
              Welcome back, {user?.full_name?.split(' ')[0] || user?.username}
            </h1>
            <span style={{ fontSize: '24px' }}>👋</span>
          </div>
          <p style={{ fontSize: '15px', color: '#475569' }}>
            Here's what's happening with your assignments today.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <StatCard
            icon={<BookOpen size={20} />}
            label="Active Assignments"
            value={loading ? '—' : assignments.length}
            color="#60a5fa" iconBg="rgba(59,130,246,0.12)"
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            label="Submissions Made"
            value={analytics?.total_submissions ?? '—'}
            color="#4ade80" iconBg="rgba(34,197,94,0.12)"
            trend={analytics?.total_submissions > 0 ? 'Active' : null}
          />
          <StatCard
            icon={<BarChart2 size={20} />}
            label="Average Score"
            value={analytics?.avg_score ? `${analytics.avg_score}%` : '—'}
            color="#fb923c" iconBg="rgba(251,146,60,0.12)"
          />
          <StatCard
            icon={<Award size={20} />}
            label="Completed"
            value={analytics?.completed ?? '—'}
            color="#c084fc" iconBg="rgba(192,132,252,0.12)"
          />
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px' }}>

          {/* Assignments Table */}
          <div style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>My Assignments</h2>
              <div style={{ position: 'relative' }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search assignments..."
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', padding: '7px 14px', fontSize: '13px',
                    color: 'white', outline: 'none', width: '200px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#374151' }}>
                <BookOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: '14px' }}>No assignments found</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['Assignment', 'Deadline', 'Difficulty', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '11px 24px', textAlign: 'left',
                        fontSize: '11px', fontWeight: '600', color: '#374151',
                        textTransform: 'uppercase', letterSpacing: '0.6px',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const diff = difficultyConfig[a.difficulty_level] || difficultyConfig.medium
                    const isPast = a.deadline && new Date(a.deadline) < now
                    return (
                      <tr key={a.id}
                        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 24px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '3px' }}>
                            {a.title}
                          </p>
                          {a.description && (
                            <p style={{ fontSize: '12px', color: '#374151', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.description}
                            </p>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ fontSize: '13px', color: '#475569' }}>
                            {a.deadline ? new Date(a.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            fontSize: '12px', fontWeight: '600', padding: '4px 10px',
                            borderRadius: '6px', background: diff.bg,
                            color: diff.color, border: `1px solid ${diff.border}`,
                          }}>
                            {diff.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {isPast ? (
                            <span style={{
                              fontSize: '12px', color: '#374151', padding: '6px 12px',
                              borderRadius: '8px', background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}>Closed</span>
                          ) : (
                            <button
                              onClick={() => navigate(`/assignments/${a.id}`)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
                                fontWeight: '600', color: 'white', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                border: 'none', transition: 'all 0.2s ease',
                                boxShadow: '0 0 16px rgba(59,130,246,0.25)',
                              }}
                              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.5)'}
                              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(59,130,246,0.25)'}
                            >
                              Submit <ChevronRight size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Calendar size={16} style={{ color: '#475569' }} />
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>Upcoming Deadlines</h2>
            </div>

            <div style={{ padding: '12px' }}>
              {upcoming.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#374151' }}>
                  <Clock size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <p style={{ fontSize: '13px' }}>No upcoming deadlines</p>
                </div>
              ) : (
                upcoming.map(a => {
                  const days = daysUntil(a.deadline)
                  const urgentColor = days <= 2 ? '#f87171' : days <= 7 ? '#fb923c' : '#4ade80'
                  const urgentBg = days <= 2 ? 'rgba(239,68,68,0.1)' : days <= 7 ? 'rgba(251,146,60,0.1)' : 'rgba(34,197,94,0.1)'
                  return (
                    <div
                      key={a.id}
                      onClick={() => navigate(`/assignments/${a.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                        transition: 'background 0.15s', marginBottom: '4px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: urgentColor, flexShrink: 0,
                        }} />
                        <p style={{
                          fontSize: '13px', fontWeight: '500', color: '#cbd5e1',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {a.title}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '12px', fontWeight: '700', padding: '3px 10px',
                        borderRadius: '20px', background: urgentBg, color: urgentColor,
                        flexShrink: 0, marginLeft: '8px',
                      }}>
                        {days}d
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Streak indicator */}
            <div style={{
              margin: '8px 12px 12px', padding: '16px',
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Flame size={16} style={{ color: '#fb923c' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Keep it up!</span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                You have {analytics?.total_submissions || 0} submission{analytics?.total_submissions !== 1 ? 's' : ''} so far.
                {analytics?.avg_score > 0 ? ` Your average is ${analytics.avg_score}%.` : ' Submit your first solution!'}
              </p>
            </div>
          </div>
        </div>

        {/* Score Trend */}
        <div style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>Score Trend</h2>
              <p style={{ fontSize: '13px', color: '#374151' }}>
                {analytics?.total_submissions ?? 0} total submissions
              </p>
            </div>
            {analytics?.avg_score > 0 && (
              <div style={{
                padding: '8px 16px', borderRadius: '20px',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#60a5fa' }}>
                  Avg: {analytics.avg_score}%
                </span>
              </div>
            )}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={scoreTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="score"
                stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#scoreGradient)"
                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#60a5fa', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}