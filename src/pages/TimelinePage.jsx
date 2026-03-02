import { useState, useMemo } from 'react'
import Layout from '../components/layout/Layout'
import Header from '../components/layout/Header'
import Card, { CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useFirestore } from '../hooks/useFirestore'
import { timelineService } from '../services/timelineService'
import { IoAdd, IoCreateOutline, IoTrashOutline, IoTimeOutline, IoLocationOutline, IoPersonOutline } from 'react-icons/io5'

const emptyEvent = {
  title: '', startTime: '', endTime: '', description: '',
  responsible: '', location: '', order: 0
}

export default function TimelinePage() {
  const { data: events, loading, add, update, remove } = useFirestore(timelineService)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [form, setForm] = useState(emptyEvent)

  const sorted = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
      return (a.order || 0) - (b.order || 0)
    })
  }, [events])

  const openCreate = () => { setForm(emptyEvent); setSelectedEvent(null); setModalOpen(true) }
  const openEdit = (event) => { setForm({ ...emptyEvent, ...event }); setSelectedEvent(event); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedEvent) { await update(selectedEvent.id, form) } else { await add(form) }
    setModalOpen(false)
  }

  if (loading) return <Layout><Header title="Cronograma" /><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Header title="Cronograma del Día" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-text-light text-sm">{events.length} eventos programados</p>
          <Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Evento</Button>
        </div>

        {sorted.length === 0 ? (
          <EmptyState icon="⏰" title="No hay eventos" description="Planifica el cronograma del día de tu boda" action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Evento</Button>} />
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gold/20 hidden md:block" />

            <div className="space-y-4">
              {sorted.map((event, index) => (
                <div key={event.id} className="flex gap-4 md:gap-8">
                  {/* Time dot */}
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gold ring-4 ring-gold/20 z-10" />
                  </div>

                  {/* Event card */}
                  <Card className="flex-1">
                    <CardBody>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {event.startTime && (
                              <span className="text-gold font-bold text-sm flex items-center gap-1">
                                <IoTimeOutline />
                                {event.startTime}{event.endTime && ` - ${event.endTime}`}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-text text-lg">{event.title}</h3>
                          {event.description && <p className="text-sm text-text-light mt-1">{event.description}</p>}
                          <div className="flex flex-wrap gap-4 mt-2">
                            {event.location && (
                              <span className="text-xs text-text-light flex items-center gap-1">
                                <IoLocationOutline /> {event.location}
                              </span>
                            )}
                            {event.responsible && (
                              <span className="text-xs text-text-light flex items-center gap-1">
                                <IoPersonOutline /> {event.responsible}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(event)}><IoCreateOutline size={16} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedEvent(event); setConfirmOpen(true) }}><IoTrashOutline size={16} className="text-error" /></Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedEvent ? 'Editar Evento' : 'Nuevo Evento'}>
          <form onSubmit={handleSubmit}>
            <Input label="Título" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Hora Inicio" type="time" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} />
              <Input label="Hora Fin" type="time" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} />
            </div>
            <Input label="Descripción" type="textarea" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Ubicación" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} />
              <Input label="Responsable" value={form.responsible} onChange={(e) => setForm({...form, responsible: e.target.value})} />
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedEvent ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => remove(selectedEvent?.id)} title="Eliminar evento" message={`¿Seguro que quieres eliminar "${selectedEvent?.title}"?`} />
      </div>
    </Layout>
  )
}
