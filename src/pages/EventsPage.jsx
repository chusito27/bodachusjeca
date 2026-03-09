import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Header from '../components/layout/Header'
import Card, { CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { useEvent } from '../hooks/useEvent'
import { userService } from '../services/userService'
import { EVENT_TYPES } from '../utils/constants'
import { formatDate } from '../utils/formatters'
import { IoAdd, IoCreateOutline, IoTrashOutline, IoCheckmarkCircle } from 'react-icons/io5'

const emptyEvent = { name: '', date: '', type: 'boda' }

export default function EventsPage() {
  const { userProfile } = useAuth()
  const { events, selectedEvent, loading, selectEvent, addEvent, updateEvent, deleteEvent } = useEvent()

  // Dueño cannot access this page
  if (userProfile?.role === 'dueno') {
    return <Navigate to="/" />
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyEvent)

  const openCreate = () => { setForm(emptyEvent); setEditing(null); setModalOpen(true) }
  const openEdit = (event) => {
    setForm({ name: event.name, date: event.date || '', type: event.type || 'boda' })
    setEditing(event)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) await updateEvent(editing.id, form)
    else await addEvent(form)
    setModalOpen(false)
  }

  const getTypeBadge = (type) => {
    const found = EVENT_TYPES.find(t => t.value === type)
    return found ? `${found.icon} ${found.label}` : type
  }

  if (loading) return (
    <Layout requireEvent={false}>
      <Header title="Mis Eventos" />
      <LoadingSpinner />
    </Layout>
  )

  return (
    <Layout requireEvent={false}>
      <Header title="Mis Eventos" />
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-text-light text-sm">{events.length} evento{events.length !== 1 ? 's' : ''}</p>
          <Button onClick={openCreate}><IoAdd className="mr-1" /> Nuevo Evento</Button>
        </div>

        {events.length === 0 ? (
          <EmptyState icon="🎉" title="No hay eventos" description="Crea tu primer evento para comenzar a planificar"
            action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Nuevo Evento</Button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => {
              const isActive = selectedEvent?.id === event.id
              return (
                <Card key={event.id} className={isActive ? 'ring-2 ring-gold' : ''}>
                  <CardBody>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-text text-lg">{event.name}</h3>
                        <p className="text-sm text-text-light mt-1">
                          {event.date ? formatDate(new Date(event.date)) : 'Sin fecha'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isActive && <Badge variant="gold">Activa</Badge>}
                        <span className="text-xs text-text-light">{getTypeBadge(event.type)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 border-t border-border pt-4">
                      {!isActive && (
                        <Button size="sm" onClick={() => selectEvent(event)}>
                          <IoCheckmarkCircle size={14} className="mr-1" /> Seleccionar
                        </Button>
                      )}
                      <div className="flex gap-1 ml-auto">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(event)}>
                          <IoCreateOutline size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(event); setConfirmOpen(true) }}>
                          <IoTrashOutline size={16} className="text-error" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Evento' : 'Nuevo Evento'}>
          <form onSubmit={handleSubmit}>
            <Input label="Nombre del Evento" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ej: Boda Chus & Jeca" />
            <Input label="Tipo de Evento" type="select" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </Input>
            <Input label="Fecha" type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{editing ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={async () => {
            if (editing?.id) {
              await userService.clearEventAssignment(editing.id)
              await deleteEvent(editing.id)
            }
          }}
          title="Eliminar evento"
          message={`¿Seguro que quieres eliminar "${editing?.name}"? Todos los datos asociados dejarán de ser accesibles y los dueños asignados perderán acceso.`}
        />
      </div>
    </Layout>
  )
}
