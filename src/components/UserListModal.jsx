import React from "react";
import { useNavigate } from "react-router-dom";

// Import default images
import defaultProfile from "../assets/profile-pic-avatar.jpg";
import crossIcon from "../assets/cross-icon.png";

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const fixURL = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
};

export default function UserListModal({ type, users, onClose }) {
  const navigate = useNavigate();

  const handleUserClick = (id) => {
    onClose();
    navigate(`/profile/${id}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96 max-h-[80vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg font-bold"
        >
          <img
            src={crossIcon}
            alt="Close"
            className="w-4 h-4 hover:cursor-pointer"
          />
        </button>

        <h2 className="text-xl font-bold mb-4 capitalize">{type}</h2>

        {users.length === 0 ? (
          <p className="text-gray-500 text-center">No users found</p>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-3 mb-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
              onClick={() => handleUserClick(u._id)}
            >
              <img
                src={u.profilePic ? fixURL(u.profilePic) : defaultProfile}
                alt={u.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>{u.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
