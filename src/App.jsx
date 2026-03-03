import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import PrivateRoute from './components/auth/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import GuestsPage from './pages/GuestsPage'
import BudgetPage from './pages/BudgetPage'
import VendorsPage from './pages/VendorsPage'
import TasksPage from './pages/TasksPage'
import SeatingPage from './pages/SeatingPage'
import TimelinePage from './pages/TimelinePage'
import MusicPage from './pages/MusicPage'
import GalleryPage from './pages/GalleryPage'
import MenuPage from './pages/MenuPage'
import WeddingsPage from './pages/WeddingsPage'
import UsersPage from './pages/UsersPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-3 border-border border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

      <Route path="/bodas" element={<PrivateRoute><WeddingsPage /></PrivateRoute>} />
      <Route path="/usuarios" element={<PrivateRoute requiredRole="admin"><UsersPage /></PrivateRoute>} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/invitados" element={<PrivateRoute><GuestsPage /></PrivateRoute>} />
      <Route path="/presupuesto" element={<PrivateRoute><BudgetPage /></PrivateRoute>} />
      <Route path="/proveedores" element={<PrivateRoute><VendorsPage /></PrivateRoute>} />
      <Route path="/tareas" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
      <Route path="/mesas" element={<PrivateRoute><SeatingPage /></PrivateRoute>} />
      <Route path="/cronograma" element={<PrivateRoute><TimelinePage /></PrivateRoute>} />
      <Route path="/musica" element={<PrivateRoute><MusicPage /></PrivateRoute>} />
      <Route path="/galeria" element={<PrivateRoute><GalleryPage /></PrivateRoute>} />
      <Route path="/menu" element={<PrivateRoute><MenuPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
