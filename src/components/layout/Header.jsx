import { useAuth } from '../../hooks/useAuth'
import { useWedding } from '../../hooks/useWedding'
import { IoPersonCircleOutline } from 'react-icons/io5'

export default function Header({ title }) {
  const { user, userProfile } = useAuth()
  const { weddings, selectedWedding, selectWedding } = useWedding()

  const isAdmin = userProfile?.role === 'admin'

  const handleChange = (e) => {
    const wedding = weddings.find(w => w.id === e.target.value)
    if (wedding) selectWedding(wedding)
  }

  return (
    <header className="bg-surface border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between pl-14 lg:pl-4 xl:pl-6">
      <h1 className="text-lg sm:text-xl font-bold text-text truncate">{title}</h1>
      <div className="flex items-center gap-3">
        {isAdmin && weddings.length > 1 && (
          <select
            value={selectedWedding?.id || ''}
            onChange={handleChange}
            className="text-sm border border-border rounded-lg px-2 py-1.5 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            {weddings.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-2">
          <IoPersonCircleOutline size={24} className="text-text-light" />
          <span className="text-sm text-text-light hidden sm:inline">{user?.displayName || user?.email}</span>
        </div>
      </div>
    </header>
  )
}
