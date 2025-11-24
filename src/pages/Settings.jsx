import { useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../assets/profile-pic-avatar.jpg";

export default function Settings() {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setBio(currentUser.bio || "");
      // Add timestamp to prevent caching
      setProfilePicPreview(currentUser.profilePic ? `${currentUser.profilePic}?t=${Date.now()}` : defaultProfile);
    }
  }, [currentUser]);

  // Update profile info (username + bio)
  const handleProfileUpdate = async () => {
    if (!username.trim()) return;
    try {
      await api.put(
        "/users/profile",
        { username, bio },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );

      const updatedUser = { ...currentUser, username, bio };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  // Upload new profile picture
  const handleUploadProfilePic = async () => {
    if (!profilePic) return;

    try {
      const formData = new FormData();
      formData.append("profilePic", profilePic);

      const res = await api.post("/users/profile/pic", formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = {
        ...currentUser,
        profilePic: res.data.profilePic,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      // Force re-render with new profile pic + timestamp
      setProfilePicPreview(`${res.data.profilePic}?t=${Date.now()}`);
      setProfilePic(null);
    } catch (err) {
      console.error("Profile pic upload failed:", err);
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) return;

    try {
      await api.put(
        "/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("Password change failed:", err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/");
  };

  if (!currentUser) return <p className="p-4">Loading user info...</p>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Settings</h1>

      {/* Profile Info */}
      <div className="border p-4 sm:p-6 rounded-lg mb-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-3">Profile Info</h2>

        <label className="block mb-2 text-sm sm:text-base">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-2 sm:p-3 rounded mb-4 text-sm sm:text-base"
        />

        <label className="block mb-2 text-sm sm:text-base">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border p-2 sm:p-3 rounded text-sm sm:text-base"
        />

        <button
          onClick={handleProfileUpdate}
          className="mt-4 bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded w-full sm:w-auto hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </div>

      {/* Profile Pic Update */}
      <div className="border p-4 sm:p-6 rounded-lg mb-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-3">Change Profile Picture</h2>

        <img
          src={profilePicPreview || defaultProfile}
          alt="profile preview"
          className="w-24 h-24 rounded-full object-cover mb-3 border"
        />

        <input
          type="file"
          onChange={(e) => {
            if (e.target.files[0]) {
              setProfilePic(e.target.files[0]);
              setProfilePicPreview(URL.createObjectURL(e.target.files[0]));
            }
          }}
          className="mb-3 w-full sm:w-auto"
        />

        <button
          onClick={handleUploadProfilePic}
          className="bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded w-full sm:w-auto hover:bg-green-700 transition"
        >
          Upload New Picture
        </button>
      </div>

      {/* Password Change */}
      <div className="border p-4 sm:p-6 rounded-lg mb-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-3">Change Password</h2>

        <label className="block mb-2 text-sm sm:text-base">Old Password</label>
        <input
          type="password"
          className="w-full border p-2 sm:p-3 rounded mb-3 text-sm sm:text-base"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <label className="block mb-2 text-sm sm:text-base">New Password</label>
        <input
          type="password"
          className="w-full border p-2 sm:p-3 rounded mb-3 text-sm sm:text-base"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          onClick={handlePasswordChange}
          className="bg-yellow-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded w-full sm:w-auto hover:bg-yellow-700 transition"
        >
          Update Password
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded w-full hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}
