// src/admin/TicketThreadAdmin.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function TicketThreadAdmin() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Load ticket and messages
  const load = async () => {
    try {
      const res = await api.get(`/support/messages/${ticketId}`);
      if (res.data.status === 1) {
        const ticketData = res.data.ticket;
        const msgs = res.data.messages.map(m => {
          // Override admin sender username to Lynk
          if (m.sender.role === "admin") {
            return {
              ...m,
              sender: { ...m.sender, username: "Lynk" },
            };
          }
          return m;
        });

        setTicket(ticketData);
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Error loading ticket:", err);
    }
  };

  useEffect(() => {
    load();
  }, [ticketId]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      const res = await api.post(`/support/messages/${ticketId}`, { text });
      if (res.data.status === 1) {
        let newMsg = res.data.message;

        // Ensure admin replies show Lynk
        if (newMsg.sender.role === "admin") {
          newMsg.sender.username = "Lynk";
        }

        setMessages(prev => [...prev, newMsg]);
        setText("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">{ticket.subject}</h2>
      <div className="mb-4 text-sm text-gray-500">Status: {ticket.status}</div>

      <div className="space-y-3 mb-4">
        {messages.map(m => (
          <div
            key={m._id}
            className={`p-3 rounded ${
              m.sender.role === "admin" ? "bg-blue-50" : "bg-gray-100"
            }`}
          >
            <div className="text-xs text-gray-500">
              {m.sender.username} • {new Date(m.createdAt).toLocaleString()}
            </div>
            <div className="mt-1">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Write a message..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
