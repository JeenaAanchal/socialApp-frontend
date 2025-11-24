import { useEffect, useState } from "react";
import api from "../api/axios";

export default function TicketView({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/support/messages/${ticket._id}`);
      if (res.data.status === 1) setMessages(res.data.messages);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [ticket._id]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      setSending(true);
      const res = await api.post(`/support/messages/${ticket._id}`, { text: reply });
      if (res.data.status === 1) {
        setMessages(prev => [...prev, res.data.message]);
        setReply("");
      }
    } catch (err) {
      console.error("Reply error:", err.response?.data || err);
      alert("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow rounded flex flex-col h-full">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline self-start">← Back</button>

      <h2 className="text-2xl font-bold mb-4">{ticket.subject}</h2>

      <div className="flex-1 overflow-y-auto border p-4 rounded mb-4 space-y-3 bg-gray-50">
        {loading ? (
          <p className="text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : messages.map(m => (
          <div
            key={m._id}
            className={`p-2 rounded ${m.sender.role === "admin" ? "bg-blue-100 self-end text-right" : "bg-gray-200 self-start text-left"}`}
          >
            <div className="text-sm font-semibold">{m.sender.username}</div>
            <div className="text-sm">{m.text}</div>
            <div className="text-xs text-gray-500 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        <textarea
          rows="3"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={handleReply}
          disabled={sending || !reply.trim()}
          className={`px-4 py-2 rounded text-white ${sending || !reply.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {sending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  );
}
