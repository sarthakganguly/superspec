import { useState, useEffect } from "react";
import axios from "axios";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.get("/api/auth/users/me")
        .then((response) => {
          if (isMounted) setUser(response.data);
        })
        .catch((error) => {
          console.error("Failed to fetch user", error);
          if (isMounted) setToken(null);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return { token, user, loading, login, logout };
};
