import { useState, useContext } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";

import ProfileSettings from "./ProfileSettings";
import PrivacySettings from "./PrivacySettings";
import AccountSettings from "./AccountSettings";

export default function Settings() {
  const [active, setActive] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/login");
  };

  const settingsList = [
    { key: "profile", label: "Profile" },
    { key: "privacy", label: "Privacy" },
    { key: "account", label: "Account" },
    { key: "logout", label: "Logout" },
  ];

  const renderComponent = () => {
    switch (active) {
      case "profile":
        return <ProfileSettings />;
      case "privacy":
        return <PrivacySettings />;
      case "account":
        return <AccountSettings />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* MAIN WRAPPER */}
      <div className="h-screen flex">

        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:flex flex-col w-64 border-r border-gray-300 p-5">
          <h2 className="text-xl font-bold mb-4">Settings</h2>

          <ul className="flex flex-col gap-3">
            {settingsList.map((item) => (
              <li
                key={item.key}
                onClick={() =>
                  item.key === "logout"
                    ? setShowLogoutConfirm(true)
                    : setActive(item.key)
                }
                className={`cursor-pointer p-3 rounded-lg ${
                  active === item.key
                    ? "bg-gray-200 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* DESKTOP CONTENT */}
        <div className="hidden md:block flex-1 p-6 overflow-y-auto">
          {active ? renderComponent() : <p>Select a setting from the left.</p>}
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden w-full flex flex-col h-full">

          {/* HEADER */}
          <div className="p-4 border-b flex items-center bg-white">
            <h2 className="text-xl font-bold">
              {active ? settingsList.find((s) => s.key === active)?.label : "Settings"}
            </h2>

            {active && (
              <button
                className="ml-auto text-blue-600"
                onClick={() => setActive(null)}
              >
                <ArrowLeft size={22} />
              </button>
            )}
          </div>

          <div className="p-5 overflow-y-auto flex-1">

            {/* MENU */}
            {!active && (
              <ul className="flex flex-col gap-3">
                {settingsList.map((item) => (
                  <li
                    key={item.key}
                    onClick={() =>
                      item.key === "logout"
                        ? setShowLogoutConfirm(true)
                        : setActive(item.key)
                    }
                    className="cursor-pointer p-3 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium"
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            )}

            {/* CONTENT */}
            {active && renderComponent()}
          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-80 p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-3">Confirm Logout</h3>
            <p className="text-gray-600 mb-5">Are you sure you want to logout?</p>

            <div className="flex justify-between">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
