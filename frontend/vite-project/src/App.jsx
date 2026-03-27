import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import WeeklyPage from "./pages/WeeklyPage"
import MealsPage from "./pages/MealsPage"

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/weekly" element={
        <ProtectedRoute>
          <WeeklyPage />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/meals" element={
        <ProtectedRoute>
          <MealsPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <div data-theme="caramellatte">
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}

export default App