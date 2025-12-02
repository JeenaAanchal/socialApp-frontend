import { useState, useContext } from "react";
import { Eye, EyeOff } from "lucide-react"; // Heroicons via lucide-react
import UserContext from "../../context/UserContext";
import api from "../../api/axios";

export default function PrivacySettings() {
  const { currentUser } = useContext(UserContext);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // States to toggle visibility
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(
        "/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      setMessage(res.data.message || "Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password update error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to update password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (label, value, setValue, show, setShow) => (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        placeholder={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Change Password</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {message && <div className="text-green-600 mb-4">{message}</div>}

      <form className="flex flex-col gap-4" onSubmit={handlePasswordUpdate}>
        {renderPasswordInput(
          "Old Password",
          oldPassword,
          setOldPassword,
          showOld,
          setShowOld
        )}
        {renderPasswordInput(
          "New Password",
          newPassword,
          setNewPassword,
          showNew,
          setShowNew
        )}
        {renderPasswordInput(
          "Confirm New Password",
          confirmPassword,
          setConfirmPassword,
          showConfirm,
          setShowConfirm
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
