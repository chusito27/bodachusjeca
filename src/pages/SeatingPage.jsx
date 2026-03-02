import { useState, useMemo, useEffect } from 'react'
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
import { useFirestore } from '../hooks/useFirestore'
import { useAuth } from '../hooks/useAuth'
import { seatingService } from '../services/seatingService'
import { guestService } from '../services/guestService'
import { IoAdd, IoCreateOutline, IoTrashOutline, IoPersonAdd, IoClose } from 'react-icons/io5'

const emptyTable = { name: '', capacity: 8 }

export default function SeatingPage() {
  const { data: tables, loading, add, update, remove } = useFirestore(seatingService)
  const { user } = useAuth()
  const [guests, setGuests] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [form, setForm] = useState(emptyTable)

  useEffect(() => {
    if (user) {
      guestService.getAll(user.uid).then(setGuests).catch(console.error)
    }
  }, [user])

  const getTableGuests = (table) => {
    return guests.filter(g => (table.guestIds || []).includes(g.id))
  }

  const unassignedGuests = useMemo(() => {
    const allAssigned = tables.flatMap(t => t.guestIds || [])
    return guests.filter(g => !allAssigned.includes(g.id))
  }, [guests, tables])

  const openCreate = () => { setForm(emptyTable); setSelectedTable(null); setModalOpen(true) }
  const openEdit = (table) => { setForm({ name: table.name, capacity: table.capacity || 8 }); setSelectedTable(table); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, capacity: Number(form.capacity) }
    if (selectedTable) { await update(selectedTable.id, data) } else { await add({ ...data, guestIds: [] }) }
    setModalOpen(false)
  }

  const assignGuest = async (table, guestId) => {
    const currentIds = table.guestIds || []
    if (currentIds.length >= table.capacity) return
    await update(table.id, { guestIds: [...currentIds, guestId] })
  }

  const removeGuest = async (table, guestId) => {
    await update(table.id, { guestIds: (table.guestIds || []).filter(id => id !== guestId) })
  }

  if (loading) return <Layout><Header title="Mesas" /><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Header title="Mesas / Asientos" />
      <div className="p-6">
        {/* Summary */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex gap-4">
            <Badge variant="gold">{tables.length} mesas</Badge>
            <Badge variant="success">{guests.length - unassignedGuests.length} asignados</Badge>
            <Badge variant="warning">{unassignedGuests.length} sin asignar</Badge>
          </div>
          <Button onClick={openCreate}><IoAdd className="mr-1" /> Nueva Mesa</Button>
        </div>

        {/* Tables Grid */}
        {tables.length === 0 ? (
          <EmptyState icon="🪑" title="No hay mesas" description="Crea mesas y asigna invitados" action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Nueva Mesa</Button>} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map(table => {
              const tableGuests = getTableGuests(table)
              const isFull = tableGuests.length >= table.capacity
              return (
                <Card key={table.id}>
                  <CardBody>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-text">{table.name}</h3>
                        <p className="text-sm text-text-light">
                          {tableGuests.length} / {table.capacity} asientos
                        </p>
                      </div>
                      <Badge variant={isFull ? 'error' : 'success'}>{isFull ? 'Llena' : 'Disponible'}</Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-border rounded-full h-2 mb-4">
                      <div className={`h-2 rounded-full transition-all ${isFull ? 'bg-error' : 'bg-gold'}`} style={{ width: `${(tableGuests.length / table.capacity) * 100}%` }} />
                    </div>

                    {/* Guests */}
                    <div className="space-y-1 mb-3">
                      {tableGuests.map(g => (
                        <div key={g.id} className="flex items-center justify-between bg-surface-elevated rounded px-2 py-1">
                          <span className="text-sm">{g.name}</span>
                          <button onClick={() => removeGuest(table, g.id)} className="text-text-light hover:text-error">
                            <IoClose size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 justify-between mt-3 border-t border-border pt-3">
                      {!isFull && (
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedTable(table); setAssignModalOpen(true) }}>
                          <IoPersonAdd size={14} className="mr-1" /> Asignar
                        </Button>
                      )}
                      <div className="flex gap-1 ml-auto">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(table)}><IoCreateOutline size={16} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedTable(table); setConfirmOpen(true) }}><IoTrashOutline size={16} className="text-error" /></Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}

        {/* Create/Edit Table Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedTable ? 'Editar Mesa' : 'Nueva Mesa'}>
          <form onSubmit={handleSubmit}>
            <Input label="Nombre de la Mesa" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required placeholder="Ej: Mesa 1, Mesa Principal" />
            <Input label="Capacidad" type="number" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} min="1" max="20" />
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedTable ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>

        {/* Assign Guest Modal */}
        <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title={`Asignar a ${selectedTable?.name}`}>
          {unassignedGuests.length === 0 ? (
            <p className="text-text-light text-center py-4">Todos los invitados están asignados</p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {unassignedGuests.map(guest => (
                <div key={guest.id} className="flex items-center justify-between px-3 py-2 hover:bg-surface-elevated rounded-lg">
                  <span className="text-sm">{guest.name}</span>
                  <Button size="sm" onClick={() => { assignGuest(selectedTable, guest.id); }}>Asignar</Button>
                </div>
              ))}
            </div>
          )}
        </Modal>

        <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => remove(selectedTable?.id)} title="Eliminar mesa" message={`¿Seguro que quieres eliminar "${selectedTable?.name}"?`} />
      </div>
    </Layout>
  )
}
