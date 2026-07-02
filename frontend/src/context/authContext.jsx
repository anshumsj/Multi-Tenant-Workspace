import { createContext,useContext,useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setuser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const login = (userData) => {
        setuser(userData);
         localStorage.setItem("user", JSON.stringify(userData));
    }
    const logout = () => {
        setuser(null);
        localStorage.removeItem("user");
    }
    const updateUser = (partial) => {
        setuser(prev => {
            const updated = { ...prev, ...partial };
            localStorage.setItem("user", JSON.stringify(updated));
            return updated;
        });
    };
    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
}