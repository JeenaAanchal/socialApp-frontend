import { useState, useContext } from "react";
import api from "../api/axios";
import UserContext from "../context/UserContext";

// Default profile image
import defaultProfile from "../assets/profile-pic-avatar.jpg";

// Backend base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper to fix backend URLs
const fixURL = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${API_URL}${path}`;
  return `${API_URL}/${path}`;
};

export default function PostCard({ post, setPosts, refreshPosts }) {
  const { currentUser } = useContext(UserContext);
  if (!post || !post.author || !currentUser) return null;

  const isOwner = post.author._id === currentUser._id;

  // Use latest currentUser pic for own posts
  const profilePicURL = isOwner
    ? currentUser.profilePic || defaultProfile
    : post.author.profilePic
      ? fixURL(post.author.profilePic)
      : defaultProfile;

  const postImageURL = post.image ? fixURL(post.image) : null;

  const initialLikes = Array.isArray(post.likes) ? post.likes : [];
  const [liked, setLiked] = useState(initialLikes.includes(currentUser._id));
  const [likesCount, setLikesCount] = useState(initialLikes.length);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");

  // Like/unlike post
  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((c) => (newLiked ? c + 1 : c - 1));
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      setLiked(!newLiked);
      setLikesCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: newComment });
      const updated = res.data.comments;
      setComments(updated);
      setNewComment("");
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, comments: updated } : p))
      );
    } catch {}
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/${post._id}/comment/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {}
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      refreshPosts?.();
    } catch {}
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm w-full max-w-2xl mx-auto mb-6 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <img
            src={profilePicURL}
            onError={(e) => (e.target.src = defaultProfile)}
            className="w-12 h-12 rounded-full object-cover"
            alt="profile"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-base">{post.author.username}</span>
            <span className="text-xs text-gray-500 hidden sm:block">
              @{post.author.username.toLowerCase()}
            </span>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleDeletePost}
            className="text-red-500 text-sm font-semibold hover:underline"
          >
            Delete
          </button>
        )}
      </div>

      {/* POST IMAGE */}
      {postImageURL && (
        <div className="w-full flex justify-center bg-black/5 mb-2">
          <img
            src={postImageURL}
            onError={(e) => (e.target.src = defaultProfile)}
            className="w-full h-auto object-contain rounded"
            alt="post"
          />
        </div>
      )}

      {/* POST CONTENT */}
      {post.content && (
        <div className="px-4 py-2">
          <p className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between items-center px-4 py-2 border-t">
        <button
          onClick={handleLike}
          className={`font-semibold text-sm sm:text-base flex items-center gap-1 ${
            liked ? "text-blue-600" : "text-gray-700"
          }`}
        >
          👍 {liked ? "Liked" : "Like"} ({likesCount})
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="font-semibold text-gray-700 text-sm sm:text-base flex items-center gap-1"
        >
          💬 Comment ({comments.length})
        </button>
      </div>

      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="px-4 py-2 border-t overflow-y-auto max-h-48">
          {comments.map((c) => (
            <div key={c._id} className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold">{c.author.username}:</span>{" "}
                <span>{c.text}</span>
              </div>
              {c.author._id === currentUser._id && (
                <button
                  onClick={() => handleDeleteComment(c._id)}
                  className="text-red-500 text-xs ml-2"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-600 text-white px-3 rounded"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
