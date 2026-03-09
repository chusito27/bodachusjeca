import { useAuth } from '../../hooks/useAuth'
import { useEvent } from '../../hooks/useEvent'
import { IoPersonCircleOutline } from 'react-icons/io5'

export default function Header({ title }) {
  const { user, userProfile } = useAuth()
  const { events, selectedEvent, selectEvent } = useEvent()

  const isAdmin = userProfile?.role === 'admin'

  const handleChange = (e) => {
    const event = events.find(ev => ev.id === e.target.value)
    if (event) selectEvent(event)
  }

  return (
    <header className="bg-surface border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
      <h1 className="text-lg sm:text-xl font-bold text-text truncate">{title}</h1>
      <div className="flex items-center gap-3">
        {isAdmin && events.length > 1 && (
          <select
            value={selectedEvent?.id || ''}
            onChange={handleChange}
            className="text-sm border border-border rounded-lg px-2 py-1.5 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
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
