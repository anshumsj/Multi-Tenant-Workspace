import React, { useState, useRef } from 'react';
import { useAuth } from '../context/authContext';
import { updateProfile } from '../api/userApi';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const initials = (user?.name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const trimmedName = name.trim();
    const nameChanged = trimmedName && trimmedName !== user?.name;
    if (!nameChanged && !avatarFile) {
      setErrorMsg('No changes to save.');
      return;
    }

    try {
      setSaving(true);
      const data = await updateProfile({
        name: nameChanged ? trimmedName : undefined,
        avatarFile: avatarFile || undefined,
      });
      // Sync updated fields back to auth context / localStorage
      updateUser({
        name: data.user.name,
        avatar: data.user.avatar,
      });
      setAvatarFile(null);
      setPreviewUrl(data.user.avatar || previewUrl);
      setName(data.user.name);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Your Profile</h1>
      <p className="text-sm text-slate-500 mb-8">Update your display name and avatar.</p>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 space-y-8">

        {/* ── Avatar ── */}
        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer"
            title="Click to change avatar"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-sky-100 group-hover:ring-sky-300 transition"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-sky-100 ring-4 ring-sky-100 group-hover:ring-sky-300 flex items-center justify-center text-sky-700 text-3xl font-bold transition">
                {initials}
              </div>
            )}
            {/* overlay */}
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-slate-400">Click avatar to upload a new photo (max 10 MB)</p>
          {avatarFile && (
            <span className="text-xs text-sky-600 font-medium">📎 {avatarFile.name}</span>
          )}
        </div>

        {/* ── Name ── */}
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1">
            Display Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            minLength={2}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Your name"
          />
        </div>

        {/* ── Read-only email ── */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="block w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
        </div>

        {/* ── Feedback ── */}
        {successMsg && (
          <p className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{successMsg}</p>
        )}
        {errorMsg && (
          <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{errorMsg}</p>
        )}

        {/* ── Submit ── */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Profile;
