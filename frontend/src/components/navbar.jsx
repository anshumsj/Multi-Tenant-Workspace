import React from 'react'
import {useNavigate} from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();
  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Project', path: '/project' },
    { label: 'Task', path: '/task' },
    { label: 'Workspace', path: '/workspace' },
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
        </div>
      </nav>
    </header>
  )
}

export default Navbar