import { useState } from 'react'
import { getAssignmentAnalytics } from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { BarChart2, Search, Users, Trophy, AlertCircle, TrendingUp, Award } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#60a5fa', fontSize: '16px', fontWeight: '700' }}>{payload[0].value} students</p>
      </div>
    )
  }
  return null
}

export default function InstructorAnalytics() {
  const [assignmentId, setAssignmentId] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFetch = async () => {
    if (!assignmentId.trim()) return
    setLoading(true)
    setError('')
    setAnalytics(null)
    try {
      const res = await getAssignmentAnalytics(assignmentId)
      setAnalytics(res.data)
    } catch (err) {
      setError('Assignment not found or no data available')
    } finally {
      setLoading(false)
    }
  }

  const barColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']

  const scoreColor = (score) => {
    if (score >= 80) return '#4ade80'
    if (score >= 50) return '#fb923c'
    return '#f87171'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Class Analytics
          </h1>
          <p style={{ fontSize: '15px', color: '#475569' }}>
            Deep dive into assignment performance and student trends
          </p>
        </div>

        {/* Search */}
        <div style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px',
        }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8', marginBottom: '12px' }}>
            Enter Assignment ID to view analytics
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="number"
              value={assignmentId}
              onChange={e => setAssignmentId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="e.g. 1, 2, 3..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <button
              onClick={handleFetch}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '10px', fontSize: '14px',
                fontWeight: '600', color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none', opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.5)' }}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)'}
            >
              {loading ? (
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <Search size={16} />
              )}
              {loading ? 'Loading...' : 'Fetch Analytics'}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: '12px', padding: '12px 16px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '13px',
            }}>
              <AlertCircle size={15} />{error}
            </div>
          )}
        </div>

        {/* Analytics Results */}
        {analytics && (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { icon: <Users size={20} />, label: 'Total Submissions', value: analytics.total_submissions, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
                { icon: <TrendingUp size={20} />, label: 'Average Score', value: analytics.avg_score ? `${analytics.avg_score}%` : '—', color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
                { icon: <Award size={20} />, label: 'Students Participated', value: analytics.students?.length || 0, color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px', padding: '24px', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: '16px' }}>
                    {s.icon}
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '4px' }}>{s.value}</p>
                  <p style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Charts + Students Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

              {/* Score Distribution */}
              <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>Score Distribution</h2>
                <p style={{ fontSize: '13px', color: '#374151', marginBottom: '24px' }}>How students performed on this assignment</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.score_distribution} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {analytics.score_distribution?.map((_, i) => <Cell key={i} fill={barColors[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Common Errors */}
              <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Common Errors</h2>
                {analytics.common_errors?.length > 0 ? (
                  analytics.common_errors.map((e, i) => (
                    <div key={i} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>{e.type}</span>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>{e.count}</span>
                      </div>
                      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '2px',
                          width: `${(e.count / analytics.common_errors[0].count) * 100}%`,
                          background: 'linear-gradient(90deg, #f87171, #ef4444)',
                        }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#374151' }}>
                    <p style={{ fontSize: '14px' }}>No errors recorded for this assignment</p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Performance Table */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={16} style={{ color: '#fbbf24' }} />
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>Student Performance</h2>
              </div>
              {analytics.students?.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      {['Rank', 'Student', 'Best Score', 'Submissions', 'Last Active'].map(h => (
                        <th key={h} style={{ padding: '11px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.students.map((s, i) => (
                      <tr key={i}
                        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{
                            fontSize: '13px', fontWeight: '700',
                            color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#fb923c' : '#374151',
                          }}>
                            #{i + 1}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white' }}>
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: scoreColor(s.best_score) }}>
                            {s.best_score}%
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#475569' }}>
                          {s.submissions}
                        </td>
                        <td style={{ padding: '14px 24px', fontSize: '13px', color: '#374151' }}>
                          {s.last_active}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', color: '#374151' }}>
                  <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                  <p style={{ fontSize: '14px' }}>No student submissions yet for this assignment</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {!analytics && !loading && !error && (
          <div style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '80px', textAlign: 'center',
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#60a5fa' }}>
              <BarChart2 size={28} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Enter an Assignment ID above</p>
            <p style={{ fontSize: '14px', color: '#374151' }}>Analytics will appear here once you fetch an assignment</p>
          </div>
        )}

      </div>
    </div>
  )
}