import { createContext, useState, useEffect } from "react";

const UserContext = createContext({
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
});

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if ((parsed._id || parsed.id) && parsed.token) {
          setCurrentUser({ ...parsed, _id: parsed._id || parsed.id });
        }
      }
    } catch (err) {
      console.error("Failed to parse currentUser from localStorage", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser._id && currentUser.token) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext; // <--- default export only
