import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAssignment, submitCode, getSubmissionResults } from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import Editor from '@monaco-editor/react'
import {
  ChevronDown, Send, Clock, AlertCircle,
  Loader, Tag, CheckCircle, Code2,
  BookOpen, ChevronUp, Play
} from 'lucide-react'

const LANGUAGES = [
  { value: 'python', label: 'Python', monacoLang: 'python', color: '#3b82f6' },
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript', color: '#fbbf24' },
  { value: 'java', label: 'Java', monacoLang: 'java', color: '#fb923c' },
  { value: 'cpp', label: 'C++', monacoLang: 'cpp', color: '#a78bfa' },
]

const DEFAULT_CODE = {
  python: '# Write your solution here\n\ndef solution():\n    pass\n',
  javascript: '// Write your solution here\n\nfunction solution() {\n    \n}\n',
  java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
}

const difficultyConfig = {
  easy: { label: 'Easy', color: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
  medium: { label: 'Medium', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.25)' },
  hard: { label: 'Hard', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
}

export default function AssignmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState(DEFAULT_CODE.python)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [reqOpen, setReqOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('problem')

  useEffect(() => { fetchAssignment() }, [id])

  const fetchAssignment = async () => {
    try {
      const res = await getAssignment(id)
      setAssignment(res.data)
    } catch (err) {
      setError('Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(DEFAULT_CODE[lang])
    setShowLangDropdown(false)
  }

  const handleSubmit = async () => {
    if (!code.trim()) return
    setSubmitting(true)
    setSubmitStatus({ type: 'pending', message: 'Submitting your code...' })
    try {
      const res = await submitCode({ assignment_id: parseInt(id), language, code })
      const submissionId = res.data.submission_id
      setAttempts(prev => prev + 1)
      setSubmitStatus({ type: 'queued', message: 'Evaluating your solution...' })
      let pollCount = 0
      const poll = setInterval(async () => {
        pollCount++
        try {
          const result = await getSubmissionResults(submissionId)
          if (result.data.status === 'completed' || result.data.status === 'failed') {
            clearInterval(poll)
            setSubmitting(false)
            navigate(`/results/${submissionId}`)
          }
        } catch (e) {}
        if (pollCount > 30) {
          clearInterval(poll)
          setSubmitting(false)
          setSubmitStatus({ type: 'error', message: 'Evaluation timed out. Please try again.' })
        }
      }, 2000)
    } catch (err) {
      setSubmitting(false)
      setSubmitStatus({
        type: 'error',
        message: err.response?.data?.detail || 'Submission failed. Please try again.'
      })
    }
  }

  const selectedLang = LANGUAGES.find(l => l.value === language)
  const diff = assignment ? (difficultyConfig[assignment.difficulty_level] || difficultyConfig.medium) : null

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6',
        animation: 'spin 0.8s linear infinite',
      }} />
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

  return (
    <div style={{ height: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: '42%', display: 'flex', flexDirection: 'column',
          background: '#0d0d14', borderRight: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>

          {/* Assignment Header */}
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: '#0d0d14',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              {diff && (
                <span style={{
                  fontSize: '12px', fontWeight: '600', padding: '4px 10px',
                  borderRadius: '6px', background: diff.bg,
                  color: diff.color, border: `1px solid ${diff.border}`,
                }}>
                  {diff.label}
                </span>
              )}
              {assignment?.deadline && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569' }}>
                  <Clock size={12} />
                  Due {new Date(assignment.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'white', letterSpacing: '-0.3px', lineHeight: '1.3' }}>
              {assignment?.title}
            </h1>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '0 24px',
          }}>
            {[
              { id: 'problem', label: 'Problem', icon: <BookOpen size={14} /> },
              { id: 'requirements', label: 'Requirements', icon: <CheckCircle size={14} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '12px 16px', fontSize: '13px', fontWeight: '500',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: activeTab === tab.id ? '#60a5fa' : '#475569',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

            {activeTab === 'problem' && (
              <div>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '24px' }}>
                  {assignment?.description || 'No description provided.'}
                </p>

                {/* Sample Test Cases */}
                {assignment?.requirements?.some(r => r.test_cases?.some(t => t.is_sample)) && (
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>
                      Sample Test Cases
                    </h3>
                    {assignment.requirements.map(req =>
                      req.test_cases?.filter(t => t.is_sample).map((tc, i) => (
                        <div key={tc.id} style={{
                          background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px', padding: '16px', marginBottom: '12px',
                        }}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Test Case {i + 1}
                          </p>
                          {tc.input_data && (
                            <div style={{ marginBottom: '10px' }}>
                              <p style={{ fontSize: '11px', color: '#374151', marginBottom: '6px', fontWeight: '600' }}>INPUT</p>
                              <div style={{
                                background: '#0a0a0f', borderRadius: '8px', padding: '10px 14px',
                                fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#e2e8f0',
                                border: '1px solid rgba(255,255,255,0.06)',
                              }}>
                                {tc.input_data}
                              </div>
                            </div>
                          )}
                          <div>
                            <p style={{ fontSize: '11px', color: '#374151', marginBottom: '6px', fontWeight: '600' }}>EXPECTED OUTPUT</p>
                            <div style={{
                              background: '#0a0a0f', borderRadius: '8px', padding: '10px 14px',
                              fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#4ade80',
                              border: '1px solid rgba(34,197,94,0.15)',
                            }}>
                              {tc.expected_output}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requirements' && (
              <div>
                <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
                  Your solution will be evaluated against these requirements. Each requirement carries a weight towards your final score.
                </p>
                {assignment?.requirements?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {assignment.requirements.map((req, i) => (
                      <div key={req.id} style={{
                        background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '12px', padding: '16px',
                        transition: 'border-color 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '24px', height: '24px', borderRadius: '6px',
                              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: '700', color: '#60a5fa',
                            }}>
                              {i + 1}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>
                              {req.description}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '12px', fontWeight: '700', padding: '3px 10px',
                            borderRadius: '20px', background: 'rgba(59,130,246,0.1)',
                            color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)',
                            flexShrink: 0, marginLeft: '12px',
                          }}>
                            {req.weight}%
                          </span>
                        </div>
                        <div style={{
                          height: '4px', borderRadius: '2px',
                          background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', width: `${req.weight}%`,
                            background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                            borderRadius: '2px',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#374151', fontSize: '14px' }}>No requirements defined.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL — Editor ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>

          {/* Editor Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', height: '48px',
            background: '#0d0d14', borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Language Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer', border: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  color: selectedLang?.color || 'white',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                <Code2 size={14} />
                {selectedLang?.label}
                <ChevronDown size={13} />
              </button>

              {showLangDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
                  background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', overflow: 'hidden', minWidth: '160px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => handleLanguageChange(lang.value)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '10px 16px',
                        fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                        border: 'none', background: language === lang.value ? 'rgba(59,130,246,0.15)' : 'none',
                        color: language === lang.value ? lang.color : '#94a3b8',
                        transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}
                      onMouseEnter={e => { if (language !== lang.value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={e => { if (language !== lang.value) e.currentTarget.style.background = 'none' }}
                    >
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: lang.color, flexShrink: 0,
                      }} />
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right side info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151' }}>
                <Tag size={12} />
                <span>Attempt <strong style={{ color: '#94a3b8' }}>{attempts}</strong></span>
              </div>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: submitting ? '#fb923c' : '#4ade80',
                boxShadow: submitting ? '0 0 8px #fb923c' : '0 0 8px #4ade80',
              }} />
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={selectedLang?.monacoLang}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                padding: { top: 20, bottom: 20 },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                tabSize: 4,
                wordWrap: 'on',
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
              }}
            />
          </div>

          {/* Submit Bar */}
          <div style={{
            padding: '12px 16px',
            background: '#0d0d14', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {submitStatus && (
              <div style={{
                marginBottom: '10px', padding: '10px 14px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '13px',
                ...(submitStatus.type === 'error'
                  ? { background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
                  : { background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }
                )
              }}>
                {submitStatus.type === 'error'
                  ? <AlertCircle size={14} />
                  : <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                }
                {submitStatus.message}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                fontSize: '15px', fontWeight: '700', color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                border: 'none', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                background: submitting
                  ? 'rgba(59,130,246,0.3)'
                  : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                boxShadow: submitting ? 'none' : '0 0 24px rgba(59,130,246,0.35)',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif', letterSpacing: '-0.1px',
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.55)' }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.35)' }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Evaluating your solution...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Submit for Evaluation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}