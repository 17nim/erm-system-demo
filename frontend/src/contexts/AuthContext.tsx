import { createContext, useContext, useEffect, useState } from "react";

interface User {
  user_id: string;
  company_code: string;
  first_name: string;
  last_name: string;
  email: string;
  division: string;
  role: string;
  exp: number;
  iat: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("authToken")}`,
          },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
