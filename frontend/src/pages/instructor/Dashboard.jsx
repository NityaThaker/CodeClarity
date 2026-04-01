import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMyAssignments, deleteAssignment, publishAssignment, getInstructorOverview
} from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  Plus, Trash2, BarChart2, Edit3, CheckCircle,
  AlertCircle, BookOpen, TrendingUp,
  FileText, Eye, Users, Award, Clock
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
        <p style={{ color: '#60a5fa', fontSize: '16px', fontWeight: '700' }}>{payload[0].value}</p>
      </div>
    )
  }
  return null
}

function StatCard({ icon, label, value, color, iconBg, sub, trend }) {
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
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
      <p style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '4px' }}>
        {value}
      </p>
      <p style={{ fontSize: '13px', color: '#475569', fontWeight: '500', marginBottom: sub ? '4px' : 0 }}>{label}</p>
      {sub && <p style={{ fontSize: '12px', color: '#94a3b8' }}>{sub}</p>}
    </div>
  )
}

export default function InstructorDashboard() {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [publishingId, setPublishingId] = useState(null)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const [assignRes, overviewRes] = await Promise.all([
        getMyAssignments(),
        getInstructorOverview(),
      ])
      setAssignments(assignRes.data)
      setOverview(overviewRes.data)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return
    setDeletingId(id)
    try {
      await deleteAssignment(id)
      setAssignments(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete assignment')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePublish = async (id) => {
    setPublishingId(id)
    try {
      await publishAssignment(id)
      setAssignments(prev =>
        prev.map(a => a.id === id ? { ...a, is_published: true } : a)
      )
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to publish assignment')
    } finally {
      setPublishingId(null)
    }
  }

  const published = assignments.filter(a => a.is_published).length
  const drafts = assignments.filter(a => !a.is_published).length

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Submissions', 'Best Score', 'Last Active']
    const rows = (overview?.students || []).map(s => [
      s.name, s.submissions, `${s.best_score}%`, s.last_active
    ])
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_performance.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const scoreDistribution = overview?.score_distribution?.length > 0 
    ? overview.score_distribution 
    : [
        { range: '0-20', count: 0, color: '#ef4444' },
        { range: '21-40', count: 0, color: '#f97316' },
        { range: '41-60', count: 0, color: '#eab308' },
        { range: '61-80', count: 0, color: '#22c55e' },
        { range: '81-100', count: 0, color: '#16a34a' },
      ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px' }}>
                Instructor Dashboard
              </h1>
            </div>
            <p style={{ fontSize: '15px', color: '#475569' }}>
              Manage assignments and track student progress
            </p>
          </div>
          <button
            onClick={() => navigate('/instructor/create')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '12px', fontSize: '14px',
              fontWeight: '600', color: 'white', cursor: 'pointer',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none', transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.6)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.4)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Plus size={18} />
            Create Assignment
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <StatCard
            icon={<BookOpen size={20} />}
            label="Total Assignments"
            value={loading ? '—' : assignments.length}
            color="#60a5fa" iconBg="rgba(59,130,246,0.12)"
            sub={`${published} published`}
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            label="Published"
            value={published}
            color="#4ade80" iconBg="rgba(34,197,94,0.12)"
            sub="Live assignments"
          />
          <StatCard
            icon={<FileText size={20} />}
            label="Drafts"
            value={drafts}
            color="#fb923c" iconBg="rgba(251,146,60,0.12)"
            sub="Unpublished"
          />
          <StatCard
            icon={<Award size={20} />}
            label="Class Avg Score"
            value={overview?.avg_score ? `${overview.avg_score}%` : '—'}
            color="#c084fc" iconBg="rgba(192,132,252,0.12)"
            sub="Across all assignments"
          />
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '20px' }}>

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
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {assignments.length} total
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            ) : error ? (
              <div style={{ padding: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#f87171' }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: '14px' }}>{error}</span>
              </div>
            ) : assignments.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#374151' }}>
                <BookOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: '14px', fontWeight: '500' }}>No assignments yet</p>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Click "Create Assignment" to get started</p>
                <button
                  onClick={() => navigate('/instructor/create')}
                  style={{
                    marginTop: '16px', padding: '10px 20px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: '600', color: 'white',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
                  }}
                >
                  Create your first assignment
                </button>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      {['Title', 'Status', 'Difficulty', 'Deadline', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '11px 24px', textAlign: 'left',
                          fontSize: '11px', fontWeight: '600', color: '#374151',
                          textTransform: 'uppercase', letterSpacing: '0.6px',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => {
                      const diff = difficultyConfig[a.difficulty_level] || difficultyConfig.medium
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
                            {a.is_published ? (
                              <span style={{
                                fontSize: '12px', fontWeight: '600', padding: '6px 12px',
                                borderRadius: '20px', background: 'rgba(34,197,94,0.1)',
                                color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)',
                              }}>
                                PUBLISHED
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '12px', fontWeight: '600', padding: '6px 12px',
                                borderRadius: '20px', background: 'rgba(255,255,255,0.06)',
                                color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
                              }}>
                                DRAFT
                              </span>
                            )}
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
                            <span style={{ fontSize: '13px', color: '#475569' }}>
                              {a.deadline ? new Date(a.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {!a.is_published && (
                                <button
                                  onClick={() => handlePublish(a.id)}
                                  disabled={publishingId === a.id}
                                  style={{
                                    padding: '8px', borderRadius: '8px', border: 'none',
                                    color: publishingId === a.id ? '#475569' : '#4ade80',
                                    background: publishingId === a.id ? 'rgba(255,255,255,0.04)' : 'rgba(34,197,94,0.1)',
                                    cursor: publishingId === a.id ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease', minWidth: '36px', height: '36px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                  title="Publish"
                                >
                                  {publishingId === a.id ? (
                                    <div style={{
                                      width: '16px', height: '16px', borderRadius: '50%',
                                      border: '2px solid rgba(34,197,94,0.3)', borderTopColor: '#4ade80',
                                      animation: 'spin 0.8s linear infinite',
                                    }} />
                                  ) : (
                                    <Eye size={16} />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/instructor/edit/${a.id}`)}
                                style={{
                                  padding: '8px', borderRadius: '8px', border: 'none',
                                  color: '#60a5fa', background: 'rgba(59,130,246,0.1)',
                                  cursor: 'pointer', transition: 'all 0.2s ease',
                                  minWidth: '36px', height: '36px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = 'rgba(59,130,246,0.2)'
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = 'rgba(59,130,246,0.1)'
                                }}
                                title="Edit"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => navigate(`/instructor/analytics/${a.id}`)}
                                style={{
                                  padding: '8px', borderRadius: '8px', border: 'none',
                                  color: '#c084fc', background: 'rgba(192,132,252,0.1)',
                                  cursor: 'pointer', transition: 'all 0.2s ease',
                                  minWidth: '36px', height: '36px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = 'rgba(192,132,252,0.2)'
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = 'rgba(192,132,252,0.1)'
                                }}
                                title="Analytics"
                              >
                                <BarChart2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(a.id)}
                                disabled={deletingId === a.id}
                                style={{
                                  padding: '8px', borderRadius: '8px', border: 'none',
                                  color: deletingId === a.id ? '#475569' : '#f87171',
                                  background: deletingId === a.id ? 'rgba(255,255,255,0.04)' : 'rgba(239,68,68,0.1)',
                                  cursor: deletingId === a.id ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease', minWidth: '36px', height: '36px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                                onMouseEnter={e => {
                                  if (deletingId !== a.id) {
                                    e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (deletingId !== a.id) {
                                    e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                                  }
                                }}
                                title="Delete"
                              >
                                {deletingId === a.id ? (
                                  <div style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    border: '2px solid rgba(239,68,68,0.3)', borderTopColor: '#f87171',
                                    animation: 'spin 0.8s linear infinite',
                                  }} />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Student Performance Table */}
          <div style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>Top Students</h2>
                <p style={{ fontSize: '13px', color: '#374151' }}>
                  {overview?.students?.length || 0} active students
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px', fontSize: '13px',
                  fontWeight: '600', color: '#60a5fa', cursor: 'pointer',
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.1)'
                }}
              >
                <FileText size={14} />
                Export CSV
              </button>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '12px' }}>
              {(overview?.students?.length > 0 ? overview.students.slice(0, 8) : []).map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', borderRadius: '10px', marginBottom: '6px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#60a5fa',
                  }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontSize: '13px', fontWeight: '500', color: '#e2e8f0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {s.name}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#4ade80' }}>
                      {s.best_score}%
                    </p>
                    <p style={{ fontSize: '11px', color: '#475569' }}>
                      {s.submissions} subs
                    </p>
                  </div>
                </div>
              ))}
              {(!overview?.students?.length) && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#374151' }}>
                  <Users size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <p style={{ fontSize: '13px' }}>No student data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
          {/* Score Distribution */}
          <div style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '24px',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>
                Score Distribution
              </h2>
              <p style={{ fontSize: '13px', color: '#374151' }}>
                Performance across all assignments
              </p>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistribution} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: '#374151' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#374151' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Common Errors */}
          <div style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '24px',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
              Common Errors
            </h2>
            {[
              { type: 'Syntax Error', count: 23, students: 15 },
              { type: 'Index Out of Bounds', count: 18, students: 12 },
              { type: 'Null Pointer', count: 14, students: 10 },
              { type: 'Type Mismatch', count: 11, students: 8 },
              { type: 'Timeout', count: 7, students: 5 },
            ].map((e, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '12px',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>{e.type}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{e.count}</span>
                  <span style={{ fontSize: '11px', color: '#475569' }}> ({e.students} students)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
