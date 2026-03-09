import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  IoHomeOutline, IoPeopleOutline, IoWalletOutline, IoCheckboxOutline,
  IoEllipsisHorizontalOutline, IoBusinessOutline, IoGridOutline,
  IoTimeOutline, IoMusicalNotesOutline, IoImagesOutline, IoRestaurantOutline,
  IoHeartOutline, IoShieldOutline, IoSunnyOutline, IoMoonOutline,
  IoLogOutOutline, IoCloseOutline
} from 'react-icons/io5'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import toast from 'react-hot-toast'

const primaryTabs = [
  { to: '/', icon: IoHomeOutline, label: 'Inicio', end: true },
  { to: '/invitados', icon: IoPeopleOutline, label: 'Invitados' },
  { to: '/presupuesto', icon: IoWalletOutline, label: 'Presupuesto' },
  { to: '/tareas', icon: IoCheckboxOutline, label: 'Tareas' },
]

const overflowItems = [
  { to: '/proveedores', icon: IoBusinessOutline, label: 'Proveedores' },
  { to: '/mesas', icon: IoGridOutline, label: 'Mesas' },
  { to: '/cronograma', icon: IoTimeOutline, label: 'Cronograma' },
  { to: '/musica', icon: IoMusicalNotesOutline, label: 'Música' },
  { to: '/galeria', icon: IoImagesOutline, label: 'Galería' },
  { to: '/menu', icon: IoRestaurantOutline, label: 'Menú' },
]

const adminItems = [
  { to: '/eventos', icon: IoHeartOutline, label: 'Mis Eventos' },
  { to: '/usuarios', icon: IoShieldOutline, label: 'Usuarios' },
]

export default function MobileNav() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { logout, userProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const isAdmin = userProfile?.role === 'admin'

  const allOverflowPaths = [
    ...overflowItems.map(i => i.to),
    ...(isAdmin ? adminItems.map(i => i.to) : []),
  ]
  const isOverflowActive = allOverflowPaths.some(path => location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/')))

  const handleLogout = async () => {
    try {
      setSheetOpen(false)
      await logout()
      navigate('/login')
      toast.success('Sesión cerrada')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  const handleThemeToggle = () => {
    toggleTheme()
    setSheetOpen(false)
  }

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      {sheetOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSheetOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-16 z-50 bg-dark rounded-t-2xl transition-transform duration-300 ease-out ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-sm font-semibold text-[#D4BCD0]">Más opciones</span>
          <button
            onClick={() => setSheetOpen(false)}
            className="text-[#B8A0B4] hover:text-white p-1"
          >
            <IoCloseOutline size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 px-3 pb-2">
          {overflowItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSheetOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-[#D4BCD0] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <>
            <div className="mx-4 border-t border-white/10" />
            <div className="grid grid-cols-3 gap-1 px-3 py-2">
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSheetOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-gold/10 text-gold'
                        : 'text-[#D4BCD0] hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={22} />
                  {label}
                </NavLink>
              ))}
            </div>
          </>
        )}

        <div className="mx-4 border-t border-white/10" />
        <div className="flex items-center gap-2 px-3 py-3">
          <button
            onClick={handleThemeToggle}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-[#B8A0B4] hover:bg-white/5 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-[#B8A0B4] hover:bg-white/5 hover:text-white transition-colors"
          >
            <IoLogOutOutline size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-16 bg-dark z-50 flex items-center justify-around"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {primaryTabs.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors ${
                isActive ? 'text-gold' : 'text-[#D4BCD0]'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setSheetOpen(prev => !prev)}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors ${
            isOverflowActive || sheetOpen ? 'text-gold' : 'text-[#D4BCD0]'
          }`}
        >
          <IoEllipsisHorizontalOutline size={22} />
          Más
        </button>
      </nav>
    </div>
  )
}
