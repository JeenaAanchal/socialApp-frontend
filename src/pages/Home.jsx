import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import PostCard from "../components/PostCard";
import UserListModal from "../components/UserListModal";
import api from "../api/axios";
import searchIcon from "../assets/search-icon.png"; // imported

// Backend URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const DEFAULT_PROFILE = "/profile-pic-avatar.jpg";

const fixURL = (path, fallback = "") => {
  if (!path) return fallback;
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
};

export default function Home() {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [feed, setFeed] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [modalData, setModalData] = useState({ type: "", users: [] });
  const [showModal, setShowModal] = useState(false);

  const searchRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Fetch feed posts
  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchFeed = async () => {
      try {
        const res = await api.get("/posts/feed");
        const cleanedFeed = (res.data.feed || []).map((post) => ({
          ...post,
          image: post.image ? fixURL(post.image) : null, // only set if exists
          author: {
            ...post.author,
            profilePic: fixURL(post.author?.profilePic, DEFAULT_PROFILE),
          },
        }));
        setFeed(cleanedFeed);
      } catch (err) {
        console.error("Feed fetch error:", err.response?.data || err.message);
        setFeed([]);
      }
    };

    fetchFeed();
  }, [currentUser]);

  // Hide search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchSearch = async () => {
      try {
        setSearchLoading(true);
        const res = await api.get(`/users/search?q=${searchQuery}`, {
          signal: controller.signal,
        });
        const cleaned = res.data.users.map((u) => ({
          ...u,
          profilePic: fixURL(u.profilePic, DEFAULT_PROFILE),
        }));
        setSearchResults(cleaned);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Search error:", err.response?.data || err.message);
        }
      } finally {
        setSearchLoading(false);
      }
    };

    fetchSearch();
    return () => controller.abort();
  }, [searchQuery]);

  const handleUserClick = (id) => {
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/profile/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-3 sm:px-4 md:px-6 py-4 flex justify-center">
      <div className="w-full max-w-[1400px]">
        {/* Search Bar */}
        <div
          ref={searchContainerRef}
          className="max-w-xl w-full mx-auto mb-5 relative"
        >
          <img
            src={searchIcon}
            alt="search-icon"
            className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
          />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users"
            className="w-full p-3 pl-11 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-sm sm:text-base"
          />

          {/* Dropdown */}
          {searchQuery.trim() && searchResults.length > 0 && (
            <ul className="absolute z-50 w-full bg-white border rounded-lg shadow top-full mt-1 max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <li
                  key={user._id}
                  className="p-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-sm"
                  onClick={() => handleUserClick(user._id)}
                >
                  <img
                    src={user.profilePic || DEFAULT_PROFILE}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{user.username}</span>
                </li>
              ))}
            </ul>
          )}

          {searchQuery.trim() && searchLoading && (
            <div className="absolute right-3 top-3 text-gray-500 text-sm">
              Loading...
            </div>
          )}
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {feed.map((post) => (
            <div key={post._id} className="w-full">
              <PostCard
                post={post}
                setPosts={setFeed}
                refreshPosts={null}
              />
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <UserListModal
            type={modalData.type}
            users={modalData.users}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>

      {/* Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate("/support")}
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          Support
        </button>
      </div>
    </div>
  );
}
