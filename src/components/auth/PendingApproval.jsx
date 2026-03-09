import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import { IoLogOutOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function PendingApproval() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      toast.success('Sesión cerrada')
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text">Planea Tu Evento</h1>
          <p className="text-gold mt-2">Organiza cada detalle</p>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </div>
        <div className="bg-surface rounded-xl shadow-sm border border-border p-8 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold text-text mb-2">Cuenta Pendiente de Aprobación</h2>
          <p className="text-text-light text-sm mb-6">
            Hola{user?.displayName ? `, ${user.displayName}` : ''}. Tu cuenta ha sido creada pero aún no ha sido aprobada por un administrador.
            Por favor espera a que se te asigne un rol y un evento.
          </p>
          <Button variant="secondary" onClick={handleLogout} className="mx-auto">
            <IoLogOutOutline size={16} className="mr-1" /> Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
