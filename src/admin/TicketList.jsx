// src/admin/TicketList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);

  const loadTickets = async () => {
    try {
      const res = await api.get("/support/admin/all"); // admin route
      if (res.data.status === 1) setTickets(res.data.tickets);
    } catch (err) {
      console.error("Load admin tickets error:", err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div>
      {tickets.length === 0 && <p>No tickets yet.</p>}
      {tickets.map(t => (
        <div
          key={t._id}
          className="border rounded p-3 mb-3 bg-white hover:shadow"
        >
          <div className="text-sm text-gray-500">
            User: {t.user?.username || "Unknown"} • Status: {t.status}
          </div>
          <div className="mt-1 font-medium">{t.subject}</div>
          <Link
            to={`/admin/support/${t._id}`}
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            View thread
          </Link>
        </div>
      ))}
    </div>
  );
}
