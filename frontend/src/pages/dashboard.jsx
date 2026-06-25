import React from 'react'
import { useAuth } from '../context/authContext'

const Dashboard = () => {
  const { user } = useAuth();


  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Your current account details are shown below.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</p>
            <p className="mt-2 text-lg font-medium text-slate-900">{user?.name || 'No user loaded'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-2 text-lg font-medium text-slate-900">{user?.email || 'No user loaded'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard