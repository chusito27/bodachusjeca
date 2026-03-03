import { NavLink } from 'react-router-dom'
import { IoHomeOutline, IoPeopleOutline, IoWalletOutline, IoBusinessOutline, IoCheckboxOutline, IoGridOutline, IoTimeOutline, IoMusicalNotesOutline, IoImagesOutline, IoRestaurantOutline, IoLogOutOutline, IoMenuOutline, IoCloseOutline, IoSunnyOutline, IoMoonOutline, IoHeartOutline, IoShieldOutline } from 'react-icons/io5'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useWedding } from '../../hooks/useWedding'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/', icon: IoHomeOutline, label: 'Dashboard' },
  { to: '/invitados', icon: IoPeopleOutline, label: 'Invitados' },
  { to: '/presupuesto', icon: IoWalletOutline, label: 'Presupuesto' },
  { to: '/proveedores', icon: IoBusinessOutline, label: 'Proveedores' },
  { to: '/tareas', icon: IoCheckboxOutline, label: 'Tareas' },
  { to: '/mesas', icon: IoGridOutline, label: 'Mesas' },
  { to: '/cronograma', icon: IoTimeOutline, label: 'Cronograma' },
  { to: '/musica', icon: IoMusicalNotesOutline, label: 'Música' },
  { to: '/galeria', icon: IoImagesOutline, label: 'Galería' },
  { to: '/menu', icon: IoRestaurantOutline, label: 'Menú' },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout, userProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { selectedWedding } = useWedding()
  const navigate = useNavigate()

  const isAdmin = userProfile?.role === 'admin'

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      toast.success('Sesión cerrada')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  const sidebarContent = (
    <>
      <div className="px-6 py-6">
        <h1 className="text-xl font-bold text-gold">
          {selectedWedding?.name || 'Planea Tu Boda'}
        </h1>
        <p className="text-xs text-[#B8A0B4] mt-1">
          {selectedWedding?.date ? formatDate(new Date(selectedWedding.date)) : 'Selecciona una boda'}
        </p>
      </div>

      <nav className="flex-1 px-3">
        {isAdmin && (
          <NavLink
            to="/bodas"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-[#D4BCD0] hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <IoHeartOutline size={18} />
            Mis Bodas
          </NavLink>
        )}
        {isAdmin && (
          <NavLink
            to="/usuarios"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-[#D4BCD0] hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <IoShieldOutline size={18} />
            Usuarios
          </NavLink>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-[#D4BCD0] hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#B8A0B4] hover:bg-white/5 hover:text-white transition-colors w-full"
        >
          {theme === 'dark' ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#B8A0B4] hover:bg-white/5 hover:text-white transition-colors w-full"
        >
          <IoLogOutOutline size={18} />
          Cerrar Sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-dark text-white p-2 rounded-lg shadow-lg"
      >
        {mobileOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-dark flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  )
}
