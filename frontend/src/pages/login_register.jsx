import API from "../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginRegister = () => {
  const { login } = useAuth();
  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false); // controls step 1 vs step 2
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChangeHandler1 = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const onChangeHandler2 = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  const onSubmitHandler1 = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await API.post("/auth/login", loginForm);
      login({id:res.data.user._id,name:res.data.user.name,email:res.data.user.email});
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  const onSubmitHandler2 = async (e) => {
    e.preventDefault();
    setError("");
    if (registerForm.password !== registerForm.confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...registerPayload } = registerForm;
      await API.post("/auth/register", registerPayload);
      const res = await API.post("/auth/login", { email: registerForm.email, password: registerForm.password });
      login({id:res.data.user._id,name:res.data.user.name,email:res.data.user.email});
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const sendOtpHandler = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await API.post("/auth/generateotp", { email: otpEmail });
      setOtpSent(true);
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const changePasswordHandler = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await API.post("/auth/verifyotp", { email: otpEmail, otp });
      const resetToken = res.data.resetToken;
      await API.post("/auth/changepassword", { newPassword, resetToken });
      setSuccess("Password changed successfully!");
      setTimeout(() => { setTab("login"); setOtpSent(false); setSuccess(""); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const switchTab = (t) => { setTab(t); setError(""); setSuccess(""); setOtpSent(false); };

  const inputClass = "w-full bg-[#111] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-[#f0f0f0] text-sm outline-none focus:border-indigo-500 placeholder-[#555] transition-all";
  const labelClass = "text-[#aaa] text-sm block mb-1.5";

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-8">
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-10 w-full max-w-md">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-medium">W</div>
          <span className="text-[#f0f0f0] text-lg font-medium">WorkSpace</span>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#111] border border-[#2e2e2e] rounded-xl p-1 mb-8">
          {["login", "register", "forgot"].map((t) => (
            <button key={t} onClick={() => switchTab(t)}
              className={`flex-1 py-2 text-sm rounded-lg transition-all ${tab === t ? "bg-indigo-500 text-white font-medium" : "text-[#888]"}`}>
              {t === "login" ? "Login" : t === "register" ? "Register" : "Forgot"}
            </button>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-[#f0f0f0] text-2xl font-medium mb-1">
          {tab === "login" ? "Welcome back" : tab === "register" ? "Create account" : otpSent ? "Reset password" : "Forgot password"}
        </h1>
        <p className="text-[#888] text-sm mb-7">
          {tab === "login" ? "Sign in to your account"
            : tab === "register" ? "Start managing your workspace"
            : otpSent ? "Enter the OTP sent to your email"
            : "We'll send an OTP to your email"}
        </p>

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={onSubmitHandler1} className="space-y-4">
            <div>
              <label className={labelClass}>Email address</label>
              <input type="email" name="email" placeholder="you@example.com"
                value={loginForm.email} onChange={onChangeHandler1} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" name="password" placeholder="••••••••"
                value={loginForm.password} onChange={onChangeHandler1} className={inputClass} />
            </div>
            <div className="text-right">
              <span onClick={() => switchTab("forgot")}
                className="text-indigo-400 text-xs cursor-pointer hover:text-indigo-300 transition-all">
                Forgot password?
              </span>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form onSubmit={onSubmitHandler2} className="space-y-4">
            <div>
              <label className={labelClass}>Full name</label>
              <input type="text" name="name" placeholder="John Doe"
                value={registerForm.name} onChange={onChangeHandler2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email address</label>
              <input type="email" name="email" placeholder="you@example.com"
                value={registerForm.email} onChange={onChangeHandler2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" name="password" placeholder="••••••••"
                value={registerForm.password} onChange={onChangeHandler2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Confirm password</label>
              <input type="password" name="confirmPassword" placeholder="••••••••"
                value={registerForm.confirmPassword} onChange={onChangeHandler2} className={inputClass} />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

        {/* Forgot Password — Step 1: Enter Email */}
        {tab === "forgot" && !otpSent && (
          <form onSubmit={sendOtpHandler} className="space-y-4">
            <div>
              <label className={labelClass}>Email address</label>
              <input type="email" placeholder="you@example.com"
                value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} className={inputClass} />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Forgot Password — Step 2: Enter OTP + New Password */}
        {tab === "forgot" && otpSent && (
          <form onSubmit={changePasswordHandler} className="space-y-4">
            <div>
              <label className={labelClass}>OTP</label>
              <input type="text" placeholder="Enter OTP"
                value={otp} onChange={(e) => setOtp(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <input type="password" placeholder="••••••••"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {loading ? "Changing password..." : "Change password"}
            </button>
            <button type="button" onClick={() => setOtpSent(false)}
              className="w-full border border-[#2e2e2e] text-[#888] py-2.5 rounded-lg text-sm hover:bg-white/5 transition-all">
              Resend OTP
            </button>
          </form>
        )}

        {/* Bottom text for login/register toggle */}
        {(tab === "login" || tab === "register") && (
          <p className="text-center text-[#666] text-sm mt-5">
            {tab === "login" ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => switchTab(tab === "login" ? "register" : "login")}
              className="text-indigo-400 cursor-pointer ml-1 hover:text-indigo-300 transition-all">
              {tab === "login" ? "Sign up" : "Sign in"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
// anshumawasthiloveindia@gmail.com id ka password: Anshum@21
export default LoginRegister;