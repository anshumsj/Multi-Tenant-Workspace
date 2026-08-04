import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/workspaceContext';
import { getAllTasks, createTask, updateTask, updateTaskStatus, deleteTask, addComment, addResource, deleteResource } from '../api/taskApi';
import { getProjectMembers } from '../api/projectApi';

const Task = () => {
  const { projectId } = useParams();
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksTotalPages, setTasksTotalPages] = useState(1);

  // Create Task Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ name: '', description: '', deadline: '', assignees: [] });
  const [isCreating, setIsCreating] = useState(false);

  // Task Details Modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Resource state
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceLink, setResourceLink] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [resourceType, setResourceType] = useState('link'); // 'file' or 'link'

  useEffect(() => {
    if (!activeWorkspace) {
      navigate('/project');
      return;
    }
    if (projectId) {
      fetchTasksAndMembers(1);
    }
  }, [projectId, activeWorkspace]);

  const fetchTasksAndMembers = async (page = 1) => {
    try {
      setLoading(true);
      const [tasksData, membersData] = await Promise.all([
        getAllTasks(projectId, activeWorkspace._id, page, 20),
        getProjectMembers(projectId, activeWorkspace._id, 1, 1000)
      ]);
      setTasks(tasksData.tasks || []);
      setTasksTotalPages(tasksData.pagination?.totalPages || 1);
      setTasksPage(page);
      setProjectMembers(membersData.members || []);
    } catch (err) {
      console.error('Failed to fetch tasks/members', err);
      setError('Failed to load project board.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskData.name || !newTaskData.description) return;

    try {
      setIsCreating(true);
      await createTask(projectId, activeWorkspace._id, newTaskData);
      setNewTaskData({ name: '', description: '', deadline: '', assignees: [] });
      setShowCreateModal(false);
      await fetchTasksAndMembers(1);
    } catch (err) {
      console.error('Failed to create task', err);
      alert(err?.response?.data?.message || 'Failed to create task.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      await updateTaskStatus(activeWorkspace._id, projectId, taskId, newStatus);
      await fetchTasksAndMembers(tasksPage);
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert(err?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment || !selectedTask) return;

    try {
      setIsAddingComment(true);
      await addComment(activeWorkspace._id, projectId, selectedTask._id, { comment: newComment });
      setNewComment('');
      // Refresh to get new comments
      await fetchTasksAndMembers(tasksPage);
      
      // Update local selected task manually so we don't have to wait or if we want immediate feedback
      // Or just let it refresh on next open. For now, we rely on the main fetch and close/reopen or update state.
      const freshTasks = await getAllTasks(projectId, activeWorkspace._id, tasksPage, 20);
      setTasks(freshTasks.tasks || []);
      const updatedTask = freshTasks.tasks.find(t => t._id === selectedTask._id);
      setSelectedTask(updatedTask);

    } catch (err) {
      console.error('Failed to add comment', err);
      alert(err?.response?.data?.message || 'Failed to add comment.');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resourceName) return;
    if (resourceType === 'link' && !resourceLink) return;
    if (resourceType === 'file' && !resourceFile) return;

    try {
      setIsAddingResource(true);
      const formData = new FormData();
      formData.append('type', resourceType);
      formData.append('name', resourceName);
      if (resourceType === 'link') {
         formData.append('url', resourceLink);
      } else {
         formData.append('file', resourceFile);
      }
      
      await addResource(activeWorkspace._id, projectId, selectedTask._id, formData);
      setResourceName('');
      setResourceLink('');
      setResourceFile(null);
      setResourceType('link');
      
      // Refresh task details
      await fetchTasksAndMembers(tasksPage);
      const freshTasks = await getAllTasks(projectId, activeWorkspace._id, tasksPage, 20);
      setTasks(freshTasks.tasks || []);
      const updatedTask = freshTasks.tasks.find(t => t._id === selectedTask._id);
      setSelectedTask(updatedTask);
    } catch (err) {
      console.error('Failed to add resource', err);
      alert(err?.response?.data?.message || 'Failed to add resource.');
    } finally {
      setIsAddingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Remove this resource?')) return;
    try {
      await deleteResource(activeWorkspace._id, projectId, selectedTask._id, resourceId);
      const freshTasks = await getAllTasks(projectId, activeWorkspace._id, tasksPage, 20);
      setTasks(freshTasks.tasks || []);
      const updatedTask = freshTasks.tasks.find(t => t._id === selectedTask._id);
      setSelectedTask(updatedTask);
    } catch (err) {
      console.error('Failed to delete resource', err);
      alert(err?.response?.data?.message || 'Failed to delete resource.');
    }
  };


  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(activeWorkspace._id, projectId, taskId);
      setShowTaskModal(false);
      setSelectedTask(null);
      await fetchTasksAndMembers(tasksPage);
    } catch (err) {
      console.error('Failed to delete task', err);
      alert(err?.response?.data?.message || 'Failed to delete task.');
    }
  };

  const statuses = ['assigned', 'accepted', 'in_progress', 'on_review', 'completed'];

  const columns = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {});

  const getNextStatus = (current) => {
    const idx = statuses.indexOf(current);
    if (idx !== -1 && idx < statuses.length - 1) return statuses[idx + 1];
    return current;
  };
  const getPrevStatus = (current) => {
    const idx = statuses.indexOf(current);
    if (idx !== -1 && idx > 0) return statuses[idx - 1];
    return current;
  };

  if (!activeWorkspace) return null;

  return (
    <section className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/project')}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Task Board</h1>
            <p className="text-sm text-slate-500">Workspace: {activeWorkspace.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {tasksTotalPages > 1 && (
            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 mr-2">
              <button 
                onClick={() => fetchTasksAndMembers(tasksPage - 1)}
                disabled={tasksPage === 1}
                className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-xs font-medium text-slate-600">
                {tasksPage} / {tasksTotalPages}
              </span>
              <button 
                onClick={() => fetchTasksAndMembers(tasksPage + 1)}
                disabled={tasksPage === tasksTotalPages}
                className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors whitespace-nowrap"
          >
            + New Task
          </button>
        </div>
      </div>

      {error && (
        <div className="m-6 rounded-md bg-red-50 p-4 shrink-0">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-500">Loading tasks...</div>
        ) : (
          <div className="flex h-full gap-6 items-start w-max min-w-full">
            {statuses.map((status) => (
              <div key={status} className="w-80 flex flex-col max-h-full bg-slate-100/50 rounded-2xl border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-xs">
                    {status.replace('_', ' ')}
                  </h3>
                  <span className="bg-white text-slate-500 text-xs py-0.5 px-2 rounded-full border border-slate-200 font-medium">
                    {columns[status].length}
                  </span>
                </div>
                
                <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-3 scrollbar-hide">
                  {columns[status].map((task) => (
                    <div 
                      key={task._id} 
                      onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}
                      className="group bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-sky-300 hover:shadow-md transition-all relative"
                    >
                      <h4 className="font-medium text-slate-900 mb-2">{task.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">{task.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No date'}</span>
                        </div>
                        
                        {/* Quick Move Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {status !== 'assigned' && (
                            <button 
                              onClick={(e) => handleStatusChange(task._id, getPrevStatus(status), e)}
                              className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded"
                            >
                              &larr;
                            </button>
                          )}
                          {status !== 'completed' && (
                            <button 
                              onClick={(e) => handleStatusChange(task._id, getNextStatus(status), e)}
                              className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded"
                            >
                              &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Task Name *</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={newTaskData.name}
                    onChange={(e) => setNewTaskData({...newTaskData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description *</label>
                  <textarea
                    id="description"
                    required
                    rows="3"
                    value={newTaskData.description}
                    onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-slate-700">Deadline</label>
                  <input
                    type="date"
                    id="deadline"
                    value={newTaskData.deadline}
                    onChange={(e) => setNewTaskData({...newTaskData, deadline: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Assignees</label>
                  <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-md p-2 bg-slate-50">
                    {projectMembers.map(pm => (
                      <label key={pm.userId._id} className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTaskData.assignees.includes(pm.userId._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTaskData({ ...newTaskData, assignees: [...newTaskData.assignees, pm.userId._id] });
                            } else {
                              setNewTaskData({ ...newTaskData, assignees: newTaskData.assignees.filter(id => id !== pm.userId._id) });
                            }
                          }}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-700">{pm.userId.name} ({pm.userId.email})</span>
                      </label>
                    ))}
                    {projectMembers.length === 0 && <p className="text-xs text-slate-500 italic">No project members available.</p>}
                  </div>
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
                  disabled={isCreating}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-start p-6 border-b border-slate-200 bg-slate-50 shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 uppercase tracking-wider border border-sky-200">
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500">
                    Created by {selectedTask.createdBy?.name || 'Unknown'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedTask.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDeleteTask(selectedTask._id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete Task"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Status Change Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={selectedTask.status}
                  onChange={(e) => handleStatusChange(selectedTask._id, e.target.value)}
                  className="block w-48 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="assigned">Assigned</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_review">On Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedTask.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Assignees</h3>
                  {selectedTask.assignees?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.assignees.map(user => (
                        <div key={user._id} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-sm">
                           <div className="h-5 w-5 rounded-full bg-sky-200 flex items-center justify-center text-sky-800 text-xs font-bold">
                              {user.name?.charAt(0) || 'U'}
                           </div>
                           <span>{user.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No assignees</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Deadline</h3>
                  <p className="text-sm text-slate-700">
                    {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No deadline set'}
                  </p>
                </div>
              </div>

              {/* Resources Section */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Resources</h3>
                
                <div className="space-y-3 mb-6">
                  {selectedTask.resources?.length > 0 ? (
                    <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
                      {selectedTask.resources.map((res, idx) => (
                        <li key={idx} className="flex items-center justify-between py-3 px-4 bg-white hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </div>
                            <div>
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:underline">
                                {res.name}
                              </a>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteResource(res._id)}
                            title="Delete resource"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No resources attached yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddResource} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <h4 className="text-sm font-medium text-slate-700">Add a Resource</h4>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="radio" value="link" checked={resourceType === 'link'} onChange={() => setResourceType('link')} className="text-sky-600 focus:ring-sky-500" /> Link
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="radio" value="file" checked={resourceType === 'file'} onChange={() => setResourceType('file')} className="text-sky-600 focus:ring-sky-500" /> File Upload
                    </label>
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Resource Name *" 
                      required 
                      value={resourceName}
                      onChange={(e) => setResourceName(e.target.value)}
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 mb-3" 
                    />
                  </div>
                  {resourceType === 'link' ? (
                    <input 
                      type="url" 
                      placeholder="https://example.com" 
                      required 
                      value={resourceLink}
                      onChange={(e) => setResourceLink(e.target.value)}
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" 
                    />
                  ) : (
                    <input 
                      type="file" 
                      required 
                      onChange={(e) => setResourceFile(e.target.files[0])}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" 
                    />
                  )}
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={isAddingResource} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">
                      {isAddingResource ? 'Uploading...' : 'Attach Resource'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Comments</h3>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {selectedTask.comments?.length > 0 ? (
                    selectedTask.comments.map((c, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                          {c.commentBy?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-1">
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="font-medium text-sm text-slate-900">{c.commentBy?.name || 'Unknown User'}</span>
                            <span className="text-xs text-slate-500">{new Date(c.commentAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.comment}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No comments yet. Be the first to start the discussion!</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="mt-auto">
                  <label htmlFor="comment" className="sr-only">Add a comment</label>
                  <div className="relative">
                    <textarea
                      id="comment"
                      rows="2"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-20 resize-none"
                    ></textarea>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isAddingComment}
                      className="absolute bottom-2 right-2 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50"
                    >
                      {isAddingComment ? '...' : 'Post'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default Task;