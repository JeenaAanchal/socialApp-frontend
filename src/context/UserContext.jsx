import { createContext, useState, useEffect } from "react";

const UserContext = createContext({
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
  unreadNotifications: 0,
  setUnreadNotifications: () => {},
});

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

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
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        unreadNotifications,
        setUnreadNotifications,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
