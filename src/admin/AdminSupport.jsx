// src/admin/AdminSupport.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await api.get("/support/admin/all"); // backend route
        if (res.data.status === 1) setTickets(res.data.tickets);
      } catch (err) {
        console.error("Failed to load tickets:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  if (loading) return <p className="p-6">Loading tickets...</p>;
  if (tickets.length === 0) return <p className="p-6">No tickets found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">All Support Tickets</h1>
      {tickets.map((t) => (
        <div key={t._id} className="border rounded p-4 mb-3 bg-white">
          <div className="text-sm text-gray-500">Ticket ID: {t._id}</div>
          <div className="text-sm text-gray-500">
            User: {t.user?.username || "Unknown"}
          </div>
          <div className="text-sm text-gray-500">Status: {t.status}</div>
          <div className="mt-2 text-gray-700">{t.lastMessage?.text || "No messages yet"}</div>
          <div className="mt-2 text-xs text-gray-400">
            Created: {new Date(t.createdAt).toLocaleString()}
          </div>
          <Link
            to={`/admin/support/${t._id}`}
            className="text-blue-600 hover:underline mt-2 block"
          >
            View Thread
          </Link>
        </div>
      ))}
    </div>
  );
}
