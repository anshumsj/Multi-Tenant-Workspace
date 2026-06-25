import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/workspaceContext';
import { getAllProjects, createProject } from '../api/projectApi';

const Project = () => {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', projectLead: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // If no active workspace is selected, we should ideally ask them to select one
    if (activeWorkspace) {
      fetchProjects();
    }
  }, [activeWorkspace]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects(activeWorkspace._id);
      setProjects(data.projects || data || []);
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setError('Failed to fetch projects for this workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectData.name || !newProjectData.description) return;
    
    try {
      setCreating(true);
      await createProject(activeWorkspace._id, newProjectData);
      setNewProjectData({ name: '', description: '', projectLead: '' });
      setShowCreateModal(false);
      await fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
      alert(err?.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)]">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">No Workspace Selected</h2>
        <p className="text-slate-500 mb-6">Please select a workspace to view its projects.</p>
        <button 
          onClick={() => navigate('/workspace')}
          className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
        >
          Go to Workspaces
        </button>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
            {activeWorkspace.name}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="mt-2 text-sm text-slate-500">Manage all projects within this workspace.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition-colors"
        >
          New Project
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading projects...</div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => (
            <div 
              key={proj._id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {proj.name}
                </h3>
                {proj.description && (
                  <p className="mt-3 text-sm text-slate-500 line-clamp-3">
                    {proj.description}
                  </p>
                )}
                {proj.projectLead && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                      {proj.projectLead?.name?.charAt(0) || 'L'}
                    </div>
                    <span>Lead: {proj.projectLead?.name || 'Unknown'}</span>
                  </div>
                )}
              </div>
              <div className="mt-auto border-t border-slate-100 bg-slate-50 p-4 flex justify-between items-center">
                 <span className="text-xs font-medium text-slate-500 uppercase">
                  {new Date(proj.createdAt).toLocaleDateString()}
                 </span>
                 <button className="text-xs font-medium text-sky-600 hover:text-sky-800">
                   View Tasks &rarr;
                 </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-2xl border border-dashed border-slate-300 py-16">
          <h3 className="text-lg font-semibold text-slate-900">No projects yet</h3>
          <p className="mt-2 text-sm text-slate-500">Create the first project in this workspace.</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Project Name *</label>
                  <input
                    type="text"
                    id="name"
                    required
                    minLength={8}
                    maxLength={100}
                    value={newProjectData.name}
                    onChange={(e) => setNewProjectData({...newProjectData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description *</label>
                  <textarea
                    id="description"
                    required
                    rows="3"
                    maxLength={500}
                    value={newProjectData.description}
                    onChange={(e) => setNewProjectData({...newProjectData, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Project description..."
                  ></textarea>
                </div>
                {/* For simplicity, projectLead is omitted from input, backend falls back to creator */}
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
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Project;