import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import UserContext from "../context/UserContext";
import { useLocation } from "react-router-dom";

export default function Feed() {
  const { currentUser } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const postId = location?.state?.postId || null;

  // Fetch full feed
  const fetchFeed = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const res = await api.get("/posts/feed");
      setPosts(res.data.feed || []);
    } catch (err) {
      console.error("Feed fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single post by ID
  const fetchPostById = async () => {
    if (!currentUser?.token || !postId) return;
    try {
      setLoading(true);
      const res = await api.get(`/posts/${postId}`);
      setPosts([res.data.post]);
    } catch (err) {
      console.error("Post load error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchPostById();
    else fetchFeed();
  }, [postId, currentUser?.token]);

  return (
    <div className="w-full min-h-screen px-2 md:px-6 py-4 flex justify-center">
      <div className="w-full max-w-[1400px] flex flex-col gap-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading post...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts found.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="w-full md:w-[90%] lg:w-[80%] mx-auto">
              <PostCard
                post={post}
                setPosts={setPosts}
                refreshPosts={postId ? fetchPostById : fetchFeed}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
