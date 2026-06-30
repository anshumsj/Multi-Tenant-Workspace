import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/workspaceContext';
import { getAllProjects, createProject, updateProject, deleteProject, addMemberToProject, getProjectMembers, changeProjectLead } from '../api/projectApi';
import { getAllMembersOfWorkspace } from '../api/workspaceApi';

const Project = () => {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', projectLead: '' });
  const [creating, setCreating] = useState(false);

  // Edit/Delete state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProjectData, setEditProjectData] = useState({ id: '', name: '', description: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Change Lead state
  const [showChangeLeadModal, setShowChangeLeadModal] = useState(false);
  const [projectToChangeLead, setProjectToChangeLead] = useState(null);
  const [changeLeadData, setChangeLeadData] = useState({ newProjectLead: '', reason: '' });
  const [isChangingLead, setIsChangingLead] = useState(false);

  // Members state
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  const fetchWorkspaceMembers = async () => {
    try {
      const data = await getAllMembersOfWorkspace(activeWorkspace._id);
      setWorkspaceMembers(data.members || []);
    } catch (err) {
      console.error('Failed to fetch workspace members', err);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchProjects();
      fetchWorkspaceMembers();
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
      const payload = { ...newProjectData };
      if (!payload.projectLead) {
        delete payload.projectLead;
      }
      await createProject(activeWorkspace._id, payload);
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

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editProjectData.name || !editProjectData.description) return;

    try {
      setIsUpdating(true);
      await updateProject(editProjectData.id, activeWorkspace._id, {
        name: editProjectData.name,
        description: editProjectData.description
      });
      setShowEditModal(false);
      await fetchProjects();
    } catch (err) {
      console.error('Failed to update project', err);
      alert(err?.response?.data?.message || 'Failed to update project.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      setIsDeleting(true);
      await deleteProject(projectToDelete._id, activeWorkspace._id);
      setShowDeleteModal(false);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err) {
      console.error('Failed to delete project', err);
      alert(err?.response?.data?.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeLead = async (e) => {
    e.preventDefault();
    if (!changeLeadData.newProjectLead) return;
    try {
      setIsChangingLead(true);
      await changeProjectLead(projectToChangeLead._id, activeWorkspace._id, changeLeadData);
      setShowChangeLeadModal(false);
      setProjectToChangeLead(null);
      setChangeLeadData({ newProjectLead: '', reason: '' });
      await fetchProjects();
    } catch (err) {
      console.error('Failed to change lead', err);
      alert(err?.response?.data?.message || 'Failed to change project lead.');
    } finally {
      setIsChangingLead(false);
    }
  };

  const openMembersModal = async (project) => {
    setSelectedProject(project);
    setShowMembersModal(true);
    setMembersLoading(true);
    setOpenDropdown(null);
    try {
      const pMembers = await getProjectMembers(project._id, activeWorkspace._id);
      setProjectMembers(pMembers.members || []);
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberId) return;

    try {
      setIsAddingMember(true);
      await addMemberToProject(selectedProject._id, activeWorkspace._id, { newMemberId });
      
      const pMembers = await getProjectMembers(selectedProject._id, activeWorkspace._id);
      setProjectMembers(pMembers.members || []);
      setNewMemberId('');
    } catch (err) {
      console.error('Failed to add member', err);
      alert(err?.response?.data?.message || 'Failed to add member.');
    } finally {
      setIsAddingMember(false);
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
              className="group relative flex flex-col overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-slate-900 pr-4">
                    {proj.name}
                  </h3>
                  
                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === proj._id ? null : proj._id)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {openDropdown === proj._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
                        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                          <button
                            onClick={() => {
                              setEditProjectData({ id: proj._id, name: proj.name, description: proj.description });
                              setShowEditModal(true);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            Edit Project
                          </button>
                          <button
                            onClick={() => {
                              setProjectToChangeLead(proj);
                              setChangeLeadData({ newProjectLead: proj.projectLead?._id || '', reason: '' });
                              setShowChangeLeadModal(true);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            Change Lead
                          </button>
                          <button
                            onClick={() => openMembersModal(proj)}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            Manage Members
                          </button>
                          <button
                            onClick={() => {
                              setProjectToDelete(proj);
                              setShowDeleteModal(true);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete Project
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {proj.description && (
                  <p className="mt-3 text-sm text-slate-500 line-clamp-3">
                    {proj.description}
                  </p>
                )}
                {proj.projectLead && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <div className="h-6 w-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold uppercase">
                      {proj.projectLead?.name?.charAt(0) || 'L'}
                    </div>
                    <span>Lead: <span className="font-medium text-slate-700">{proj.projectLead?.name || 'Unknown'}</span></span>
                  </div>
                )}
              </div>
              <div className="mt-auto border-t border-slate-100 bg-slate-50 p-4 flex justify-between items-center rounded-b-2xl">
                 <span className="text-xs font-medium text-slate-500 uppercase">
                  {new Date(proj.createdAt).toLocaleDateString()}
                 </span>
                 <button 
                   onClick={() => navigate(`/project/${proj._id}/tasks`)}
                   className="text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                 >
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
                    minLength={2}
                    maxLength={100}
                    value={newProjectData.name}
                    onChange={(e) => setNewProjectData({...newProjectData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="projectLead" className="block text-sm font-medium text-slate-700">Project Lead (Optional)</label>
                  <select
                    id="projectLead"
                    value={newProjectData.projectLead}
                    onChange={(e) => setNewProjectData({...newProjectData, projectLead: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="">Assign to myself (Default)</option>
                    {workspaceMembers.map((wm, idx) => (
                      <option key={idx} value={wm.userId?._id}>
                        {wm.userId?.name} ({wm.userId?.email})
                      </option>
                    ))}
                  </select>
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
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Edit Project</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700">Project Name *</label>
                  <input
                    type="text"
                    id="edit-name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={editProjectData.name}
                    onChange={(e) => setEditProjectData({...editProjectData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-slate-700">Description *</label>
                  <textarea
                    id="edit-description"
                    required
                    rows="3"
                    maxLength={500}
                    value={editProjectData.description}
                    onChange={(e) => setEditProjectData({...editProjectData, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Delete Project?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{projectToDelete?.name}</span>? This action cannot be undone and will delete all tasks within it.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Lead Modal */}
      {showChangeLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Change Project Lead</h2>
            <form onSubmit={handleChangeLead}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newProjectLead" className="block text-sm font-medium text-slate-700">Select New Lead *</label>
                  <select
                    id="newProjectLead"
                    required
                    value={changeLeadData.newProjectLead}
                    onChange={(e) => setChangeLeadData({...changeLeadData, newProjectLead: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="">Select a member...</option>
                    {workspaceMembers.map((wm, idx) => (
                      <option key={idx} value={wm.userId?._id}>
                        {wm.userId?.name} ({wm.userId?.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason (Optional)</label>
                  <textarea
                    id="reason"
                    rows="2"
                    maxLength={500}
                    value={changeLeadData.reason}
                    onChange={(e) => setChangeLeadData({...changeLeadData, reason: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowChangeLeadModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingLead}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition-colors"
                >
                  {isChangingLead ? 'Saving...' : 'Change Lead'}
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
              <h2 className="text-xl font-semibold text-slate-900">Manage Members - {selectedProject?.name}</h2>
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
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Current Project Members</h3>
                  {projectMembers.length > 0 ? (
                    <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
                      {projectMembers.map((pm, idx) => (
                        <li key={idx} className="flex items-center justify-between py-3 px-4 bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-medium">
                              {pm.userId?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{pm.userId?.name || 'Unknown User'}</p>
                              <p className="text-xs text-slate-500">{pm.userId?.email}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No members found.</p>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Add Member from Workspace</h3>
                  <form onSubmit={handleAddMember} className="flex gap-2">
                    <select
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    >
                      <option value="">Select a workspace member...</option>
                      {workspaceMembers
                        // filter out users already in project
                        .filter(wm => !projectMembers.some(pm => pm.userId?._id === wm.userId?._id))
                        .map((wm, idx) => (
                        <option key={idx} value={wm.userId?._id}>
                          {wm.userId?.name} ({wm.userId?.email})
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={!newMemberId || isAddingMember}
                      className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 whitespace-nowrap"
                    >
                      {isAddingMember ? 'Adding...' : 'Add'}
                    </button>
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

export default Project;