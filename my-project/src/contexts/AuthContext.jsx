import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api, { authAPI } from "../api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 1. STORAGE HELPER
   * Determines which storage to use based on where the token is currently kept.
   */
  const getStorage = useCallback(() => {
    return localStorage.getItem("token") ? localStorage : sessionStorage;
  }, []);

  /**
   * 2. LOGOUT FUNCTION
   * Memoized to prevent unnecessary re-renders in components that use it.
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    
    // Remove header from Axios
    delete api.defaults.headers.common["Authorization"];
    
    // Clear all potential storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }, []);

  /**
   * 3. INITIALIZATION
   * Runs once on mount to restore the session and verify it with the server.
   */
  useEffect(() => {
    const initAuth = async () => {
      const storage = getStorage();
      const storedToken = storage.getItem("token");
      const storedUser = storage.getItem("user");

      if (storedToken) {
        // Sync token to state and API headers immediately
        setToken(storedToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Malformed user data in storage");
          }
        }

        // Verify session with the backend
        try {
          const response = await authAPI.profile();
          const freshUser = response.data;
          setUser(freshUser);
          storage.setItem("user", JSON.stringify(freshUser));
        } catch (err) {
          // If the token is expired/invalid, the API will fail; log out.
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [getStorage, logout]);

  /**
   * 4. LOGIN FUNCTION
   */
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (!response.data || !response.data.token) {
        return { success: false, error: "Invalid credentials" };
      }

      const { token: newToken, user: authUser } = response.data;

      // Update State
      setToken(newToken);
      setUser(authUser);

      // Update Axios Headers
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      // Persist to Storage
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", newToken);
      storage.setItem("user", JSON.stringify(authUser));

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      return { success: false, error: message };
    }
  };

  /**
   * 5. REGISTER FUNCTION
   */
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (!response.data || !response.data.token) {
        return { success: false, error: "Registration failed" };
      }

      const { token: newToken, user: authUser } = response.data;

      // Update State
      setToken(newToken);
      setUser(authUser);

      // Update Axios Headers
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      // Persist to Storage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(authUser));

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      return { success: false, error: message };
    }
  };


  /**
   * 5. UPDATE USER FUNCTION
   */
  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      
      const storage = getStorage();
      storage.setItem("user", JSON.stringify(updated));
      
      return updated;
    });
  };

  /**
   * 6. CONTEXT VALUE
   * Memoized to prevent components from re-rendering unless data actually changes.
   */
  const value = useMemo(() => ({
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    loading,
  }), [user, token, loading, logout, register]);


  return (
    <AuthContext.Provider value={value}>
      {/* Do not render children until initial loading is complete to prevent auth flashes */}
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};

/**
 * CUSTOM HOOK
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};