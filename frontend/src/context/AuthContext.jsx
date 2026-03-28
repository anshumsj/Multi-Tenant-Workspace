import { createContext, useContext, useState } from "react";

// 1. create the context
const AuthContext = createContext();

// 2. create the provider — this wraps your app and holds the data
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. custom hook to use the context easily
export const useAuth = () => useContext(AuthContext);