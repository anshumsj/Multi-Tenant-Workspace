import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Project from './pages/Project'
import Task from './pages/Task'
import Workspace from './pages/Workspace'
import Profile from './pages/Profile'
import Login from './pages/login'
import Register from './pages/register'
import Navbar from './components/navbar'
import AuthGuard from './components/AuthGuard'
import GuestGuard from './components/GuestGuard'

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Routes>
        {/* ── Private routes — require authentication ─────────────────── */}
        <Route element={<AuthGuard />}>
          <Route path='/' element={<Dashboard />} />
          <Route path='/workspace' element={<Workspace />} />
          <Route path='/project' element={<Project />} />
          <Route path='/project/:projectId/tasks' element={<Task />} />
          <Route path='/profile' element={<Profile />} />
        </Route>

        {/* ── Guest-only routes — redirect if already logged in ────────── */}
        <Route element={<GuestGuard />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App;