import { useState, useMemo } from 'react'
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
import StatsCard from '../components/ui/StatsCard'
import { useFirestore } from '../hooks/useFirestore'
import { guestService } from '../services/guestService'
import { GUEST_GROUPS, RSVP_STATUS } from '../utils/constants'
import { IoAdd, IoSearch, IoPeopleOutline, IoCheckmarkCircle, IoHourglass, IoCloseCircle, IoCreateOutline, IoTrashOutline } from 'react-icons/io5'

const emptyGuest = {
  name: '', email: '', phone: '', group: 'amigos',
  rsvpStatus: 'pendiente', plusOne: false, plusOneName: '',
  dietaryRestrictions: '', notes: ''
}

export default function GuestsPage() {
  const { data: guests, loading, add, update, remove } = useFirestore(guestService)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [form, setForm] = useState(emptyGuest)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [filterRsvp, setFilterRsvp] = useState('')

  const filtered = useMemo(() => {
    return guests.filter(g => {
      const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase()) ||
        g.email?.toLowerCase().includes(search.toLowerCase())
      const matchGroup = !filterGroup || g.group === filterGroup
      const matchRsvp = !filterRsvp || g.rsvpStatus === filterRsvp
      return matchSearch && matchGroup && matchRsvp
    })
  }, [guests, search, filterGroup, filterRsvp])

  const stats = useMemo(() => ({
    total: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmado').length,
    pending: guests.filter(g => g.rsvpStatus === 'pendiente').length,
    declined: guests.filter(g => g.rsvpStatus === 'declinado').length,
    plusOnes: guests.filter(g => g.plusOne).length
  }), [guests])

  const openCreate = () => {
    setForm(emptyGuest)
    setSelectedGuest(null)
    setModalOpen(true)
  }

  const openEdit = (guest) => {
    setForm({ ...emptyGuest, ...guest })
    setSelectedGuest(guest)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedGuest) {
      await update(selectedGuest.id, form)
    } else {
      await add(form)
    }
    setModalOpen(false)
  }

  const handleDelete = (guest) => {
    setSelectedGuest(guest)
    setConfirmOpen(true)
  }

  const rsvpBadge = (status) => {
    const config = RSVP_STATUS.find(r => r.value === status)
    return <Badge variant={config?.color || 'default'}>{config?.label || status}</Badge>
  }

  if (loading) return <Layout><Header title="Invitados" /><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Header title="Invitados" />
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard icon={<IoPeopleOutline />} label="Total" value={stats.total} color="gold" />
          <StatsCard icon={<IoCheckmarkCircle />} label="Confirmados" value={stats.confirmed} color="success" />
          <StatsCard icon={<IoHourglass />} label="Pendientes" value={stats.pending} color="warning" />
          <StatsCard icon={<IoCloseCircle />} label="Declinados" value={stats.declined} color="error" />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input
                    type="text"
                    placeholder="Buscar invitado..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>
              </div>
              <Input type="select" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="mb-0 min-w-[150px]">
                <option value="">Todos los grupos</option>
                {GUEST_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </Input>
              <Input type="select" value={filterRsvp} onChange={(e) => setFilterRsvp(e.target.value)} className="mb-0 min-w-[150px]">
                <option value="">Todos los estados</option>
                {RSVP_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Input>
              <Button onClick={openCreate}>
                <IoAdd className="mr-1" /> Añadir
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Guest List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No hay invitados"
            description="Comienza añadiendo tus invitados a la lista"
            action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Invitado</Button>}
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-light uppercase">Nombre</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-light uppercase hidden md:table-cell">Grupo</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-light uppercase">RSVP</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-light uppercase hidden lg:table-cell">+1</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-text-light uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(guest => (
                    <tr key={guest.id} className="border-b border-border hover:bg-surface-elevated/50">
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-text">{guest.name}</p>
                        <p className="text-xs text-text-light">{guest.email}</p>
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell">
                        <span className="text-sm text-text-light">
                          {GUEST_GROUPS.find(g => g.value === guest.group)?.label || guest.group}
                        </span>
                      </td>
                      <td className="px-6 py-3">{rsvpBadge(guest.rsvpStatus)}</td>
                      <td className="px-6 py-3 hidden lg:table-cell">
                        <span className="text-sm text-text-light">
                          {guest.plusOne ? (guest.plusOneName || 'Sí') : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(guest)}>
                            <IoCreateOutline size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(guest)}>
                            <IoTrashOutline size={16} className="text-error" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedGuest ? 'Editar Invitado' : 'Nuevo Invitado'}>
          <form onSubmit={handleSubmit}>
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Grupo" type="select" value={form.group} onChange={(e) => setForm({...form, group: e.target.value})}>
                {GUEST_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </Input>
              <Input label="RSVP" type="select" value={form.rsvpStatus} onChange={(e) => setForm({...form, rsvpStatus: e.target.value})}>
                {RSVP_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Input>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" id="plusOne" checked={form.plusOne} onChange={(e) => setForm({...form, plusOne: e.target.checked})} className="rounded" />
              <label htmlFor="plusOne" className="text-sm">Acompañante (+1)</label>
            </div>
            {form.plusOne && (
              <Input label="Nombre del acompañante" value={form.plusOneName} onChange={(e) => setForm({...form, plusOneName: e.target.value})} />
            )}
            <Input label="Restricciones alimentarias" value={form.dietaryRestrictions} onChange={(e) => setForm({...form, dietaryRestrictions: e.target.value})} />
            <Input label="Notas" type="textarea" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedGuest ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => remove(selectedGuest?.id)}
          title="Eliminar invitado"
          message={`¿Seguro que quieres eliminar a ${selectedGuest?.name}?`}
        />
      </div>
    </Layout>
  )
}
