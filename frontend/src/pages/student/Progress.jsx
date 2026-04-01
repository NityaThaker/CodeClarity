import { useState, useEffect } from 'react'
import { getStudentAnalytics } from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { TrendingUp, Target, Zap, Award } from 'lucide-react'

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

export default function Progress() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudentAnalytics()
      .then(res => setAnalytics(res.data))
      .finally(() => setLoading(false))
  }, [])

  const scoreTrend = analytics?.score_trend?.length > 0
    ? analytics.score_trend
    : [{ name: 'No data', score: 0 }]

  const avgScore = analytics?.avg_score || 0
  const radarData = [
    { subject: 'Consistency', A: Math.min(100, (analytics?.total_submissions || 0) * 10) },
    { subject: 'Avg Score', A: avgScore },
    { subject: 'Completion', A: Math.min(100, (analytics?.completed || 0) * 20) },
    { subject: 'Activity', A: Math.min(100, (analytics?.total_submissions || 0) * 8) },
    { subject: 'Improvement', A: scoreTrend.length > 1 ? Math.max(0, (scoreTrend[scoreTrend.length - 1]?.score || 0) - (scoreTrend[0]?.score || 0) + 50) : 50 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            My Progress
          </h1>
          <p style={{ fontSize: '15px', color: '#475569' }}>
            Track your improvement over time across all assignments
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: <TrendingUp size={20} />, label: 'Total Submissions', value: analytics?.total_submissions ?? '—', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
            { icon: <Target size={20} />, label: 'Average Score', value: analytics?.avg_score ? `${analytics.avg_score}%` : '—', color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
            { icon: <Award size={20} />, label: 'Completed', value: analytics?.completed ?? '—', color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
            { icon: <Zap size={20} />, label: 'Best Score', value: analytics?.score_trend?.length > 0 ? `${Math.max(...analytics.score_trend.map(s => s.score))}%` : '—', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '24px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: s.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: s.color, marginBottom: '16px',
              }}>
                {s.icon}
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {loading ? '—' : s.value}
              </p>
              <p style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>

          {/* Score Trend */}
          <div style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '24px',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>Score Trend</h2>
            <p style={{ fontSize: '13px', color: '#374151', marginBottom: '24px' }}>Your score across all submissions</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={scoreTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5}
                  fill="url(#progressGradient)"
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#60a5fa', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Radar */}
          <div style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '24px',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>Skills Overview</h2>
            <p style={{ fontSize: '13px', color: '#374151', marginBottom: '16px' }}>Your performance across dimensions</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#374151' }} />
                <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Submission History Timeline */}
        <div style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '24px', marginTop: '20px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Submission Timeline</h2>
          {scoreTrend.length <= 1 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#374151' }}>
              <p style={{ fontSize: '14px' }}>No submission history yet. Submit your first solution to see your timeline.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scoreTrend.slice().reverse().map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '14px 16px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: s.score >= 80 ? 'rgba(34,197,94,0.15)' : s.score >= 50 ? 'rgba(251,146,60,0.15)' : 'rgba(239,68,68,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700',
                    color: s.score >= 80 ? '#4ade80' : s.score >= 50 ? '#fb923c' : '#f87171',
                    flexShrink: 0,
                  }}>
                    {s.name}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: '6px', borderRadius: '3px',
                      background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '3px',
                        width: `${s.score}%`,
                        background: s.score >= 80 ? 'linear-gradient(90deg, #22c55e, #4ade80)' :
                          s.score >= 50 ? 'linear-gradient(90deg, #f97316, #fb923c)' :
                          'linear-gradient(90deg, #ef4444, #f87171)',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                  <span style={{
                    fontSize: '16px', fontWeight: '700', flexShrink: 0,
                    color: s.score >= 80 ? '#4ade80' : s.score >= 50 ? '#fb923c' : '#f87171',
                  }}>
                    {s.score}%
                  </span>
                  {s.date && (
                    <span style={{ fontSize: '12px', color: '#374151', flexShrink: 0 }}>{s.date}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}