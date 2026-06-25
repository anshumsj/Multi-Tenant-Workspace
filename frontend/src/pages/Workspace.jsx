import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/workspaceContext';
import { createWorkspace } from '../api/workspaceApi';

const Workspace = () => {
  const { workspaces, setActiveWorkspace, loading, error, fetchWorkspaces } = useWorkspace();
  const navigate = useNavigate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceData, setNewWorkspaceData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

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
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                  {ws.name}
                </h3>
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
    </section>
  );
};

export default Workspace;