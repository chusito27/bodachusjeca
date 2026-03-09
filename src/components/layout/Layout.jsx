import { Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import { useAuth } from '../../hooks/useAuth'
import { useEvent } from '../../hooks/useEvent'

export default function Layout({ children, requireEvent = true }) {
  const { userProfile } = useAuth()
  const { selectedEvent, loading } = useEvent()

  if (requireEvent && !loading && !selectedEvent) {
    // Dueño without assigned event: show message (don't redirect to /eventos)
    if (userProfile?.role === 'dueno') {
      return (
        <div className="min-h-screen bg-cream">
          <Sidebar />
          <MobileNav />
          <main className="lg:ml-64 min-h-screen pb-16 lg:pb-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold text-text mb-2">Sin evento asignado</h2>
              <p className="text-text-light text-sm">
                Aún no tienes un evento asignado. Contacta a un administrador para que te asigne uno.
              </p>
            </div>
          </main>
        </div>
      )
    }
    return <Navigate to="/eventos" />
  }

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <MobileNav />
      <main className="lg:ml-64 min-h-screen pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
