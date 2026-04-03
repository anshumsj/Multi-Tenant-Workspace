import React from 'react'
import { useState } from 'react'
import API from '../api/axios'
const Login = () => {
  const [loginForm, setloginForm] = useState({
      email:"",
      password:""
  })
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setshowPassword] = useState(false);
  const onSubmitHandler = async (e) => {
      e.preventDefault();
      try{
          setError("");
          setLoading(true);
          // login logic
          const res = await API.post('/auth/login',loginForm);
          console.log(res.data);
          setLoading(false);
      }catch(error){
          setLoading(false);
          const apiMessage = error?.response?.data?.message;
          setError(apiMessage || "Unable to login. Please check server connection and try again.");
      }
  }
  return (
    <section className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue to your workspace.</p>

        <form onSubmit={onSubmitHandler} className="mt-6 space-y-4">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e)=>{setloginForm({...loginForm, email:e.target.value})}}
          />

          <div className="space-y-2">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
              placeholder="Password"
              type={showPassword?"text":"password"}
              value={loginForm.password}
              onChange={(e)=>{setloginForm({...loginForm, password:e.target.value})}}
            />
            <button
              type="button"
              onClick={()=>{setshowPassword(!showPassword)}}
              className="text-sm text-slate-600 transition hover:text-slate-900"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login