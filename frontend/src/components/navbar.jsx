import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { logoutUser } from '../api/authApi'

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout failed:', err);
    }
    logout();
    navigate('/login');
  };

  const navItems = user 
    ? [
        { label: 'Dashboard', path: '/' },
        { label: 'Workspace', path: '/workspace' },
        { label: 'Project', path: '/project' },
      ]
    : [
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' },
      ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => { navigate('/'); }}
          className="text-base font-semibold tracking-tight text-slate-900"
        >
          Workspace
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); }}
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </button>
          ))}
          {user && (
            <button
              onClick={handleLogout}
              className="ml-2 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-100 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar