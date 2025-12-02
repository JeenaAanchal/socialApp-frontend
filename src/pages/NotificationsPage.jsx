import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import UserContext from "../context/UserContext";
import defaultAvatar from "../assets/profile-pic-avatar.jpg";
import trashIcon from "../assets/trash.png";

const DEFAULT_PROFILE = defaultAvatar;

const fixProfilePic = (path) => {
  if (!path) return DEFAULT_PROFILE;
  const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${BASE}${path}`;
  return `${BASE}/${path}`;
};

export default function NotificationsPage() {
  const { currentUser: user, setUnreadNotifications } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch notifications and update unread badge
  const fetchNotifications = async () => {
    try {
      if (!user?.token) return;
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const data = Array.isArray(res.data.notifications)
        ? res.data.notifications
        : [];

      setNotifications(data);

      const unreadCount = data.filter((n) => !n.read).length;
      setUnreadNotifications(unreadCount);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Auto-refresh every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.token]);

  const handleNotificationClick = async (n) => {
    try {
      if (!n.read) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === n._id ? { ...notif, read: true } : notif
          )
        );
        setUnreadNotifications((prev) => Math.max(prev - 1, 0));

        await api.patch(
          `/notifications/${n._id}/read`,
          {}, // send empty object instead of null
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }

      if (n.type === "follow" && n.sender?._id)
        navigate(`/profile/${n.sender._id}`);
      else if ((n.type === "comment" || n.type === "like") && n.postId?._id)
        navigate(`/post/${n.postId._id}`, {
          state: { openComments: n.type === "comment" },
        });
    } catch (err) {
      console.error("Failed to handle notification click:", err);
    }
  };

  const handleDelete = async (n) => {
    try {
      setNotifications((prev) => prev.filter((notif) => notif._id !== n._id));
      if (!n.read) setUnreadNotifications((prev) => Math.max(prev - 1, 0));

      await api.delete(`/notifications/${n._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <img
          src="/lynk-icon.png"
          alt="Lynk Loader"
          className="w-32 h-32 animate-pulse"
        />
        <p className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (error)
    return <div className="p-4 text-center text-red-500">{error}</div>;

  if (!notifications.length)
    return <div className="p-4 text-center text-gray-500">No notifications found.</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Notifications</h1>

      <ul className="space-y-3">
        {notifications.map((n) => {
          const senderPic = fixProfilePic(n.sender?.profilePic);
          let message = "";
          if (n.type === "follow") message = "started following you";
          else if (n.type === "comment") message = "commented on your post";
          else if (n.type === "like") message = "liked your post";
          else message = n.message || "";

          return (
            <li
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className="flex items-center justify-between gap-3 p-3 border rounded-lg shadow-sm hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <img
                  src={senderPic}
                  alt="user"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = "true";
                      e.target.src = DEFAULT_PROFILE;
                    }
                  }}
                />
                <div>
                  <p className="text-sm text-gray-700">
                    {n.sender?.username || "Someone"} {message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!n.read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n);
                  }}
                  title="Delete"
                >
                  <img src={trashIcon} alt="Delete" className="w-5 h-5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
