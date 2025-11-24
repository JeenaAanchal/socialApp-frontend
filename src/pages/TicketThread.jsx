// src/pages/TicketThread.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function TicketThread() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const loadThread = async () => {
    try {
      const res = await api.get(`/support/messages/${ticketId}`);
      if (res.data.status === 1) {
        setTicket(res.data.ticket);
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Load ticket thread error:", err);
    }
  };

  useEffect(() => {
    loadThread();
  }, [ticketId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const res = await api.post(`/support/messages/${ticketId}`, { text });
      if (res.data.status === 1) {
        setMessages(prev => [...prev, res.data.message]);
        setText("");
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (!ticket) return <p>Loading ticket...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">{ticket.subject}</h2>
      <div className="mb-4 text-sm text-gray-500">Status: {ticket.status}</div>

      <div className="space-y-3 mb-4">
        {messages.map(m => (
          <div
            key={m._id}
            className={`p-3 rounded ${
              m.sender.username === "App" ? "bg-blue-50" : "bg-gray-100"
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
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
