import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import UserContext from "../context/UserContext";

const DEFAULT_PROFILE = "/profile-pic-avatar.jpg"; // fallback for missing profile images

const fixProfilePic = (path, fallback = DEFAULT_PROFILE) => {
  if (!path) return fallback;
  if (path.startsWith("http")) return path;
  return `${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function NotificationsPage() {
  const { currentUser } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUser?.token) return;

    try {
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });

      if (res.data.status === 1) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  // Handle clicking a notification
  const handleNotificationClick = async (notif) => {
    if (!currentUser?.token) return;

    try {
      // Mark as read
      if (!notif.read) {
        await api.patch(`/notifications/read/${notif._id}`, null, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });

        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notif._id ? { ...n, read: true } : n
          )
        );
      }

      // FOLLOW → navigate to profile
      if (notif.type === "follow" && notif.sender?._id) {
        navigate(`/profile/${notif.sender._id}`);
        return;
      }

      // LIKE or COMMENT → navigate to post
      if ((notif.type === "like" || notif.type === "comment") && notif.postId?._id) {
        const state = notif.type === "comment" ? { openComments: true } : {};
        navigate(`/post/${notif.postId._id}`, { state });
        return;
      }

      console.warn("Invalid notification target:", notif);
    } catch (err) {
      console.error("Error handling notification click:", err);
    }
  };

  if (!currentUser) return <p className="p-4">Loading user...</p>;
  if (!notifications.length) return <p className="p-4">No notifications yet.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <ul className="space-y-2">
        {notifications.map((notif) => (
          <li
            key={notif._id}
            onClick={() => handleNotificationClick(notif)}
            className={`p-3 rounded-md cursor-pointer flex items-center gap-2 hover:bg-blue-100 ${
              !notif.read ? "bg-blue-50" : "bg-gray-100"
            }`}
          >
            <img
              src={fixProfilePic(
                notif.sender?.profilePic || currentUser.profilePic
              )}
              alt={notif.sender?.username || "user"}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-sm flex-1">
              {notif.type === "follow" && (
                <span>
                  <strong>{notif.sender?.username || "Someone"}</strong> started following you.
                </span>
              )}
              {notif.type === "like" && (
                <span>
                  <strong>{notif.sender?.username || "Someone"}</strong> liked your post.
                </span>
              )}
              {notif.type === "comment" && (
                <span>
                  <strong>{notif.sender?.username || "Someone"}</strong> commented on your post.
                </span>
              )}
            </div>
            {!notif.read && (
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
