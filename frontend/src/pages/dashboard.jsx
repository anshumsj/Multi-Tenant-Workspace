import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const workspaceRes = await API.get("/workspace/getAllWorkspaces");
      setWorkspaces(workspaceRes.data.workspaces);
    } catch (err) {
      if (err.response?.status === 401) navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspaceHandler = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/workspace/create", newWorkspace);
      setWorkspaces([...workspaces, res.data.workspace]);
      setShowModal(false);
      setNewWorkspace({ name: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const logoutHandler = async () => {
    try {
      await API.post("/auth/logout");
      logout();
    } catch (err) {
      console.log(err);
    } finally {
      navigate("/");
    }
  };

  const colors = ["#6c63ff", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const getColor = (name) => colors[name?.charCodeAt(0) % colors.length];

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <p className="text-[#666] text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0f0f0f] overflow-hidden">

      {/* Sidebar */}
      <div className="w-60 min-w-[240px] bg-[#1a1a1a] border-r border-[#2e2e2e] flex flex-col py-5">

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 pb-5 border-b border-[#2e2e2e]">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">W</div>
          <span className="text-[#f0f0f0] text-base font-medium">WorkSpace</span>
        </div>

        {/* Workspace List */}
        <div className="px-3 pt-4 flex-1 overflow-y-auto">
          <p className="text-[11px] text-[#555] uppercase tracking-widest mb-2 px-2">Workspaces</p>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 w-full px-3 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-[#a09af0] text-sm mb-3 hover:bg-indigo-500/20 transition-all">
            <span className="text-indigo-400 text-base">+</span> New Workspace
          </button>
          {workspaces.map((ws) => (
            <div key={ws._id} onClick={() => navigate(`/workspace/${ws._id}`)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-all mb-0.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                style={{ background: getColor(ws.name) }}>
                {ws.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[#ccc] text-sm truncate">{ws.name}</span>
            </div>
          ))}
        </div>

        {/* User + Logout */}
        <div className="px-3 pt-3 border-t border-[#2e2e2e]">
          <div className="flex items-center gap-2.5 p-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#ddd] text-sm font-medium truncate">{user?.name}</p>
              <p className="text-[#666] text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logoutHandler}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-[#666] text-sm rounded-md hover:text-red-400 hover:bg-red-400/10 transition-all mt-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-10">
        <div className="mb-8">
          <h1 className="text-[#f0f0f0] text-2xl font-medium mb-1">Welcome back, {user?.name} 👋</h1>
          <p className="text-[#666] text-sm">Here's an overview of your workspaces</p>
        </div>

        <p className="text-[11px] text-[#666] uppercase tracking-widest font-medium mb-4">Your Workspaces</p>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {workspaces.map((ws) => (
            <div key={ws._id} onClick={() => navigate(`/workspace/${ws._id}`)}
              className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 cursor-pointer hover:border-indigo-500/30 hover:bg-[#1e1e2e] transition-all">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-medium"
                  style={{ background: getColor(ws.name) }}>
                  {ws.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[#f0f0f0] text-sm font-medium">{ws.name}</p>
                  <p className="text-[#666] text-xs mt-0.5 truncate">{ws.description || "No description"}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <p className="text-xs text-[#666]"><span className="text-[#aaa] font-medium">{ws.members?.length || 0}</span> members</p>
              </div>
            </div>
          ))}

          {/* Create card */}
          <div onClick={() => setShowModal(true)}
            className="border border-dashed border-[#2e2e2e] rounded-xl p-5 cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <span className="text-2xl text-[#444]">+</span>
            <span className="text-xs text-[#555]">Create new workspace</span>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}>
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[#f0f0f0] text-lg font-medium mb-1">Create Workspace</h2>
            <p className="text-[#666] text-sm mb-6">Set up a new workspace for your team</p>
            <form onSubmit={createWorkspaceHandler} className="space-y-4">
              <div>
                <label className="text-[#aaa] text-sm block mb-1.5">Workspace name</label>
                <input type="text" placeholder="e.g. Dev Team"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  className="w-full bg-[#111] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-[#f0f0f0] text-sm outline-none focus:border-indigo-500 placeholder-[#555]" />
              </div>
              <div>
                <label className="text-[#aaa] text-sm block mb-1.5">Description <span className="text-[#555]">(optional)</span></label>
                <input type="text" placeholder="What is this workspace for?"
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                  className="w-full bg-[#111] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-[#f0f0f0] text-sm outline-none focus:border-indigo-500 placeholder-[#555]" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#2e2e2e] text-[#888] rounded-lg text-sm hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-all">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;