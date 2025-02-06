import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/signup";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
function App() {
  return (
    <>
      <div className="flex max-w-6cl mx-auto">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} /> 
        </Routes>
        <RightPanel />
      </div>
    </>
  );
}

export default App;