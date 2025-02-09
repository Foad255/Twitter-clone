import { Navigate, Route, Routes } from "react-router-dom";
import {Toaster} from 'react-hot-toast'
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/signup";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingSpinner from "./components/common/LoadingSpinner";
function App() {
  // track Authorization 
 const { data:user, isLoading} = useQuery({
  queryKey: ['authUser'],
  queryFn: async () => {
    try {
      const res = await axios.get('/api/auth/me')
      console.log('authUser is here', res.data)
      return res.data
    } catch (err) {
      if (err.response) {
        // Response status is out of the 2xx range
        // solve the navigation problem with undefined ---> null
        return null
      } else if (err.request) {
        // No response was received
        throw new Error('No response received from the server')
      } else {
        // other errors
        throw new Error(err.message)
      }
    }
  },
  // TODO:
  retry: false,
 })
 if (isLoading) {
  return (
    <div className='h-screen flex justify-center items-center'>
      <LoadingSpinner size='lg' />
    </div>
  )
 }
  return (
    <>
      <div className="flex max-w-6cl mx-auto">
        {user ? <Sidebar /> : ''}
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={user ? <NotificationPage /> : 
          <Navigate to="/login" />} />
          <Route path="/profile/:username" element={user ? <ProfilePage /> :
           <Navigate to="/login" />} /> 
        </Routes>
        {user ? <RightPanel /> : ''}
        <Toaster />
      </div>
    </>
  );
}

export default App;