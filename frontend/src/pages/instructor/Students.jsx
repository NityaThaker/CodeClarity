import { useState, useEffect } from 'react'
import { getInstructorOverview } from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import { Users, Search, Trophy, TrendingUp, Award, FileText } from 'lucide-react'

export default function Students() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getInstructorOverview()
      .then(res => setOverview(res.data))
      .finally(() => setLoading(false))
  }, [])

  const students = overview?.students || []
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const scoreColor = (score) => {
    if (score >= 80) return '#4ade80'
    if (score >= 50) return '#fb923c'
    return '#f87171'
  }

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Submissions', 'Best Score', 'Last Active']
    const rows = students.map(s => [s.name, s.submissions, `${s.best_score}%`, s.last_active])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              Students
            </h1>
            <p style={{ fontSize: '15px', color: '#475569' }}>
              Monitor and manage your students' performance
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '12px', fontSize: '14px',
              fontWeight: '600', color: '#60a5fa', cursor: 'pointer',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
          >
            <FileText size={16} /> Export CSV
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: <Users size={20} />, label: 'Total Students', value: students.length, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
            { icon: <TrendingUp size={20} />, label: 'Avg Best Score', value: students.length > 0 ? `${Math.round(students.reduce((s, st) => s + st.best_score, 0) / students.length)}%` : '—', color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
            { icon: <Award size={20} />, label: 'Top Scorer', value: students.length > 0 ? `${students[0]?.best_score}%` : '—', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
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
              <p style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {loading ? '—' : s.value}
              </p>
              <p style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trophy size={16} style={{ color: '#fbbf24' }} />
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>All Students</h2>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#374151' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search students..."
                style={{
                  padding: '8px 14px 8px 34px', borderRadius: '8px', fontSize: '13px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', outline: 'none', width: '200px', fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#374151' }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '6px' }}>
                {search ? 'No students match your search' : 'No student data yet'}
              </p>
              <p style={{ fontSize: '13px' }}>
                {search ? 'Try a different search term' : 'Students will appear here once they submit solutions'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Rank', 'Student', 'Best Score', 'Submissions', 'Performance', 'Last Active'].map(h => (
                    <th key={h} style={{ padding: '11px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const origRank = students.findIndex(st => st.name === s.name)
                  return (
                    <tr key={i}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          fontSize: '14px', fontWeight: '700',
                          color: origRank === 0 ? '#fbbf24' : origRank === 1 ? '#94a3b8' : origRank === 2 ? '#fb923c' : '#374151',
                        }}>
                          #{origRank + 1}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: '700', color: 'white',
                          }}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '700', color: scoreColor(s.best_score) }}>
                          {s.best_score}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>
                        {s.submissions}
                      </td>
                      <td style={{ padding: '16px 24px', minWidth: '140px' }}>
                        <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${s.best_score}%`, borderRadius: '3px',
                            background: s.best_score >= 80
                              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                              : s.best_score >= 50
                              ? 'linear-gradient(90deg, #f97316, #fb923c)'
                              : 'linear-gradient(90deg, #ef4444, #f87171)',
                            transition: 'width 0.8s ease',
                          }} />
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#374151' }}>
                        {s.last_active}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}