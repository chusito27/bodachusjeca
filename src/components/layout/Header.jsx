import { useAuth } from '../../hooks/useAuth'
import { IoPersonCircleOutline } from 'react-icons/io5'

export default function Header({ title }) {
  const { user } = useAuth()

  return (
    <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-text">{title}</h1>
      <div className="flex items-center gap-2">
        <IoPersonCircleOutline size={24} className="text-text-light" />
        <span className="text-sm text-text-light hidden sm:inline">{user?.displayName || user?.email}</span>
      </div>
    </header>
  )
}
