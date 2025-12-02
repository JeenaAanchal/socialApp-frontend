import { useEffect, useState, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import api from "../api/axios";
import UserContext from "../context/UserContext";
import UserListModal from "../components/UserListModal";
import defaultProfile from "../assets/profile-pic-avatar.jpg";

const DEFAULT_PROFILE = defaultProfile;

const resolvePic = (pic) => {
  if (!pic || typeof pic !== "string") return DEFAULT_PROFILE;
  if (pic.startsWith("http")) return pic;
  return `${import.meta.env.VITE_API_URL}/${pic}`;
};

export default function UserProfile() {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ type: "", users: [] });
  const [refreshFlag, setRefreshFlag] = useState(false);

  const refreshPosts = () => setRefreshFlag((p) => !p);

  const mergeAndSetUser = useCallback(
    (newUser) => {
      setCurrentUser((prev) => {
        const prevToken = prev?.token;
        const merged = { ...(prev || {}), ...(newUser || {}) };
        if (prevToken && !merged.token) merged.token = prevToken;
        try {
          localStorage.setItem("currentUser", JSON.stringify(merged));
        } catch (err) {
          console.error("persist user error:", err);
        }
        return merged;
      });
    },
    [setCurrentUser]
  );

  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    const fetchProfileAndPosts = async () => {
      try {
        const resUser = await api.get(`/users/${id}`);
        const profileUser = resUser?.data?.user;
        if (!profileUser) throw new Error("Profile not found");

        const normalized = { ...profileUser, profilePic: profileUser.profilePic || DEFAULT_PROFILE };
        if (mounted) setUser(normalized);

        const resPosts = await api.get(`/posts/user/${id}`);
        if (mounted) setPosts(resPosts.data.posts || []);
      } catch (err) {
        console.error("Profile fetch failed:", err?.response?.data || err.message);
        if (mounted) {
          setUser({ username: "Unknown", profilePic: DEFAULT_PROFILE });
          setPosts([]);
        }
      }
    };

    fetchProfileAndPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser, refreshFlag, loadingFollow, loadingBlock]);

  if (!user || !currentUser) return null;

  const isOwnProfile = String(user._id) === String(currentUser._id);
  const profileUser = isOwnProfile ? currentUser : user;

  const isFollowing = Array.isArray(user.followers)
    ? user.followers.some((f) => String(f._id || f) === String(currentUser._id))
    : false;

  const isBlocked = Array.isArray(currentUser.blockedUsers)
    ? currentUser.blockedUsers.some((b) => String(b) === String(user._id))
    : false;

  const profilePicURL = resolvePic(profileUser.profilePic);

  const handleFollowToggle = async () => {
    setLoadingFollow(true);
    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      await api.post(`/users/${endpoint}/${user._id}`);

      const [resUser, resCurrentUser] = await Promise.all([
        api.get(`/users/${user._id}`),
        api.get("/users/profile"),
      ]);

      if (resUser?.data?.user) setUser({ ...resUser.data.user, profilePic: resUser.data.user.profilePic || DEFAULT_PROFILE });
      if (resCurrentUser?.data?.user) mergeAndSetUser(resCurrentUser.data.user);

      refreshPosts();
    } catch (err) {
      console.error("Follow/unfollow failed:", err?.response?.data || err.message);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleBlockToggle = async () => {
    setLoadingBlock(true);
    try {
      const endpoint = isBlocked ? "unblock" : "block";
      await api.post(`/users/${endpoint}/${user._id}`);

      const resCurrentUser = await api.get("/users/profile");
      if (resCurrentUser?.data?.user) mergeAndSetUser(resCurrentUser.data.user);

      if (!isBlocked) setPosts([]); // hide posts if just blocked
    } catch (err) {
      console.error("Block/unblock failed:", err?.response?.data || err.message);
    } finally {
      setLoadingBlock(false);
    }
  };

  const openList = async (type) => {
    try {
      const res = await api.get(`/users/${user._id}/${type}`);
      setModalData({ type, users: res.data[type] || [] });
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch list:", err?.response?.data || err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-6 mb-10">
        <img
          src={profilePicURL}
          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PROFILE; }}
          className="w-24 h-24 rounded-full object-cover border"
          alt="profile"
        />
        <div>
          <h2 className="text-2xl font-bold">{profileUser.username}</h2>
          <div className="flex gap-8 mt-3 text-sm">
            <div className="text-center">
              <p className="font-bold">{posts.length}</p>
              <p className="text-gray-500">Posts</p>
            </div>
            <div className="text-center cursor-pointer" onClick={() => openList("followers")}>
              <p className="font-bold">{user.followers?.length || 0}</p>
              <p className="text-gray-500">Followers</p>
            </div>
            <div className="text-center cursor-pointer" onClick={() => openList("following")}>
              <p className="font-bold">{user.following?.length || 0}</p>
              <p className="text-gray-500">Following</p>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleFollowToggle}
                disabled={loadingFollow}
                className={`px-4 py-2 rounded ${isFollowing ? "bg-gray-300 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              >
                {loadingFollow ? "..." : isFollowing ? "Unfollow" : "Follow"}
              </button>

              <button
                onClick={handleBlockToggle}
                disabled={loadingBlock}
                className={`px-4 py-2 rounded ${isBlocked ? "bg-gray-300 text-gray-700" : "bg-red-500 text-white hover:bg-red-600"}`}
              >
                {loadingBlock ? "..." : isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.length === 0 && <p className="col-span-full text-center text-gray-500">No posts to show</p>}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} refreshPosts={refreshPosts} />
        ))}
      </div>

      {showModal && (
        <UserListModal type={modalData.type} users={modalData.users} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
