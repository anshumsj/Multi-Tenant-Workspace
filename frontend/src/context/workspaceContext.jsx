import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllWorkspaces } from '../api/workspaceApi';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await getAllWorkspaces();
      // Assuming API returns { workspaces: [...] } based on standard patterns, 
      // but if it's an array directly we handle both:
      const fetchedWorkspaces = data.workspaces || data || [];
      setWorkspaces(fetchedWorkspaces);
      
      // If we don't have an active workspace but we have workspaces, set the first one
      if (fetchedWorkspaces.length > 0 && !activeWorkspace) {
        // optionally set default active workspace
        // setActiveWorkspace(fetchedWorkspaces[0]);
      }
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
      setError("Failed to fetch workspaces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const value = {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    fetchWorkspaces,
    loading,
    error,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
