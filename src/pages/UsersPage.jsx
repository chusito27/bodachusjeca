import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import Header from '../components/layout/Header'
import Card, { CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { userService } from '../services/userService'
import { eventService } from '../services/eventService'
import { USER_ROLES } from '../utils/constants'
import { IoCreateOutline, IoShieldOutline } from 'react-icons/io5'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ role: '', eventId: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersResult, eventsResult] = await Promise.all([
        userService.getAll(),
        eventService.getAll(user.uid)
      ])
      setUsers(usersResult)
      setEvents(eventsResult)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (u) => {
    setEditing(u)
    setForm({
      role: u.role || '',
      eventId: u.eventId || ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editing) return

    try {
      const updateData = {
        role: form.role || null,
        eventId: form.role === 'dueno' ? (form.eventId || null) : null
      }
      await userService.update(editing.uid, updateData)
      setUsers(users.map(u => u.uid === editing.uid ? { ...u, ...updateData } : u))
      setModalOpen(false)
      toast.success('Usuario actualizado')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error al actualizar usuario')
    }
  }

  const getRoleBadge = (role) => {
    const found = USER_ROLES.find(r => r.value === role)
    if (!found) return <Badge variant="default">Sin Rol</Badge>
    return <Badge variant={found.color}>{found.label}</Badge>
  }

  const getEventName = (eventId) => {
    if (!eventId) return '—'
    const ev = events.find(ev => ev.id === eventId)
    return ev ? ev.name : 'Evento no encontrado'
  }

  // Events not already assigned to another dueño (except the one being edited)
  const availableEvents = events.filter(ev => {
    const assignedTo = users.find(u => u.eventId === ev.id && u.role === 'dueno' && u.uid !== editing?.uid)
    return !assignedTo
  })

  const isSelf = (u) => u.uid === user.uid

  if (loading) {
    return (
      <Layout requireEvent={false}>
        <Header title="Usuarios" />
        <LoadingSpinner />
      </Layout>
    )
  }

  return (
    <Layout requireEvent={false}>
      <Header title="Usuarios" />
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-text-light text-sm">
            <IoShieldOutline className="inline mr-1" />
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => (
            <Card key={u.uid}>
              <CardBody>
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text truncate">{u.displayName || 'Sin nombre'}</h3>
                    <p className="text-sm text-text-light truncate">{u.email}</p>
                  </div>
                  {getRoleBadge(u.role)}
                </div>

                {u.role === 'dueno' && (
                  <p className="text-xs text-text-light mb-3">
                    Evento: <span className="font-medium text-text">{getEventName(u.eventId)}</span>
                  </p>
                )}

                <div className="flex gap-2 mt-2 border-t border-border pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(u)}
                    disabled={isSelf(u)}
                    className={isSelf(u) ? 'opacity-40' : ''}
                  >
                    <IoCreateOutline size={16} className="mr-1" />
                    {isSelf(u) ? 'Tú' : 'Editar'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Editar Usuario">
          {editing && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <p className="text-sm text-text-light">
                  <span className="font-medium text-text">{editing.displayName || 'Sin nombre'}</span>
                  {' '}&mdash; {editing.email}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-1">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value, eventId: e.target.value === 'dueno' ? form.eventId : '' })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  <option value="">Sin Rol (Pendiente)</option>
                  {USER_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {form.role === 'dueno' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text mb-1">Evento Asignado</label>
                  <select
                    value={form.eventId}
                    onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  >
                    <option value="">Sin evento asignado</option>
                    {availableEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </Layout>
  )
}
