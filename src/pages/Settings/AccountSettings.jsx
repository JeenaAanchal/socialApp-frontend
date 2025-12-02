// src/pages/Settings/AccountSettings.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AccountSettings() {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Call backend endpoint to delete account with password verification
      const res = await api.delete("/users/delete-account", { data: { password } });
      if (res.data.status === 1) {
        alert("Your account has been deleted successfully.");
        localStorage.clear();
        navigate("/"); // redirect to login/home page
      }
    } catch (err) {
      console.error(err);
      // Show backend error message
      setError(err.response?.data?.message || "Password incorrect or deletion failed.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>

        <div className="border-t pt-4">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-md transition"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4 text-gray-700">
              Enter your password to permanently delete your account. This action cannot be undone.
            </p>

            <input
              type="password"
              placeholder="Your current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring focus:ring-red-400"
            />
            {error && <p className="text-red-600 mb-3">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setModalOpen(false); setPassword(""); setError(""); }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
