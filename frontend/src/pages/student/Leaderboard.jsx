import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getInstructorOverview } from '../../services/api'
import api from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'

export default function Leaderboard() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaderboard')
      .then(res => setStudents(res.data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [])

  const rankConfig = {
    0: { icon: <Trophy size={18} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)' },
    1: { icon: <Medal size={18} />, color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)' },
    2: { icon: <Award size={18} />, color: '#fb923c', bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)' },
  }

  const scoreColor = (score) => {
    if (score >= 80) return '#4ade80'
    if (score >= 50) return '#fb923c'
    return '#f87171'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #fbbf24, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(251,191,36,0.3)',
          }}>
            <Trophy size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Leaderboard
          </h1>
          <p style={{ fontSize: '15px', color: '#475569' }}>
            See how you rank among your classmates
          </p>
        </div>

        <div style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>Class Rankings</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
              <TrendingUp size={14} />
              Ranked by best score
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '3px solid rgba(251,191,36,0.2)', borderTopColor: '#fbbf24',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : students.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#374151' }}>
              <Trophy size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '6px' }}>No rankings yet</p>
              <p style={{ fontSize: '13px' }}>Submit solutions to appear on the leaderboard</p>
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              {students.map((s, i) => {
                const rank = rankConfig[i]
                const isMe = s.name === (user?.full_name || user?.username)
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px', borderRadius: '12px', marginBottom: '8px',
                    transition: 'all 0.2s ease',
                    background: isMe ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                    border: isMe ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                  }}
                    onMouseEnter={e => {
                      if (!isMe) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    }}
                    onMouseLeave={e => {
                      if (!isMe) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    }}
                  >
                    {/* Rank */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      ...(rank ? {
                        background: rank.bg, border: `1px solid ${rank.border}`, color: rank.color,
                      } : {
                        background: 'rgba(255,255,255,0.06)',
                        color: '#475569',
                        fontSize: '14px', fontWeight: '700',
                      })
                    }}>
                      {rank ? rank.icon : `#${i + 1}`}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: isMe
                        ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                        : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', fontWeight: '700', color: isMe ? 'white' : '#64748b',
                    }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: isMe ? '#60a5fa' : '#e2e8f0' }}>
                          {s.name}
                        </p>
                        {isMe && (
                          <span style={{
                            fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                            borderRadius: '20px', background: 'rgba(59,130,246,0.2)',
                            color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)',
                          }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: '#374151', marginTop: '2px' }}>
                        {s.submissions} submission{s.submissions !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Score bar */}
                    <div style={{ width: '120px', flexShrink: 0 }}>
                      <div style={{
                        height: '6px', borderRadius: '3px',
                        background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '4px',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          width: `${s.best_score}%`,
                          background: s.best_score >= 80
                            ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                            : s.best_score >= 50
                            ? 'linear-gradient(90deg, #f97316, #fb923c)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                        }} />
                      </div>
                      <p style={{ fontSize: '11px', color: '#374151', textAlign: 'right' }}>
                        {s.best_score}% best
                      </p>
                    </div>

                    {/* Score */}
                    <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '60px' }}>
                      <span style={{
                        fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px',
                        color: scoreColor(s.best_score),
                      }}>
                        {s.best_score}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}