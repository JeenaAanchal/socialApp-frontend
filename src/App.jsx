import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import UserContext from "./context/UserContext";

// Loading Context & Loader
import { LoadingProvider, LoadingContext } from "./context/LoadingContext";
import Loader from "./components/Loader";

// Pages
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings/Settings";
import CreatePost from "./pages/CreatePost";
import UserProfile from "./pages/UserProfile";
import NotificationsPage from "./pages/NotificationsPage";
import Signup from "./pages/Signup";
import PostPage from "./pages/PostPage";
import Support from "./pages/Support";
import TicketThread from "./pages/TicketThread";

// Admin Pages
import AdminPage from "./admin/AdminPage";
import AdminSupport from "./admin/AdminSupport";
import TicketThreadAdmin from "./admin/TicketThreadAdmin";
import TicketList from "./admin/TicketList";

function AppRoutes() {
  const { currentUser } = useContext(UserContext);

  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading user...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected / Layout Routes */}
        <Route
          path="/home"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route
          path="/create-post"
          element={
            <Layout>
              <CreatePost />
            </Layout>
          }
        />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route
          path="/notifications"
          element={
            <Layout>
              <NotificationsPage />
            </Layout>
          }
        />
        <Route path="/post/:postId" element={<PostPage />} />
        <Route path="/messages" element={<Messages />} />

        {/* User Support Pages */}
        <Route path="/support" element={<Support />} />
        <Route path="/ticket/:ticketId" element={<TicketThread />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<TicketList />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="support/:ticketId" element={<TicketThreadAdmin />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={currentUser ? "/home" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <LoadingProvider>
      <AppRoutes />
      <LoadingContext.Consumer>
        {({ loading }) => loading && <Loader />}
      </LoadingContext.Consumer>
    </LoadingProvider>
  );
}
