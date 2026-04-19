import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Explore from './pages/Explore'
import BookDetail from './pages/BookDetail'
import Profile from './pages/Profile'
import BookClub from './pages/BookClub'
import Navbar from './components/layout/Navbar'
import LampCord from './components/layout/LampCord'

export default function App() {
  const location = useLocation()
  const hideNav = ['/', '/login', '/register'].includes(location.pathname)

  return (
    <>
      {/* Physics lamp cord — always visible, top-centre, toggles dark/light */}
      <LampCord />

      {!hideNav && <Navbar />}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"          element={<Landing />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/library"   element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/explore"   element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/book/:bookId" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/bookclubs" element={<ProtectedRoute><BookClub /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </>
  )
}