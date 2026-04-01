import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Code2, LogOut, LayoutDashboard, FileText, TrendingUp, Trophy, BookOpen, BarChart2, Users } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { to: '/submissions', label: 'My Submissions', icon: <FileText size={15} /> },
    { to: '/progress', label: 'Progress', icon: <TrendingUp size={15} /> },
    { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={15} /> },
  ]

  const instructorLinks = [
    { to: '/instructor', label: 'Assignments', icon: <BookOpen size={15} /> },
    { to: '/instructor/analytics', label: 'Analytics', icon: <BarChart2 size={15} /> },
    { to: '/instructor/students', label: 'Students', icon: <Users size={15} /> },
    { to: '/instructor/create', label: '+ Create', icon: null },
  ]

  const links = user?.role === 'instructor' ? instructorLinks : studentLinks

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50, height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      background: 'rgba(10,10,15,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Left — Logo + Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>

        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59,130,246,0.4)',
          }}>
            <Code2 size={16} color="white" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: '700', color: 'white', letterSpacing: '-0.3px' }}>
            CodeClarity
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {links.map(link => {
            const isActive = location.pathname === link.to
            const isCreate = link.label === '+ Create'
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '13px', fontWeight: '500', transition: 'all 0.15s ease',
                  ...(isCreate ? {
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    color: '#60a5fa',
                    marginLeft: '8px',
                  } : isActive ? {
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.08)',
                  } : {
                    color: '#64748b',
                    border: '1px solid transparent',
                  })
                }}
                onMouseEnter={e => {
                  if (!isActive && !isCreate) {
                    e.currentTarget.style.color = '#cbd5e1'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive && !isCreate) {
                    e.currentTarget.style.color = '#64748b'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {link.icon && <span style={{ opacity: isActive ? 1 : 0.7 }}>{link.icon}</span>}
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Right — User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Role badge */}
        <div style={{
          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
          textTransform: 'capitalize', letterSpacing: '0.3px',
          ...(user?.role === 'instructor' ? {
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.25)',
            color: '#c084fc',
          } : {
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.25)',
            color: '#60a5fa',
          })
        }}>
          {user?.role}
        </div>

        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', color: 'white',
          }}>
            {user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'white', lineHeight: '1.2' }}>
              {user?.full_name || user?.username}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            background: 'none', border: '1px solid rgba(255,255,255,0.06)',
            color: '#475569', fontSize: '13px', fontWeight: '500',
            transition: 'all 0.15s ease', fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#f87171'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
            e.currentTarget.style.background = 'rgba(239,68,68,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#475569'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.background = 'none'
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  )
}