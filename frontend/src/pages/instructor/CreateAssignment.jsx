import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createAssignment, createRequirement, createTestCase, publishAssignment
} from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import {
  Plus, Trash2, ChevronRight, ChevronLeft,
  CheckCircle, AlertCircle, Loader, Save,
  BookOpen, List, TestTube, Rocket
} from 'lucide-react'

const STEPS = [
  { label: 'Details', icon: <BookOpen size={16} /> },
  { label: 'Requirements', icon: <List size={16} /> },
  { label: 'Test Cases', icon: <TestTube size={16} /> },
  { label: 'Publish', icon: <Rocket size={16} /> },
]

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
      {STEPS.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', transition: 'all 0.3s ease',
              ...(i < current ? {
                background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                border: '1px solid rgba(34,197,94,0.3)',
              } : i === current ? {
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white', boxShadow: '0 0 20px rgba(59,130,246,0.4)',
                border: 'none',
              } : {
                background: 'rgba(255,255,255,0.04)', color: '#374151',
                border: '1px solid rgba(255,255,255,0.08)',
              })
            }}>
              {i < current ? <CheckCircle size={18} /> : step.icon}
            </div>
            <p style={{
              fontSize: '11px', fontWeight: '600', marginTop: '8px',
              color: i === current ? '#60a5fa' : i < current ? '#4ade80' : '#374151',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {step.label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              width: '80px', height: '1px', margin: '0 8px 20px',
              background: i < current
                ? 'linear-gradient(90deg, #22c55e, #22c55e)'
                : 'rgba(255,255,255,0.06)',
              transition: 'all 0.3s ease',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CreateAssignment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [assignmentData, setAssignmentData] = useState({
    title: '', description: '', difficulty_level: 'medium', deadline: '',
  })
  const [assignmentId, setAssignmentId] = useState(null)
  const [requirements, setRequirements] = useState([{ description: '', weight: 100, priority: 1 }])
  const [savedRequirements, setSavedRequirements] = useState([])
  const [testCases, setTestCases] = useState({})

  const totalWeight = requirements.reduce((sum, r) => sum + Number(r.weight || 0), 0)

  const handleCreateAssignment = async () => {
    if (!assignmentData.title.trim()) { setError('Title is required'); return }
    setError(''); setLoading(true)
    try {
      const res = await createAssignment({
        title: assignmentData.title,
        description: assignmentData.description,
        difficulty_level: assignmentData.difficulty_level,
        deadline: assignmentData.deadline || null,
      })
      setAssignmentId(res.data.id)
      setStep(1)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create assignment')
    } finally { setLoading(false) }
  }

  const handleSaveRequirements = async () => {
    if (totalWeight !== 100) { setError(`Weights must sum to 100. Current: ${totalWeight}`); return }
    for (const req of requirements) {
      if (!req.description.trim()) { setError('All requirements need a description'); return }
    }
    setError(''); setLoading(true)
    try {
      const saved = []
      for (const req of requirements) {
        const res = await createRequirement(assignmentId, {
          description: req.description, weight: Number(req.weight),
          priority: req.priority, requirement_type: 'functional',
        })
        saved.push(res.data)
      }
      setSavedRequirements(saved)
      const initTC = {}
      saved.forEach(r => { initTC[r.id] = [{ input_data: '', expected_output: '', is_sample: true, points: 10 }] })
      setTestCases(initTC)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save requirements')
    } finally { setLoading(false) }
  }

  const handleSaveTestCases = async () => {
    for (const reqId of Object.keys(testCases)) {
      for (const tc of testCases[reqId]) {
        if (!tc.expected_output.trim()) { setError('All test cases need an expected output'); return }
      }
    }
    setError(''); setLoading(true)
    try {
      for (const reqId of Object.keys(testCases)) {
        for (const tc of testCases[reqId]) {
          await createTestCase(reqId, {
            input_data: tc.input_data || '', expected_output: tc.expected_output,
            is_sample: tc.is_sample, points: Number(tc.points) || 10,
            time_limit: 30, memory_limit: 512,
          })
        }
      }
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save test cases')
    } finally { setLoading(false) }
  }

  const handlePublish = async (shouldPublish) => {
    setLoading(true)
    try {
      if (shouldPublish) await publishAssignment(assignmentId)
      setSuccess(true)
      setTimeout(() => navigate('/instructor'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to publish')
    } finally { setLoading(false) }
  }

  const addRequirement = () => setRequirements(prev => [...prev, { description: '', weight: 0, priority: prev.length + 1 }])
  const removeRequirement = (i) => setRequirements(prev => prev.filter((_, idx) => idx !== i))
  const updateRequirement = (i, field, value) => setRequirements(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  const addTestCase = (reqId) => setTestCases(prev => ({ ...prev, [reqId]: [...(prev[reqId] || []), { input_data: '', expected_output: '', is_sample: false, points: 10 }] }))
  const removeTestCase = (reqId, i) => setTestCases(prev => ({ ...prev, [reqId]: prev[reqId].filter((_, idx) => idx !== i) }))
  const updateTestCase = (reqId, i, field, value) => setTestCases(prev => ({ ...prev, [reqId]: prev[reqId].map((tc, idx) => idx === i ? { ...tc, [field]: value } : tc) }))

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: 'white', outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s', display: 'block',
  }

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '500',
    color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.1px',
  }

  const cardStyle = {
    background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '28px',
  }

  const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 24px', borderRadius: '10px', fontSize: '14px',
    fontWeight: '700', color: 'white', cursor: 'pointer',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    border: 'none', boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
  }

  const btnSecondary = {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 20px', borderRadius: '10px', fontSize: '14px',
    fontWeight: '600', color: '#64748b', cursor: 'pointer',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Create Assignment
          </h1>
          <p style={{ fontSize: '15px', color: '#475569' }}>Set up your assignment in 4 simple steps</p>
        </div>

        <StepIndicator current={step} />

        {error && (
          <div style={{
            marginBottom: '20px', padding: '14px 16px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', fontSize: '14px',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />{error}
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '20px', padding: '14px 16px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            color: '#4ade80', fontSize: '14px',
          }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />Assignment saved! Redirecting...
          </div>
        )}

        {/* ── STEP 0 ── */}
        {step === 0 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>Assignment Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text" value={assignmentData.title}
                  onChange={e => setAssignmentData({ ...assignmentData, title: e.target.value })}
                  style={inputStyle} placeholder="e.g. Binary Search Implementation"
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={assignmentData.description}
                  onChange={e => setAssignmentData({ ...assignmentData, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'none', minHeight: '100px' }} rows={4}
                  placeholder="Describe the problem statement clearly..."
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Difficulty</label>
                  <select
                    value={assignmentData.difficulty_level}
                    onChange={e => setAssignmentData({ ...assignmentData, difficulty_level: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  >
                    <option value="easy" style={{ background: '#111118' }}>Easy</option>
                    <option value="medium" style={{ background: '#111118' }}>Medium</option>
                    <option value="hard" style={{ background: '#111118' }}>Hard</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Deadline (optional)</label>
                  <input
                    type="datetime-local" value={assignmentData.deadline}
                    onChange={e => setAssignmentData({ ...assignmentData, deadline: e.target.value })}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button onClick={handleCreateAssignment} disabled={loading} style={btnPrimary}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)'}
              >
                {loading ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'white' }}>Requirements</h2>
              <div style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                background: totalWeight === 100 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: totalWeight === 100 ? '#4ade80' : '#f87171',
                border: `1px solid ${totalWeight === 100 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
                Total: {totalWeight}% {totalWeight === 100 ? '✓' : `(need ${100 - totalWeight} more)`}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {requirements.map((req, i) => (
                <div key={i} style={{
                  padding: '20px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '4px 10px', borderRadius: '6px',
                      background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                      fontSize: '12px', fontWeight: '700',
                    }}>
                      REQ {i + 1}
                    </div>
                    {requirements.length > 1 && (
                      <button onClick={() => removeRequirement(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: '4px', display: 'flex' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = '#374151'}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Description *</label>
                      <input type="text" value={req.description}
                        onChange={e => updateRequirement(i, 'description', e.target.value)}
                        style={inputStyle} placeholder="e.g. Function returns correct output"
                        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Weight %</label>
                      <input type="number" value={req.weight}
                        onChange={e => updateRequirement(i, 'weight', e.target.value)}
                        style={inputStyle} min="0" max="100"
                        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addRequirement} style={{
              width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px',
              fontWeight: '600', color: '#475569', cursor: 'pointer', marginBottom: '24px',
              background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.color = '#60a5fa' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#475569' }}
            >
              <Plus size={16} /> Add Requirement
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(0)} style={btnSecondary}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={handleSaveRequirements} disabled={loading || totalWeight !== 100} style={{
                ...btnPrimary, opacity: (loading || totalWeight !== 100) ? 0.5 : 1,
                cursor: (loading || totalWeight !== 100) ? 'not-allowed' : 'pointer',
              }}>
                {loading ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {savedRequirements.map((req, ri) => (
              <div key={req.id} style={cardStyle}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ padding: '3px 10px', borderRadius: '6px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: '11px', fontWeight: '700' }}>
                      REQ {ri + 1}
                    </div>
                    <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{req.weight}% weight</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{req.description}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(testCases[req.id] || []).map((tc, i) => (
                    <div key={i} style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Test Case {i + 1}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#475569' }}>
                            <input type="checkbox" checked={tc.is_sample}
                              onChange={e => updateTestCase(req.id, i, 'is_sample', e.target.checked)} />
                            Sample (visible to students)
                          </label>
                          {(testCases[req.id] || []).length > 1 && (
                            <button onClick={() => removeTestCase(req.id, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: '2px', display: 'flex' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                              onMouseLeave={e => e.currentTarget.style.color = '#374151'}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '12px' }}>
                        <div>
                          <label style={labelStyle}>Input (stdin)</label>
                          <textarea value={tc.input_data}
                            onChange={e => updateTestCase(req.id, i, 'input_data', e.target.value)}
                            style={{ ...inputStyle, resize: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }} rows={3}
                            placeholder="Input data..."
                            onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Expected Output *</label>
                          <textarea value={tc.expected_output}
                            onChange={e => updateTestCase(req.id, i, 'expected_output', e.target.value)}
                            style={{ ...inputStyle, resize: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }} rows={3}
                            placeholder="Expected output..."
                            onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Points</label>
                          <input type="number" value={tc.points}
                            onChange={e => updateTestCase(req.id, i, 'points', e.target.value)}
                            style={inputStyle} min="1"
                            onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => addTestCase(req.id)} style={{
                  width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px',
                  fontWeight: '600', color: '#475569', cursor: 'pointer', marginTop: '12px',
                  background: 'transparent', border: '1px dashed rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.color = '#60a5fa' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#475569' }}
                >
                  <Plus size={14} /> Add Test Case
                </button>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} style={btnSecondary}>
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={handleSaveTestCases} disabled={loading} style={btnPrimary}>
                {loading ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>Review & Publish</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {[
                { label: 'Title', value: assignmentData.title },
                { label: 'Difficulty', value: assignmentData.difficulty_level },
                { label: 'Requirements', value: `${savedRequirements.length} requirements` },
                { label: 'Test Cases', value: `${Object.values(testCases).reduce((s, t) => s + t.length, 0)} total test cases` },
                { label: 'Deadline', value: assignmentData.deadline ? new Date(assignmentData.deadline).toLocaleString() : 'No deadline set' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{item.label}</span>
                  <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '600' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{
              padding: '16px 20px', borderRadius: '12px', marginBottom: '28px',
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
            }}>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                <strong style={{ color: '#60a5fa' }}>Publishing</strong> makes this assignment visible to all students immediately.
                You can also save as a draft and publish later from your dashboard.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <button onClick={() => setStep(2)} style={btnSecondary}>
                <ChevronLeft size={16} /> Back
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handlePublish(false)} disabled={loading} style={{
                  ...btnSecondary, color: '#94a3b8',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <Save size={15} /> Save Draft
                </button>
                <button onClick={() => handlePublish(true)} disabled={loading} style={{
                  ...btnPrimary,
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                }}>
                  {loading
                    ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Rocket size={16} />
                  }
                  Publish Now
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}