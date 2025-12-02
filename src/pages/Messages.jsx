import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import UserContext from "../context/UserContext";
import defaultProfile from "../assets/profile-pic-avatar.jpg";

const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:8000";

const fixURL = (path) => {
  if (!path) return defaultProfile;
  if (path.startsWith("http")) return path;
  return `${BACKEND}/${path}`;
};

export default function Messages() {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [chatList, setChatList] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [filteredFollowers, setFilteredFollowers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showChatListOnMobile, setShowChatListOnMobile] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const dropdownRef = useRef();
  const messagesEndRef = useRef();

  // Update mobile detection on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch chats and followers
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        setLoadingChats(true);
        const [chatsRes, followersRes] = await Promise.all([
          api.get("/chats", {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          }),
          api.get("/users/followers", {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          }),
        ]);

        setChatList(chatsRes.data.chats || []);
        const allFollowers = followersRes.data.followers || [];
        setFollowers(allFollowers);
        setFilteredFollowers(allFollowers);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Filter followers based on search
  useEffect(() => {
    if (!search) return setFilteredFollowers(followers);
    const filtered = followers.filter((f) =>
      f.username.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFollowers(filtered);
  }, [search, followers]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFilteredFollowers(followers);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [followers]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const openChat = async (userId, username, profilePic) => {
    try {
      setLoadingMessages(true);
      const res = await api.post(
        "/chats/createOrGet",
        { userId },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      setSelectedChat(res.data.chat);
      setShowChatListOnMobile(false);
    } catch (err) {
      console.error("Error opening chat:", err);
      setSelectedChat({
        _id: "temp-" + userId,
        participants: [
          {
            _id: currentUser._id,
            username: currentUser.username,
            profilePic: currentUser.profilePic || defaultProfile,
          },
          { _id: userId, username, profilePic: fixURL(profilePic) },
        ],
        messages: [],
      });
      setShowChatListOnMobile(false);
    } finally {
      setLoadingMessages(false);
    }
    setSearch("");
    setFilteredFollowers(followers);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const trimmedMessage = newMessage.trim();

    try {
      if (!selectedChat._id.startsWith("temp-")) {
        const { data } = await api.post(
          "/chats/message",
          { chatId: selectedChat._id, text: trimmedMessage },
          { headers: { Authorization: `Bearer ${currentUser.token}` } }
        );

        setSelectedChat(data.chat);
        setChatList((prev) =>
          prev.map((c) => (c._id === data.chat._id ? data.chat : c))
        );
      } else {
        setSelectedChat((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            { sender: currentUser._id, text: trimmedMessage },
          ],
        }));
      }

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!currentUser) return <div className="p-4">Loading user info...</div>;

  const otherUser =
    selectedChat?.participants.find((p) => p._id !== currentUser._id) || {};

  // ===========================
  // RENDERING
  // ===========================
  return (
    <div className="relative h-screen flex">
      {isMobile ? (
        // MOBILE VIEW: show either chat list or chat window
        showChatListOnMobile ? (
          <div className="w-full h-full p-2">
            <div className="p-2 border-b flex items-center justify-between">
              <button
                onClick={() => navigate("/home")}
                className="text-blue-500 text-sm"
              >
                Back
              </button>
              <h2 className="font-semibold">Chats</h2>
              <div></div>
            </div>

            <div className="p-2 relative" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search followers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
              {search && filteredFollowers.length > 0 && (
                <ul className="absolute z-10 bg-white border w-full max-h-60 overflow-y-auto rounded shadow-md mt-10">
                  {filteredFollowers.map((f) => (
                    <li
                      key={f._id}
                      className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => openChat(f._id, f.username, f.profilePic)}
                    >
                      <img
                        src={fixURL(f.profilePic)}
                        alt={f.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{f.username}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <h3 className="p-2 font-semibold mt-2">Chats</h3>
            <ul>
              {chatList.map((chat) => {
                const other = chat.participants.find(
                  (p) => p._id !== currentUser._id
                );
                return (
                  <li
                    key={chat._id}
                    className="flex justify-between items-center p-3 border-b hover:bg-gray-100 cursor-pointer"
                    onClick={() =>
                      openChat(other._id, other.username, other.profilePic)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={fixURL(other.profilePic)}
                        alt={other.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{other.username}</span>
                    </div>
                    <button
                      className="text-red-500 text-sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await api.delete(`/chats/${chat._id}`, {
                            headers: { Authorization: `Bearer ${currentUser.token}` },
                          });
                          setChatList((prev) =>
                            prev.filter((c) => c._id !== chat._id)
                          );
                          if (selectedChat?._id === chat._id)
                            setSelectedChat(null);
                          setShowChatListOnMobile(true);
                        } catch (err) {
                          console.error("Error deleting chat:", err);
                        }
                      }}
                    >
                      <img src="/trash.png" alt="trash" className="w-5 h-5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          // MOBILE: chat window
          <div className="w-full h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={fixURL(otherUser?.profilePic)}
                  alt={otherUser?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <h2 className="font-semibold text-lg">{otherUser?.username}</h2>
              </div>
              <button
                onClick={() => setShowChatListOnMobile(true)}
                className="text-blue-500 text-sm"
              >
                Back
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingMessages ? (
                <div className="text-gray-500 text-center">
                  Loading messages...
                </div>
              ) : selectedChat.messages.length === 0 ? (
                <div className="text-gray-500 text-center">
                  No messages yet.
                </div>
              ) : (
                selectedChat.messages.map((msg, idx) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const isMine = senderId === currentUser._id;

                  return (
                    <div
                      key={idx}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`p-2 rounded-md max-w-xs ${
                          isMine ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="border rounded flex-1 p-2"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                className="bg-blue-500 text-white px-4 rounded"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        )
      ) : (
        // DESKTOP VIEW: show both chat list and window
        <>
          <div className="w-80 border-r border-gray-300 bg-white flex-shrink-0 h-full">
            {/* chat list same as before */}
            <div className="p-2 relative" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search followers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
              {search && filteredFollowers.length > 0 && (
                <ul className="absolute z-10 bg-white border w-full max-h-60 overflow-y-auto rounded shadow-md mt-10">
                  {filteredFollowers.map((f) => (
                    <li
                      key={f._id}
                      className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => openChat(f._id, f.username, f.profilePic)}
                    >
                      <img
                        src={fixURL(f.profilePic)}
                        alt={f.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{f.username}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <h3 className="p-2 font-semibold mt-2">Chats</h3>
            <ul>
              {chatList.map((chat) => {
                const other = chat.participants.find(
                  (p) => p._id !== currentUser._id
                );
                return (
                  <li
                    key={chat._id}
                    className="flex justify-between items-center p-3 border-b hover:bg-gray-100 cursor-pointer"
                    onClick={() =>
                      openChat(other._id, other.username, other.profilePic)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={fixURL(other.profilePic)}
                        alt={other.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{other.username}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex-1 flex flex-col justify-between h-full">
            {selectedChat ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <img
                    src={fixURL(otherUser?.profilePic)}
                    alt={otherUser?.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <h2 className="font-semibold text-lg">{otherUser?.username}</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {selectedChat.messages.map((msg, idx) => {
                    const senderId = msg.sender?._id || msg.sender;
                    const isMine = senderId === currentUser._id;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`p-2 rounded-md max-w-xs ${
                            isMine ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="border rounded flex-1 p-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    className="bg-blue-500 text-white px-4 rounded"
                    onClick={sendMessage}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex justify-center items-center text-gray-500">
                Select a chat or follower to start messaging
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
