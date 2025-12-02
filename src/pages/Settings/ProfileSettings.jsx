import { useState, useEffect, useContext } from "react";
import UserContext from "../../context/UserContext";
import api from "../../api/axios";
import defaultProfile from "../../assets/profile-pic-avatar.jpg";

export default function ProfileSettings() {
  const { currentUser, setCurrentUser } = useContext(UserContext);

  // --- Username state ---
  const [username, setUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");

  // --- Profile picture state ---
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(defaultProfile);
  const [picLoading, setPicLoading] = useState(false);
  const [picError, setPicError] = useState("");
  const [picMessage, setPicMessage] = useState("");

  // --- Initialize username and profile pic once on mount ---
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setPreview(
        currentUser.profilePic && currentUser.profilePic.startsWith("http")
          ? currentUser.profilePic
          : currentUser.profilePic
          ? `${import.meta.env.VITE_API_URL}/${currentUser.profilePic}`
          : defaultProfile
      );
    }
  }, []); // Run only once

  // --- Helper to merge and preserve token ---
  const mergeAndSetUser = (newUserData) => {
    setCurrentUser((prev) => {
      const token = prev?.token || newUserData?.token;
      const merged = { ...(prev || {}), ...(newUserData || {}) };
      if (token) merged.token = token;
      try {
        localStorage.setItem("currentUser", JSON.stringify(merged));
      } catch (err) {
        console.error("Failed to persist currentUser:", err);
      }
      return merged;
    });
  };

  // --- Handle profile picture selection ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPicError("Please select a valid image file.");
      return;
    }
    setProfilePicFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    setPicError("");
    setPicMessage("");
  };

  // --- Upload profile picture ---
  const handleProfilePicUpdate = async () => {
    if (!profilePicFile) return;
    setPicLoading(true);
    setPicError("");
    setPicMessage("");

    try {
      const formData = new FormData();
      formData.append("profilePic", profilePicFile);

      const response = await api.post("/users/profile/pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const returnedUser = response.data?.user || response.data;
      if (!returnedUser) throw new Error("No user in response");

      mergeAndSetUser(returnedUser);

      // Use full URL if Cloudinary returns it
      const picUrl = returnedUser.profilePic
        ? returnedUser.profilePic.startsWith("http")
          ? returnedUser.profilePic
          : `${import.meta.env.VITE_API_URL}/${returnedUser.profilePic}`
        : defaultProfile;

      setPreview(picUrl);
      setProfilePicFile(null);
      setPicMessage("Profile picture updated successfully!");
    } catch (err) {
      console.error("Profile pic upload error:", err);
      setPicError(err.response?.data?.message || err.message || "Failed to update profile picture.");
    } finally {
      setPicLoading(false);
    }
  };

  // --- Update username ---
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameError("");
    setUsernameMessage("");

    try {
      const response = await api.put("/users/profile", { username });
      const returnedUser = response.data?.user || response.data;
      if (!returnedUser) throw new Error("No user in response");

      mergeAndSetUser(returnedUser);
      setUsername(returnedUser.username); // Ensure input shows updated username
      setUsernameMessage("Username updated successfully!");
    } catch (err) {
      console.error("Username update error:", err);
      setUsernameError(err.response?.data?.message || err.message || "Failed to update username.");
    } finally {
      setUsernameLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Profile Settings</h2>

      <div className="flex flex-col items-center gap-2 mb-6">
        <img
          src={preview}
          alt="Profile Preview"
          className="w-32 h-32 rounded-full object-cover border border-gray-300"
        />
        <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
        {picError && <p className="text-red-500 text-sm">{picError}</p>}
        {picMessage && <p className="text-green-500 text-sm">{picMessage}</p>}
        <button
          onClick={handleProfilePicUpdate}
          disabled={picLoading || !profilePicFile}
          className={`mt-2 w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${
            picLoading || !profilePicFile ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {picLoading ? "Updating..." : "Update Profile Picture"}
        </button>
      </div>

      <form onSubmit={handleUsernameUpdate} className="flex flex-col gap-4">
        <label htmlFor="username" className="block font-medium">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
        {usernameMessage && <p className="text-green-500 text-sm">{usernameMessage}</p>}
        <button
          type="submit"
          disabled={usernameLoading}
          className={`w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${
            usernameLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {usernameLoading ? "Updating..." : "Update Username"}
        </button>
      </form>
    </div>
  );
}
