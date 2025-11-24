import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile hamburger button */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>

        {/* Main container */}
        <main className="flex-1 p-4 w-full">{children}</main>
      </div>
    </div>
  );
}
