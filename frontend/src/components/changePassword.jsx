import React, { useState } from 'react'
import API from '../api/axios'
const ChangePassword = () => {
  const [email, setemail] = useState("");
  const [otp, setotp] = useState("");
  const [newPassword, setnewPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [resetToken, setresetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: generate OTP, 2: verify OTP, 3: change password
  const generateOtpHandler = async () => {
    try{
      setError("");
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const res = await API.post("/auth/generateotp", {email: normalizedEmail});
      setLoading(false);
      setemail(normalizedEmail);
      setStep(2);
    } catch (error) {
      setLoading(false);
      const apiMessage = error?.response?.data?.message;
      setError(apiMessage || "Unable to generate OTP. Please check server connection and try again.");
    }
  }
  const verifyOtpHandler = async () => {
    try{
      setError("");
      setLoading(true);
      const res = await API.post("/auth/verifyotp", {email: email.trim().toLowerCase(), otp: otp.trim()});
      setresetToken(res.data.resetToken);
      setLoading(false);
      setStep(3);
    } catch (error) {
      setLoading(false);
      const apiMessage = error?.response?.data?.message;
      setError(apiMessage || "Unable to verify OTP. Please check server connection and try again.");
    }

  }
  const changePasswordHandler = async () => {
    if(newPassword !== confirmPassword){
      setError("Passwords do not match");
      return;
    }
    try{
      setError("");
      setLoading(true);
      await API.post("/auth/changepassword", {newPassword, resetToken});
      setLoading(false);
      alert("Password changed successfully. Please login with your new password.");
    } catch (error) {
      setLoading(false);
      const apiMessage = error?.response?.data?.message;
      setError(apiMessage || "Unable to change password. Please check server connection and try again.");
    }
  }
  return ( 
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Password reset</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Change your password</h2>
        <p className="mt-1 text-sm text-slate-500">Follow the three-step flow to verify your email and set a new password.</p>
      </div>

      <div className="mb-6 flex items-center gap-2 text-xs font-medium">
        <span className={`rounded-full px-3 py-1 ${step === 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>1. Email</span>
        <span className={`rounded-full px-3 py-1 ${step === 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>2. OTP</span>
        <span className={`rounded-full px-3 py-1 ${step === 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>3. New password</span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button
              onClick={generateOtpHandler}
              disabled={loading || !email.trim()}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Sending OTP...' : 'Generate OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">OTP code</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter the 6-digit code"
                value={otp}
                onChange={(e) => setotp(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button
              onClick={verifyOtpHandler}
              disabled={loading || !otp.trim()}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setnewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setconfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button
              onClick={changePasswordHandler}
              disabled={loading || !newPassword || !confirmPassword}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ChangePassword