import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import Header from '../components/layout/Header'
import Countdown from '../components/ui/Countdown'
import StatsCard from '../components/ui/StatsCard'
import Card, { CardBody } from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { useEvent } from '../hooks/useEvent'
import { guestService } from '../services/guestService'
import { budgetService } from '../services/budgetService'
import { taskService } from '../services/taskService'
import { vendorService } from '../services/vendorService'
import { IoPeopleOutline, IoWalletOutline, IoCheckboxOutline, IoBusinessOutline } from 'react-icons/io5'
import { formatCurrency, formatDate, daysUntil } from '../utils/formatters'

export default function DashboardPage() {
  const { user } = useAuth()
  const { selectedEvent } = useEvent()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (!user || !selectedEvent) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const eventId = selectedEvent.id
        const [guests, expenses, tasks, vendors] = await Promise.all([
          guestService.getAll(user.uid, eventId),
          budgetService.getAll(user.uid, eventId),
          taskService.getAll(user.uid, eventId),
          vendorService.getAll(user.uid, eventId)
        ])

        const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmado').length
        const totalBudget = expenses.reduce((sum, e) => sum + (e.realAmount || e.estimatedAmount || 0), 0)
        const completedTasks = tasks.filter(t => t.status === 'completada').length
        const hiredVendors = vendors.filter(v => v.contractStatus === 'contratado' || v.contractStatus === 'pagado').length

        setStats({
          totalGuests: guests.length,
          confirmedGuests,
          pendingGuests: guests.filter(g => g.rsvpStatus === 'pendiente').length,
          totalBudget,
          paidBudget: expenses.filter(e => e.paymentStatus === 'pagado').reduce((sum, e) => sum + (e.realAmount || e.estimatedAmount || 0), 0),
          totalTasks: tasks.length,
          completedTasks,
          totalVendors: vendors.length,
          hiredVendors
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [user, selectedEvent])

  const eventDate = selectedEvent?.date ? new Date(selectedEvent.date) : null
  const days = eventDate ? daysUntil(eventDate) : 0

  return (
    <Layout>
      <Header title="Dashboard" />
      <div className="p-4 sm:p-6">
        {/* Countdown */}
        <Card className="mb-8">
          <CardBody className="py-8">
            <h2 className="text-center text-lg font-medium text-text-light mb-6">
              {eventDate
                ? <>Faltan <span className="text-gold font-bold">{days}</span> días para el evento</>
                : 'Selecciona un evento para ver la cuenta regresiva'
              }
            </h2>
            {eventDate && <Countdown targetDate={eventDate} />}
          </CardBody>
        </Card>

        {loading ? (
          <LoadingSpinner />
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                icon={<IoPeopleOutline />}
                label="Invitados Confirmados"
                value={`${stats.confirmedGuests} / ${stats.totalGuests}`}
                subtitle={`${stats.pendingGuests} pendientes`}
                color="gold"
              />
              <StatsCard
                icon={<IoWalletOutline />}
                label="Presupuesto Gastado"
                value={formatCurrency(stats.totalBudget)}
                subtitle={`${formatCurrency(stats.paidBudget)} pagado`}
                color="warning"
              />
              <StatsCard
                icon={<IoCheckboxOutline />}
                label="Tareas Completadas"
                value={`${stats.completedTasks} / ${stats.totalTasks}`}
                color="success"
              />
              <StatsCard
                icon={<IoBusinessOutline />}
                label="Proveedores Contratados"
                value={`${stats.hiredVendors} / ${stats.totalVendors}`}
                color="info"
              />
            </div>

            {/* Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardBody>
                  <h3 className="font-semibold text-text mb-4">Progreso General</h3>
                  <div className="space-y-4">
                    <ProgressBar
                      label="Confirmaciones"
                      value={stats.confirmedGuests}
                      max={stats.totalGuests}
                      color="gold"
                    />
                    <ProgressBar
                      label="Tareas"
                      value={stats.completedTasks}
                      max={stats.totalTasks}
                      color="success"
                    />
                    <ProgressBar
                      label="Proveedores"
                      value={stats.hiredVendors}
                      max={stats.totalVendors}
                      color="warning"
                    />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="font-semibold text-text mb-4">Resumen Rápido</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-text-light">Fecha del Evento</span>
                      <span className="text-sm font-medium">{eventDate ? formatDate(eventDate) : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-text-light">Días restantes</span>
                      <span className="text-sm font-medium text-gold">{days} días</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-text-light">Total invitados</span>
                      <span className="text-sm font-medium">{stats.totalGuests}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-text-light">Total gastos</span>
                      <span className="text-sm font-medium">{formatCurrency(stats.totalBudget)}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-text-light">¡Bienvenido! Comienza a planificar tu evento.</p>
            </CardBody>
          </Card>
        )}
      </div>
    </Layout>
  )
}
