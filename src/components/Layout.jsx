import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile hamburger button */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>

        {/* Main container */}
        <main className="flex-1 w-full p-4">
          {/* Make PostCard container stretch full width */}
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
