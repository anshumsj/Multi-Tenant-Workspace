import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/workspaceContext';
import { createWorkspace, getAllMembersOfWorkspace, addMemberToWorkspace, removeMemberFromWorkspace } from '../api/workspaceApi';
import { getUserByEmail } from '../api/userApi';

const Workspace = () => {
  const { workspaces, setActiveWorkspace, loading, error, fetchWorkspaces } = useWorkspace();
  const navigate = useNavigate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceData, setNewWorkspaceData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  // Members state
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const handleSelectWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    navigate('/project');
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceData.name) return;
    
    try {
      setCreating(true);
      await createWorkspace(newWorkspaceData);
      setNewWorkspaceData({ name: '', description: '' });
      setShowCreateModal(false);
      await fetchWorkspaces();
    } catch (err) {
      console.error('Failed to create workspace', err);
      alert('Failed to create workspace. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const openMembersModal = async (e, workspace) => {
    e.stopPropagation();
    setSelectedWorkspace(workspace);
    setShowMembersModal(true);
    fetchMembers(workspace._id);
  };

  const fetchMembers = async (workspaceId) => {
    try {
      setMembersLoading(true);
      const data = await getAllMembersOfWorkspace(workspaceId);
      setWorkspaceMembers(data.members || []);
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail) return;

    try {
      setIsAddingMember(true);
      const userData = await getUserByEmail(newMemberEmail);
      if (!userData || !userData.user) {
         alert('User not found with this email.');
         setIsAddingMember(false);
         return;
      }
      
      await addMemberToWorkspace(selectedWorkspace._id, {
        newUserId: userData.user._id,
        role: newMemberRole
      });
      
      setNewMemberEmail('');
      setNewMemberRole('member');
      fetchMembers(selectedWorkspace._id);
    } catch (err) {
      console.error('Failed to add member', err);
      alert(err?.response?.data?.message || 'Failed to add member.');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if(!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeMemberFromWorkspace(selectedWorkspace._id, { memberId });
      fetchMembers(selectedWorkspace._id);
    } catch (err) {
      console.error('Failed to remove member', err);
      alert(err?.response?.data?.message || 'Failed to remove member.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="text-xl text-slate-500">Loading workspaces...</div>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Workspaces</h1>
          <p className="mt-2 text-sm text-slate-500">Select a workspace to view its projects, or create a new one.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition-colors"
        >
          Create Workspace
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <div 
              key={ws._id}
              onClick={() => handleSelectWorkspace(ws)}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-sky-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {ws.name}
                  </h3>
                  <button 
                    onClick={(e) => openMembersModal(e, ws)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 z-10"
                    title="Manage Members"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </button>
                </div>
                {ws.description && (
                  <p className="mt-3 text-sm text-slate-500 line-clamp-3">
                    {ws.description}
                  </p>
                )}
              </div>
              <div className="mt-auto border-t border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Open Workspace &rarr;
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-2xl border border-dashed border-slate-300 py-16">
          <h3 className="text-lg font-semibold text-slate-900">No workspaces found</h3>
          <p className="mt-2 text-sm text-slate-500">Get started by creating a new workspace for your team.</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Workspace</h2>
            <form onSubmit={handleCreateWorkspace}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Workspace Name *</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={newWorkspaceData.name}
                    onChange={(e) => setNewWorkspaceData({...newWorkspaceData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    id="description"
                    rows="3"
                    value={newWorkspaceData.description}
                    onChange={(e) => setNewWorkspaceData({...newWorkspaceData, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Briefly describe this workspace..."
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Manage Members</h2>
              <button onClick={() => setShowMembersModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {membersLoading ? (
              <div className="py-8 text-center text-slate-500">Loading members...</div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Current Workspace Members</h3>
                  {workspaceMembers.length > 0 ? (
                    <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
                      {workspaceMembers.map((member, idx) => (
                        <li key={idx} className="flex items-center justify-between py-3 px-4 bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-medium uppercase">
                              {member.userId?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {member.userId?.name || 'Unknown User'} 
                                <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase">
                                  {member.role}
                                </span>
                              </p>
                              <p className="text-xs text-slate-500">{member.userId?.email}</p>
                            </div>
                          </div>
                          {member.role !== 'owner' && (
                            <button 
                              onClick={() => handleRemoveMember(member._id)}
                              className="text-xs text-red-600 hover:text-red-800 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No members found.</p>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Add New Member</h3>
                  <form onSubmit={handleAddMember} className="flex flex-col gap-3">
                    <input
                      type="email"
                      placeholder="User's email address"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                    <div className="flex gap-2">
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="submit"
                        disabled={!newMemberEmail || isAddingMember}
                        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 whitespace-nowrap"
                      >
                        {isAddingMember ? 'Adding...' : 'Add Member'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Workspace;