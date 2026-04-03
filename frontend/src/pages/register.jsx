import React, { useState } from 'react'
import API from '../api/axios'
const Register = () => {
  const [registerForm, setregisterForm] = useState({
    name:"",
    email:"",
    password:"",
    avatar:""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setshowPassword] = useState(false)
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try{
      setError("");
      setLoading(true);
      const res = await API.post('/auth/register', registerForm);
      console.log(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const apiMessage = error?.response?.data?.message;
      setError(apiMessage || "Unable to register. Please check server connection and try again.");
    }
  }
  return (
    <section className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Set up your profile to get started.</p>

        <form onSubmit={onSubmitHandler} className="mt-6 space-y-4">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
            type="text"
            placeholder="Name"
            value={registerForm.name}
            onChange={(e) => setregisterForm({...registerForm, name: e.target.value})}
          />

          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) => setregisterForm({...registerForm, email: e.target.value})}
          />

          <div className="space-y-2">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setregisterForm({...registerForm, password: e.target.value})}
            />
            <button
              type="button"
              onClick={()=>{setshowPassword(!showPassword)}}
              className="text-sm text-slate-600 transition hover:text-slate-900"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>

          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
            type="text"
            placeholder="Avatar URL (optional)"
            value={registerForm.avatar}
            onChange={(e) => setregisterForm({...registerForm, avatar: e.target.value})}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Register