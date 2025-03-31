import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Home from "./pages/home/Home"
import Signup from "./pages/auth/Signup"
import Login from "./pages/auth/Login"
import Slidebar from "./components/Slidebar"
import RightPanel from "./components/RightPanel"
import NotificationPage from "./pages/notification/Notifications"
import ProfilePage from "./pages/profile/ProfilePage"
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import LoadingSpinner from "./components/LoadingSpinner"

function App() {
  const {data: authUser, isLoading} = useQuery({
    queryKey: ['authUser'],        
    queryFn: async () => {
      try {
        const res = await axios.get("/api/auth/me");

        
        return res.data.user;
      } catch (error) {
        return null;
      }
    },
    retry: false
  })

  if (isLoading){
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  } 
  return (
    <>
    <BrowserRouter>
    <div className="flex max-w-6xl mx-auto">
      {authUser && <Slidebar/>}
     <Routes>
       <Route path="/" element={authUser ? <Home /> : <Navigate to={'/login'} />} />
       <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to={'/'} />}/>
       <Route path="/login" element={!authUser ? <Login /> : <Navigate to={'/'} />}/>
       <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to={'/login'} />}/>
       <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to={'/login'} />} />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
    </BrowserRouter>
    </>
  )
}

export default App
