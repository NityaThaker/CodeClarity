import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAssignments } from '../../services/api'
import api from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import { FileText, ChevronRight, Clock, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react'

export default function Submissions() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/submissions/mine')
      setSubmissions(res.data)
    } catch (err) {
      setError('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    completed: { color: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', icon: <CheckCircle size={14} /> },
    pending: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', icon: <Clock size={14} /> },
    running: { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', icon: <Loader size={14} /> },
    failed: { color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: <XCircle size={14} /> },
  }

  const scoreColor = (score) => {
    if (score === null || score === undefined) return '#475569'
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
            My Submissions
          </h1>
          <p style={{ fontSize: '15px', color: '#475569' }}>
            All your past code submissions and their evaluation results
          </p>
        </div>

        {/* Table */}
        <div style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>Submission History</h2>
            <span style={{ fontSize: '13px', color: '#475569' }}>{submissions.length} total</span>
          </div>

          {loading ? (
            <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : error ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#f87171' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px' }}>{error}</p>
            </div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#374151' }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '6px' }}>No submissions yet</p>
              <p style={{ fontSize: '13px' }}>Go to an assignment and submit your first solution</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Assignment', 'Language', 'Score', 'Status', 'Submitted', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '11px 24px', textAlign: 'left',
                      fontSize: '11px', fontWeight: '600', color: '#374151',
                      textTransform: 'uppercase', letterSpacing: '0.6px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => {
                  const status = statusConfig[s.status] || statusConfig.pending
                  return (
                    <tr key={s.id}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>
                          Assignment #{s.assignment_id}
                        </p>
                        <p style={{ fontSize: '12px', color: '#374151', marginTop: '2px' }}>
                          Attempt #{s.attempt_number}
                        </p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          fontSize: '12px', fontWeight: '600', padding: '4px 10px',
                          borderRadius: '6px', background: 'rgba(255,255,255,0.06)',
                          color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)',
                          textTransform: 'capitalize',
                        }}>
                          {s.language}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          fontSize: '18px', fontWeight: '700',
                          color: scoreColor(s.final_score),
                        }}>
                          {s.final_score !== null && s.final_score !== undefined
                            ? `${Math.round(s.final_score)}%`
                            : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '12px', fontWeight: '600', padding: '5px 12px',
                          borderRadius: '20px', background: status.bg,
                          color: status.color, border: `1px solid ${status.border}`,
                          textTransform: 'capitalize',
                        }}>
                          {status.icon}
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ fontSize: '13px', color: '#475569' }}>
                          {new Date(s.submitted_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </p>
                        <p style={{ fontSize: '12px', color: '#374151', marginTop: '2px' }}>
                          {new Date(s.submitted_at).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {s.status === 'completed' && (
                          <button
                            onClick={() => navigate(`/results/${s.id}`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
                              fontWeight: '600', color: 'white', cursor: 'pointer',
                              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                              border: 'none', boxShadow: '0 0 16px rgba(59,130,246,0.25)',
                            }}
                          >
                            View Results <ChevronRight size={14} />
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
      </div>
    </div>
  )
}