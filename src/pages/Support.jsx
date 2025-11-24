import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  const loadTickets = async () => {
    try {
      const res = await api.get("/support/my");
      if (res.data.status === 1) {
        setTickets(res.data.tickets);
      } else {
        setInfo("Failed to load tickets");
      }
    } catch (err) {
      console.error("Load tickets error:", err);
      setInfo("Failed to load tickets");
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const submitTicket = async () => {
    if (!message.trim()) return setInfo("Enter your message");
    try {
      setLoading(true);
      const res = await api.post("/support/ticket", { subject, message });
      if (res.data.status === 1) {
        setInfo("Ticket submitted successfully");
        setSubject("");
        setMessage("");
        loadTickets();
      } else {
        setInfo("Submission failed");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setInfo("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Support</h1>

      {/* Ticket submission */}
      <input
        type="text"
        placeholder="Subject (optional)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <textarea
        rows={5}
        placeholder="Describe your issue..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-3 border rounded mb-2"
      />
      <div className="flex gap-2 mb-4 items-center">
        <button
          onClick={submitTicket}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Sending..." : "Submit"}
        </button>
        {info && <div className="text-sm text-gray-600">{info}</div>}
      </div>

      <hr className="my-4" />

      {/* Tickets list */}
      <h2 className="text-xl font-medium mb-2">Your Tickets</h2>
      {tickets.length === 0 ? (
        <p>No tickets yet.</p>
      ) : (
        tickets.map((t) => (
          <div
            key={t._id}
            className="border rounded p-3 mb-3 bg-white shadow-sm"
          >
            <div className="text-sm text-gray-500">Subject: {t.subject || "N/A"}</div>
            <div className="text-sm text-gray-500">Status: {t.status}</div>
            <div className="mt-2 text-gray-700">
              {t.lastMessage?.text || "No messages yet"}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Created: {new Date(t.createdAt).toLocaleString()}
            </div>
            <Link
              to={`/ticket/${t._id}`}
              className="text-blue-600 hover:underline text-sm"
            >
              View thread
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
