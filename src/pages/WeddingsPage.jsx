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
import { useWedding } from '../hooks/useWedding'
import { userService } from '../services/userService'
import { formatDate } from '../utils/formatters'
import { IoAdd, IoCreateOutline, IoTrashOutline, IoCheckmarkCircle } from 'react-icons/io5'

const emptyWedding = { name: '', date: '' }

export default function WeddingsPage() {
  const { userProfile } = useAuth()
  const { weddings, selectedWedding, loading, selectWedding, addWedding, updateWedding, deleteWedding } = useWedding()

  // Dueño cannot access this page
  if (userProfile?.role === 'dueno') {
    return <Navigate to="/" />
  }
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyWedding)

  const openCreate = () => {
    setForm(emptyWedding)
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (wedding) => {
    setForm({ name: wedding.name, date: wedding.date || '' })
    setEditing(wedding)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await updateWedding(editing.id, form)
    } else {
      await addWedding(form)
    }
    setModalOpen(false)
  }

  if (loading) {
    return (
      <Layout requireWedding={false}>
        <Header title="Mis Bodas" />
        <LoadingSpinner />
      </Layout>
    )
  }

  return (
    <Layout requireWedding={false}>
      <Header title="Mis Bodas" />
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-text-light text-sm">{weddings.length} boda{weddings.length !== 1 ? 's' : ''}</p>
          <Button onClick={openCreate}><IoAdd className="mr-1" /> Nueva Boda</Button>
        </div>

        {weddings.length === 0 ? (
          <EmptyState
            icon="💒"
            title="No hay bodas"
            description="Crea tu primera boda para comenzar a planificar"
            action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Nueva Boda</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings.map(wedding => {
              const isActive = selectedWedding?.id === wedding.id
              return (
                <Card key={wedding.id} className={isActive ? 'ring-2 ring-gold' : ''}>
                  <CardBody>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-text text-lg">{wedding.name}</h3>
                        <p className="text-sm text-text-light mt-1">
                          {wedding.date ? formatDate(new Date(wedding.date)) : 'Sin fecha'}
                        </p>
                      </div>
                      {isActive && <Badge variant="gold">Activa</Badge>}
                    </div>

                    <div className="flex gap-2 mt-4 border-t border-border pt-4">
                      {!isActive && (
                        <Button size="sm" onClick={() => selectWedding(wedding)}>
                          <IoCheckmarkCircle size={14} className="mr-1" /> Seleccionar
                        </Button>
                      )}
                      <div className="flex gap-1 ml-auto">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(wedding)}>
                          <IoCreateOutline size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(wedding); setConfirmOpen(true) }}>
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

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Boda' : 'Nueva Boda'}>
          <form onSubmit={handleSubmit}>
            <Input
              label="Nombre de la Boda"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej: Boda Chus & Jeca"
            />
            <Input
              label="Fecha"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
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
              await userService.clearWeddingAssignment(editing.id)
              await deleteWedding(editing.id)
            }
          }}
          title="Eliminar boda"
          message={`¿Seguro que quieres eliminar "${editing?.name}"? Todos los datos asociados dejarán de ser accesibles y los dueños asignados perderán acceso.`}
        />
      </div>
    </Layout>
  )
}
