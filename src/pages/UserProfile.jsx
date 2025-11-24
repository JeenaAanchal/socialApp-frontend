import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import api from "../api/axios";
import UserContext from "../context/UserContext";
import UserListModal from "../components/UserListModal";
import defaultProfile from "../assets/profile-pic-avatar.jpg";

const DEFAULT_PROFILE = defaultProfile;

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

  const refreshPosts = () => setRefreshFlag((prev) => !prev);

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfileAndPosts = async () => {
      try {
        const resUser = await api.get(`/users/${id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const profileUser = resUser.data.user;
        setUser({ ...profileUser, profilePic: profileUser.profilePic || DEFAULT_PROFILE });

        const resPosts = await api.get(`/posts/user/${id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        setPosts(resPosts.data.posts || []);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setUser({ username: "Unknown", profilePic: DEFAULT_PROFILE });
        setPosts([]);
      }
    };

    fetchProfileAndPosts();
  }, [id, currentUser, refreshFlag, loadingFollow, loadingBlock]);

  if (!user || !currentUser) return null;

  const isOwnProfile = user._id === currentUser._id;
  const profileUser = isOwnProfile ? currentUser : user;

  const isFollowing = user.followers?.some((f) => f._id === currentUser._id);
  const isBlocked = currentUser.blockedUsers?.includes(user._id);

  const profilePicURL = profileUser.profilePic
    ? `${profileUser.profilePic}?t=${Date.now()}`
    : DEFAULT_PROFILE;

  const handleFollowToggle = async () => {
    setLoadingFollow(true);
    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      await api.post(`/users/${endpoint}/${user._id}`, {}, { headers: { Authorization: `Bearer ${currentUser.token}` } });

      const resUser = await api.get(`/users/${user._id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setUser({ ...resUser.data.user, profilePic: resUser.data.user.profilePic || DEFAULT_PROFILE });

      const resCurrentUser = await api.get("/users/profile", { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setCurrentUser(resCurrentUser.data.user);

      refreshPosts();
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleBlockToggle = async () => {
    setLoadingBlock(true);
    try {
      const endpoint = isBlocked ? "unblock" : "block";
      await api.post(`/users/${endpoint}/${user._id}`, {}, { headers: { Authorization: `Bearer ${currentUser.token}` } });

      const resCurrentUser = await api.get("/users/profile", { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setCurrentUser(resCurrentUser.data.user);

      if (!isBlocked) setPosts([]);
    } catch (err) {
      console.error("Block/unblock failed:", err);
    } finally {
      setLoadingBlock(false);
    }
  };

  const openList = async (type) => {
    try {
      const res = await api.get(`/users/${user._id}/${type}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setModalData({ type, users: res.data[type] || [] });
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch list:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-6 mb-10">
        <img
          src={profilePicURL}
          onError={(e) => (e.target.src = DEFAULT_PROFILE)}
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
