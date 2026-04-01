import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSubmissionResults, requestHint, getCodeAnalysis } from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import {
  CheckCircle, XCircle, AlertCircle, Clock,
  ChevronDown, ChevronUp, Lightbulb, RotateCcw,
  LayoutDashboard, Loader, GitBranch, Zap, Cpu,
  Star, Shield, TrendingUp, ArrowRight, Trophy,
  Code2, Activity
} from 'lucide-react'

function ScoreCircle({ score }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#4ade80' : score >= 50 ? '#fb923c' : '#f87171'
  const glowColor = score >= 80 ? 'rgba(74,222,128,0.4)' : score >= 50 ? 'rgba(251,146,60,0.4)' : 'rgba(248,113,113,0.4)'

  return (
    <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} width="140" height="140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)',
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '32px', fontWeight: '800', color: 'white', lineHeight: '1', letterSpacing: '-1px' }}>
          {Math.round(score)}
        </p>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', fontWeight: '500' }}>out of 100</p>
      </div>
    </div>
  )
}

function RequirementBar({ req, results, onRequestHint, hints }) {
  const [expanded, setExpanded] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)

  const reqResults = results.filter(r => r.requirement_id === req.id)
  const passed = reqResults.filter(r => r.status === 'passed').length
  const total = reqResults.length
  const passRate = total > 0 ? (passed / total) * 100 : 0

  const status = passRate >= 90 ? 'Met' : passRate >= 40 ? 'Partially Met' : 'Not Met'
  const statusConfig = {
    'Met': { color: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', barColor: '#22c55e' },
    'Partially Met': { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', barColor: '#f97316' },
    'Not Met': { color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', barColor: '#ef4444' },
  }
  const config = statusConfig[status]
  const hint = hints[req.id]

  const handleHint = async () => {
    if (hint || hintLoading) return
    setHintLoading(true)
    await onRequestHint(req.id)
    setHintLoading(false)
  }

  return (
    <div style={{
      background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px', overflow: 'hidden', marginBottom: '10px',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>{req.description}</p>
            <span style={{ fontSize: '12px', color: '#374151', flexShrink: 0 }}>({req.weight}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                width: `${passRate}%`, background: config.barColor,
                transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: `0 0 8px ${config.barColor}40`,
              }} />
            </div>
            <span style={{ fontSize: '12px', color: '#475569', flexShrink: 0, fontWeight: '600' }}>
              {Math.round(passRate)}%
            </span>
          </div>
        </div>
        <span style={{
          fontSize: '12px', fontWeight: '600', padding: '5px 12px', borderRadius: '20px',
          background: config.bg, color: config.color, border: `1px solid ${config.border}`,
          flexShrink: 0,
        }}>
          {status}
        </span>
        <span style={{ color: '#374151', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {reqResults.map((r, i) => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '8px',
                background: r.status === 'passed' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${r.status === 'passed' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}`,
              }}>
                {r.status === 'passed'
                  ? <CheckCircle size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
                  : r.status === 'timeout'
                  ? <Clock size={15} style={{ color: '#fb923c', flexShrink: 0 }} />
                  : <XCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                }
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Test Case {i + 1}</span>
                <span style={{
                  fontSize: '12px', fontWeight: '700',
                  color: r.status === 'passed' ? '#4ade80' : r.status === 'timeout' ? '#fb923c' : '#f87171',
                }}>
                  {r.status.toUpperCase()}
                </span>
                {r.actual_output && (
                  <span style={{ fontSize: '12px', color: '#374151', fontFamily: 'JetBrains Mono, monospace', marginLeft: 'auto' }}>
                    → {r.actual_output.substring(0, 30)}{r.actual_output.length > 30 ? '...' : ''}
                  </span>
                )}
                {r.execution_time_ms && (
                  <span style={{ fontSize: '11px', color: '#374151', flexShrink: 0 }}>
                    {Math.round(r.execution_time_ms)}ms
                  </span>
                )}
              </div>
            ))}
          </div>

          {status !== 'Met' && (
            hint ? (
              <div style={{
                padding: '14px 16px', borderRadius: '10px',
                background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
              }}>
                <Lightbulb size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#fde68a', lineHeight: '1.7' }}>{hint}</p>
              </div>
            ) : (
              <button
                onClick={handleHint}
                disabled={hintLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '10px', fontSize: '13px',
                  fontWeight: '600', cursor: hintLoading ? 'not-allowed' : 'pointer',
                  background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                  color: '#fbbf24', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                  opacity: hintLoading ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!hintLoading) e.currentTarget.style.background = 'rgba(251,191,36,0.15)' }}
                onMouseLeave={e => { if (!hintLoading) e.currentTarget.style.background = 'rgba(251,191,36,0.08)' }}
              >
                {hintLoading
                  ? <><Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Getting AI hint...</>
                  : <><Lightbulb size={13} /> Get AI Hint</>
                }
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

const CATEGORY_ICONS = {
  'Control Flow': <GitBranch size={17} />,
  'Time Complexity': <Clock size={17} />,
  'Memory Usage': <Cpu size={17} />,
  'Code Quality': <Star size={17} />,
  'Optimality': <Zap size={17} />,
  'Best Practices': <Shield size={17} />,
}

const CATEGORY_COLORS = {
  'Control Flow': { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)' },
  'Time Complexity': { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.2)' },
  'Memory Usage': { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.2)' },
  'Code Quality': { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.2)' },
  'Optimality': { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.2)' },
  'Best Practices': { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.2)' },
}

function ScoreMini({ score }) {
  const color = score >= 8 ? '#4ade80' : score >= 5 ? '#fb923c' : '#f87171'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${(score / 10) * 100}%`,
          background: color, borderRadius: '2px',
          transition: 'width 0.8s ease',
        }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: '700', color, flexShrink: 0 }}>
        {score?.toFixed(1)}/10
      </span>
    </div>
  )
}

function CodeIntelligenceSection({ submissionId }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let interval
    const fetch = async () => {
      try {
        const res = await getCodeAnalysis(submissionId)
        if (res.data.status === 'completed') {
          setAnalysis(res.data)
          setLoading(false)
          clearInterval(interval)
        } else if (res.data.status === 'failed') {
          setLoading(false)
          clearInterval(interval)
        }
      } catch (e) {}
    }
    fetch()
    interval = setInterval(fetch, 4000)
    return () => clearInterval(interval)
  }, [submissionId])

  return (
    <div style={{
      background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px', overflow: 'hidden', marginBottom: '16px',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59,130,246,0.3)',
          }}>
            <Activity size={18} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>Code Intelligence</h2>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>AI-powered deep code analysis</p>
          </div>
        </div>
        {analysis && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Score</p>
            <p style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {analysis.overall_score?.toFixed(1)}
              </span>
              <span style={{ fontSize: '14px', color: '#374151', fontWeight: '400' }}>/10</span>
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: '24px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '3px solid rgba(59,130,246,0.15)', borderTopColor: '#3b82f6',
              animation: 'spin 0.8s linear infinite', marginBottom: '16px',
            }} />
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
              Analyzing your code...
            </p>
            <p style={{ fontSize: '12px', color: '#374151' }}>This takes 10–20 seconds</p>
          </div>
        )}

        {!loading && analysis && (
          <>
            {/* Summary */}
            <div style={{
              padding: '16px 20px', borderRadius: '12px', marginBottom: '24px',
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
            }}>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.75' }}>{analysis.summary}</p>
            </div>

            {/* Category Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {analysis.categories?.map((cat, i) => {
                const catStyle = CATEGORY_COLORS[cat.name] || { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)' }
                return (
                  <div key={i} style={{
                    padding: '16px', borderRadius: '12px',
                    background: catStyle.bg, border: `1px solid ${catStyle.border}`,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: catStyle.color,
                      }}>
                        {CATEGORY_ICONS[cat.name]}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{cat.name}</span>
                    </div>
                    <ScoreMini score={cat.score} />
                    <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', marginTop: '10px' }}>
                      {cat.feedback}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Next Steps */}
            {analysis.next_steps && (
              <div style={{
                padding: '20px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <ArrowRight size={15} style={{ color: '#60a5fa' }} />
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Next Steps
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.75' }}>{analysis.next_steps}</p>
              </div>
            )}
          </>
        )}

        {!loading && !analysis && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '8px', color: '#374151' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '14px' }}>Analysis unavailable for this submission</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const { submissionId } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hints, setHints] = useState({})
  const [expandedTC, setExpandedTC] = useState(false)

  useEffect(() => { fetchResults() }, [submissionId])

  const fetchResults = async () => {
    try {
      const res = await getSubmissionResults(submissionId)
      setSubmission(res.data)
    } catch (err) {
      setError('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestHint = async (requirementId) => {
    try {
      const res = await requestHint(parseInt(submissionId), requirementId)
      setHints(prev => ({ ...prev, [requirementId]: res.data.hint }))
    } catch (err) {}
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: '14px', color: '#475569' }}>Loading results...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '8px', color: '#f87171' }}>
        <AlertCircle size={20} /><span>{error}</span>
      </div>
    </div>
  )

  const score = submission?.final_score ?? 0
  const requirementMap = {}
  submission?.results?.forEach(r => {
    if (!requirementMap[r.requirement_id]) {
      requirementMap[r.requirement_id] = {
        id: r.requirement_id,
        description: `Requirement ${r.requirement_id}`,
        weight: 0,
      }
    }
  })

  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Keep Trying'
  const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#60a5fa' : score >= 40 ? '#fb923c' : '#f87171'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px' }}>

        {/* ── HEADER CARD ── */}
        <div style={{
          borderRadius: '20px', padding: '32px', marginBottom: '20px',
          background: 'linear-gradient(135deg, #111118, #0d0d1a)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                background: 'rgba(255,255,255,0.06)', color: '#475569',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                SUB-{String(submission?.id).padStart(6, '0')}
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                background: 'rgba(255,255,255,0.06)', color: '#94a3b8', textTransform: 'capitalize',
              }}>
                {submission?.language}
              </span>
              <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                background: submission?.status === 'completed' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: submission?.status === 'completed' ? '#4ade80' : '#f87171',
                border: `1px solid ${submission?.status === 'completed' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                textTransform: 'uppercase',
              }}>
                {submission?.status}
              </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
                {new Date(submission?.submitted_at).toLocaleString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
              <p style={{ fontSize: '13px', color: '#374151' }}>
                Attempt #{submission?.attempt_number}
              </p>
            </div>

            {/* Score label */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '10px',
              background: `${scoreColor}15`, border: `1px solid ${scoreColor}30`,
            }}>
              <Trophy size={15} style={{ color: scoreColor }} />
              <span style={{ fontSize: '14px', fontWeight: '700', color: scoreColor }}>
                {scoreLabel}
              </span>
            </div>
          </div>

          <ScoreCircle score={score} />
        </div>

        {/* ── REQUIREMENT ANALYSIS ── */}
        <div style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '24px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Code2 size={16} style={{ color: '#475569' }} />
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>Requirement Analysis</h2>
          </div>
          {Object.keys(requirementMap).length === 0 ? (
            <p style={{ fontSize: '14px', color: '#374151' }}>No requirement data available.</p>
          ) : (
            Object.values(requirementMap).map(req => (
              <RequirementBar
                key={req.id} req={req}
                results={submission?.results || []}
                onRequestHint={handleRequestHint}
                hints={hints}
              />
            ))
          )}
        </div>

        {/* ── CODE INTELLIGENCE ── */}
        <CodeIntelligenceSection submissionId={submissionId} />

        {/* ── TEST CASE DETAILS ── */}
        <div style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', marginBottom: '16px', overflow: 'hidden',
        }}>
          <button
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
            onClick={() => setExpandedTC(!expandedTC)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={16} style={{ color: '#475569' }} />
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>Test Case Details</span>
            </div>
            {expandedTC ? <ChevronUp size={16} style={{ color: '#475569' }} /> : <ChevronDown size={16} style={{ color: '#475569' }} />}
          </button>

          {expandedTC && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['Test', 'Actual Output', 'Status', 'Time'].map(h => (
                      <th key={h} style={{
                        padding: '11px 24px', textAlign: 'left',
                        fontSize: '11px', fontWeight: '600', color: '#374151',
                        textTransform: 'uppercase', letterSpacing: '0.6px',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submission?.results?.map((r, i) => (
                    <tr key={r.id}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#475569' }}>
                        #{i + 1}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <code style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                          {r.actual_output || '—'}
                        </code>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          fontSize: '12px', fontWeight: '600', padding: '4px 10px',
                          borderRadius: '20px',
                          background: r.status === 'passed' ? 'rgba(34,197,94,0.1)' : r.status === 'timeout' ? 'rgba(251,146,60,0.1)' : 'rgba(239,68,68,0.1)',
                          color: r.status === 'passed' ? '#4ade80' : r.status === 'timeout' ? '#fb923c' : '#f87171',
                          border: `1px solid ${r.status === 'passed' ? 'rgba(34,197,94,0.2)' : r.status === 'timeout' ? 'rgba(251,146,60,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#374151' }}>
                        {r.execution_time_ms ? `${Math.round(r.execution_time_ms)}ms` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── ERRORS ── */}
        {submission?.results?.some(r => r.error_message) && (
          <div style={{
            background: '#111118', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '16px', padding: '24px', marginBottom: '16px',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
              Errors & Feedback
            </h2>
            {submission.results.filter(r => r.error_message).map((r, i) => (
              <div key={i} style={{
                padding: '16px', borderRadius: '10px', marginBottom: '10px',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <AlertCircle size={14} style={{ color: '#f87171' }} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#f87171', textTransform: 'uppercase' }}>
                    Runtime Error
                  </span>
                </div>
                <pre style={{
                  fontSize: '13px', color: '#fca5a5', fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0,
                }}>
                  {r.error_message}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '10px', fontSize: '14px',
              fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748b', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <LayoutDashboard size={16} />
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '10px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer', color: 'white',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none', boxShadow: '0 0 24px rgba(59,130,246,0.35)',
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.55)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.35)'}
          >
            <RotateCcw size={16} />
            Resubmit
          </button>
        </div>
      </div>
    </div>
  )
}