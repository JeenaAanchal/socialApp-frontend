import { useState, useEffect } from "react";
import api from "../api/axios";

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [message, setMessage] = useState(null); // frontend feedback
  const [messageType, setMessageType] = useState("success"); // "success" or "error"

  // Generate preview for selected image
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handlePost = async () => {
    if (!caption.trim() && !image) {
      setFileError(true);
      return;
    }
    setFileError(false);
    setMessage(null); // reset previous message

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("content", caption);
      if (image) formData.append("image", image);

      const storedUser = JSON.parse(localStorage.getItem("currentUser"));
      const token = storedUser?.token;

      const res = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Show success message
      setMessage(res.data.message || "Post uploaded successfully!");
      setMessageType("success");

      // Reset form
      setCaption("");
      setImage(null);
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Upload failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Post</h2>

      {/* Frontend message */}
      {message && (
        <p
          className={`mb-4 px-4 py-2 rounded ${
            messageType === "success"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {message}
        </p>
      )}

      <textarea
        className="w-full border p-2 rounded mb-4"
        rows={3}
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <div className="mb-3">
        <label
          htmlFor="fileUpload"
          className={`cursor-pointer px-4 py-2 rounded text-white ${
            fileError ? "bg-red-500" : "bg-gray-700"
          }`}
        >
          Upload Image
        </label>
        <input
          id="fileUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            setImage(e.target.files[0]);
            setFileError(false);
          }}
        />
        {fileError && <p className="text-red-500 text-xs mt-2">No file chosen</p>}
        {image && <p className="text-xs text-gray-600 mt-1">File selected: {image.name}</p>}
      </div>

      <button
        onClick={handlePost}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Post"}
      </button>

      {/* Image preview */}
      {preview && (
        <div className="mt-4">
          <p className="text-sm mb-2">Image Preview:</p>
          <img
            src={preview}
            alt="preview"
            className="w-32 h-32 object-cover rounded"
          />
        </div>
      )}
    </div>
  );
}
