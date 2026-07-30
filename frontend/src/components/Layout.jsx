import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◉' },
  { to: '/resume', label: 'Resume', icon: '📄' },
  { to: '/jobs', label: 'Jobs', icon: '🔍' },
  { to: '/content', label: 'Content', icon: '✏️' },
  { to: '/tracker', label: 'Tracker', icon: '📊' },
  { to: '/profile', label: 'Profile', icon: '⚙️' },
]

export default function Layout({ user, setUser }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-dark-950">
      <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
        <div className="p-5 border-b border-dark-800">
          <h1 className="text-xl font-bold text-white">Career OS</h1>
          <p className="text-xs text-dark-400 mt-1">AI-Powered Career Engine</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-dark-400 hover:text-red-400 transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
