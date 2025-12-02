import { useContext, useState, useEffect } from "react"; 
import { useNavigate, useLocation } from "react-router-dom";
import UserContext from "../context/UserContext";
import api from "../api/axios";
import UserListModal from "./UserListModal";
import defaultProfile from "../assets/profile-pic-avatar.jpg";

// Helper to get profile picture URL
const getProfilePicUrl = (user) => {
  if (!user?.profilePic) return defaultProfile;
  return user.profilePic.startsWith("http")
    ? user.profilePic
    : `${import.meta.env.VITE_API_URL}${user.profilePic}`;
};

export default function Sidebar({ isOpen, setIsOpen }) {
  const { currentUser, setCurrentUser, unreadNotifications, setUnreadNotifications } =
    useContext(UserContext);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ type: "", users: [] });

  const [visibleProfilePic, setVisibleProfilePic] = useState(defaultProfile);

  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  useEffect(() => {
    if (!currentUser) {
      const stored = localStorage.getItem("currentUser");
      if (stored) setCurrentUser(JSON.parse(stored));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const url = getProfilePicUrl(currentUser);
    const img = new Image();
    img.src = url;
    img.onload = () => setVisibleProfilePic(url);
    img.onerror = () => setVisibleProfilePic(defaultProfile);
  }, [currentUser]);

  // Fetch notifications periodically
  useEffect(() => {
    if (!currentUser?.token) return;
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const resProfile = await api.get("/users/profile");
        if (resProfile.data.status === 1 && isMounted) {
          const updated = { ...resProfile.data.user, token: currentUser.token };
          setCurrentUser(updated);
          localStorage.setItem("currentUser", JSON.stringify(updated));
        }

        if (location.pathname !== "/notifications") {
          const resNotif = await api.get("/notifications", {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          });

          const notificationsArray =
            resNotif.data.notifications || resNotif.data.data || [];

          const count = notificationsArray.filter((n) => !n.read).length;
          if (isMounted) setUnreadNotifications(count);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
        if (isMounted) setUnreadNotifications(0);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser, location.pathname, setCurrentUser, setUnreadNotifications]);

  // Reset badge when visiting notifications page
  useEffect(() => {
    if (location.pathname === "/notifications") setUnreadNotifications(0);
  }, [location.pathname, setUnreadNotifications]);

  if (!currentUser) return null;

  const navItems = [
    { to: "/home", label: "Home", icon: "🏠" },
    { to: "/messages", label: "Messages", icon: "💬" },
    { to: "/notifications", label: "Notifications", icon: "🔔", badge: unreadNotifications },
    { to: "/create-post", label: "Create Post", icon: "✏️" },
  ];

  const linkClasses =
    "flex items-center gap-4 px-5 py-3 rounded-lg text-base text-gray-700 hover:text-blue-600 w-full text-left transition-all duration-150";

  const handleNavClick = (to) => {
    if (isMobile) setIsOpen(false);

    // Clicking Notifications clears badge permanently
    if (to === "/notifications") setUnreadNotifications(0);

    setTimeout(() => navigate(to), 50);
  };

  const openList = async (type) => {
    try {
      const res = await api.get(`/users/${currentUser._id}/${type}`);
      setModalData({ type, users: res.data[type] || [] });
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r shadow-lg
        flex flex-col p-4 md:p-6
        w-[75vw] max-w-[280px] sm:w-64
        transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:static md:translate-x-0
        overflow-y-auto`}
      >
        <button
          className="md:hidden absolute top-4 right-4 text-2xl"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>

        <h1
          className="text-2xl font-bold italic mb-8 cursor-pointer"
          onClick={() => handleNavClick("/home")}
        >
          Lynk
        </h1>

        <div className="flex flex-col items-center mb-8 w-full">
          <img
            src={visibleProfilePic}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border cursor-pointer"
            alt="profile"
            onClick={() => handleNavClick(`/profile/${currentUser._id}`)}
          />

          <h2
            className="mt-2 text-lg font-semibold hover:text-blue-600 cursor-pointer"
            onClick={() => handleNavClick(`/profile/${currentUser._id}`)}
          >
            {currentUser.username}
          </h2>

          <div className="flex gap-6 mt-3 text-center text-sm w-full justify-center">
            <div onClick={() => openList("followers")} className="cursor-pointer">
              <p className="font-bold">{currentUser.followers?.length || 0}</p>
              <p className="text-gray-600">Followers</p>
            </div>

            <div onClick={() => openList("following")} className="cursor-pointer">
              <p className="font-bold">{currentUser.following?.length || 0}</p>
              <p className="text-gray-600">Following</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          {navItems.map(({ to, label, icon, badge }) => (
            <button
              key={to}
              className={linkClasses}
              onClick={() => handleNavClick(to)}
            >
              <span className="text-xl">{icon}</span>
              {label}
              {badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-6 pt-4 border-t">
          <button className={linkClasses} onClick={() => handleNavClick("/settings")}>
            ⚙️ Settings
          </button>
        </div>
      </div>

      {showModal && (
        <UserListModal
          type={modalData.type}
          users={modalData.users}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
