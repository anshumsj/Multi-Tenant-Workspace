import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Workspace = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // forms
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [memberEmail, setMemberEmail] = useState("");

  // check if current user is admin
  const isAdmin = workspace?.createdBy?.toString() === user?.id;

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const fetchData = async () => {
    try {
        const [workspaceRes, memberRes, projectRes] = await Promise.all([
            API.get("/workspace/getAllWorkspaces"),
            API.get(`/getAllMembers/${workspaceId}`),
            API.get(`/project/getAllProjects/${workspaceId}`)
        ]);
        
        // extract the specific workspace
        const found = workspaceRes.data.workspaces.find(ws => ws._id === workspaceId);
        setWorkspace(found);
        setMembers(memberRes.data.members);
        setProjects(projectRes.data.projects);
    } catch (err) {
        if (err.response?.status === 401) navigate("/");
    } finally {
        setLoading(false);
    }
};

const createProjectHandler = async (e) => {
    e.preventDefault();
    setError("");
    try {
        const res = await API.post(`/project/create/${workspaceId}`, newProject);
        setProjects([...projects, res.data.project]);
        setShowProjectModal(false);
        setNewProject({ name: "", description: "" });
    } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
    }
};

const addMemberHandler = async (e) => {
    e.preventDefault();
    setError("");
    try {
        const res = await API.post(`/workspace/addMember/${workspaceId}`, newMember);
        setMembers([...members, res.data.member]);
        setShowMemberModal(false);
        setMemberEmail("");
    } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
    }
};

const removeMemberHandler = async (memberId) => {
    setError("");
    try {
        await API.delete(`/workspace/removeMember/${workspaceId}`, { data: { memberId } });
        setMembers(members.filter(m => m._id !== memberId));
    } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
    }
};

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* fill in the basic structure */}
    </div>
  );
};

export default Workspace;