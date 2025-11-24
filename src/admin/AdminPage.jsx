// src/admin/AdminPage.jsx
import { Outlet, Link } from "react-router-dom";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
        <nav className="space-y-2">
          <Link
            to="/admin/support"
            className="block py-2 px-3 rounded hover:bg-gray-700"
          >
            Support Tickets
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
