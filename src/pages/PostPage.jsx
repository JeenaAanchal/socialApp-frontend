import { useEffect, useState, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../api/axios";
import UserContext from "../context/UserContext";

const DEFAULT_PROFILE = "/profile-pic-avatar.jpg";

const fixProfilePic = (path, fallback = DEFAULT_PROFILE) => {
  if (!path) return fallback;
  if (path.startsWith("http")) return path;
  return `${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function PostPage() {
  const { currentUser } = useContext(UserContext);
  const { postId } = useParams();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState("");

  const fetchPost = async () => {
    if (!currentUser?.token || !postId) {
      setError("Invalid post URL.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });

      if (!res.data.post) {
        setError("Post not found or unauthorized.");
        setPost(null);
      } else {
        setPost(res.data.post);
        if (location.state?.openComments) setShowComments(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load post.");
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId, currentUser]);

  const handleLike = async () => {
    if (!postId) return;
    try {
      const res = await api.post(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      setPost((prev) => ({ ...prev, likes: res.data.likes }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !postId) return;
    try {
      const res = await api.post(
        `/posts/${postId}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      const addedComment = res.data.comments?.slice(-1)[0];
      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, addedComment],
      }));
      setCommentText("");
      setShowComments(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser?.token) return <p className="p-4">Loading user...</p>;
  if (loading) return <p className="p-4">Loading post...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!post) return null;

  const isLiked = post.likes.some((id) => String(id) === currentUser._id);

  return (
    <div className="w-full px-2 md:px-6 py-4 flex justify-center">
      <div className="w-full max-w-[900px] flex flex-col gap-6">
        {/* Post */}
        <div className="bg-white border rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={fixProfilePic(post.author?.profilePic, currentUser.profilePic)}
              alt={post.author?.username || "user"}
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="font-semibold">{post.author?.username || "Unknown"}</span>
          </div>

          {post.content && <p className="mb-3 whitespace-pre-wrap">{post.content}</p>}

          {post.image && (
            <img
              src={post.image}
              alt="post"
              className="w-full rounded mb-3 object-contain"
            />
          )}

          <div className="flex gap-4">
            <button
              onClick={handleLike}
              className={`font-semibold ${isLiked ? "text-blue-600" : "text-gray-700"}`}
            >
              Like ({post.likes.length})
            </button>
            <button
              onClick={() => setShowComments((prev) => !prev)}
              className="font-semibold text-gray-700"
            >
              Comments ({post.comments.length})
            </button>
          </div>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <h2 className="font-semibold mb-2">Comments</h2>
            {post.comments.map((c) => (
              <div key={c._id} className="mb-2 flex gap-2 items-start">
                <img
                  src={fixProfilePic(c.author?.profilePic, currentUser.profilePic)}
                  alt={c.author?.username || "user"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <span className="font-semibold">{c.author?.username || "Unknown"}</span>{" "}
                  {c.text}
                </div>
              </div>
            ))}

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                onClick={handleComment}
                className="bg-blue-600 text-white px-4 rounded-lg"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
