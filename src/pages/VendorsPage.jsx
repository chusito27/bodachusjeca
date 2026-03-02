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
import { useFirestore } from '../hooks/useFirestore'
import { vendorService } from '../services/vendorService'
import { BUDGET_CATEGORIES, VENDOR_STATUS } from '../utils/constants'
import { formatCurrency } from '../utils/formatters'
import { IoAdd, IoSearch, IoCreateOutline, IoTrashOutline, IoCallOutline, IoMailOutline } from 'react-icons/io5'

const emptyVendor = {
  name: '', category: 'venue', contact: '', email: '', phone: '',
  price: '', contractStatus: 'contactado', notes: '', commitDate: ''
}

export default function VendorsPage() {
  const { data: vendors, loading, add, update, remove } = useFirestore(vendorService)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [form, setForm] = useState(emptyVendor)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return vendors.filter(v => v.name?.toLowerCase().includes(search.toLowerCase()) || v.category?.toLowerCase().includes(search.toLowerCase()))
  }, [vendors, search])

  const openCreate = () => { setForm(emptyVendor); setSelectedVendor(null); setModalOpen(true) }
  const openEdit = (vendor) => { setForm({ ...emptyVendor, ...vendor, price: vendor.price || '' }); setSelectedVendor(vendor); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, price: Number(form.price) || 0 }
    if (selectedVendor) { await update(selectedVendor.id, data) } else { await add(data) }
    setModalOpen(false)
  }

  const statusBadge = (status) => {
    const colors = { contactado: 'default', cotizado: 'warning', contratado: 'info', pagado: 'success' }
    return <Badge variant={colors[status] || 'default'}>{VENDOR_STATUS.find(s => s.value === status)?.label || status}</Badge>
  }

  if (loading) return <Layout><Header title="Proveedores" /><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Header title="Proveedores" />
      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input type="text" placeholder="Buscar proveedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
          </div>
          <Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Proveedor</Button>
        </div>

        {/* Vendor Cards */}
        {filtered.length === 0 ? (
          <EmptyState icon="🏢" title="No hay proveedores" description="Añade los proveedores de tu boda" action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir</Button>} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(vendor => (
              <Card key={vendor.id}>
                <CardBody>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-text">{vendor.name}</h3>
                      <p className="text-xs text-text-light">{BUDGET_CATEGORIES.find(c => c.value === vendor.category)?.label || vendor.category}</p>
                    </div>
                    {statusBadge(vendor.contractStatus)}
                  </div>
                  {vendor.price > 0 && <p className="text-lg font-bold text-gold mb-2">{formatCurrency(vendor.price)}</p>}
                  {vendor.contact && <p className="text-sm text-text-light mb-1">{vendor.contact}</p>}
                  <div className="flex gap-3 text-xs text-text-light mb-3">
                    {vendor.phone && <span className="flex items-center gap-1"><IoCallOutline />{vendor.phone}</span>}
                    {vendor.email && <span className="flex items-center gap-1"><IoMailOutline />{vendor.email}</span>}
                  </div>
                  {vendor.notes && <p className="text-xs text-text-light border-t border-border pt-2 mt-2">{vendor.notes}</p>}
                  <div className="flex gap-1 justify-end mt-3">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(vendor)}><IoCreateOutline size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedVendor(vendor); setConfirmOpen(true) }}><IoTrashOutline size={16} className="text-error" /></Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedVendor ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
          <form onSubmit={handleSubmit}>
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <Input label="Categoría" type="select" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {BUDGET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </Input>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contacto" value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} />
              <Input label="Precio" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            </div>
            <Input label="Estado" type="select" value={form.contractStatus} onChange={(e) => setForm({...form, contractStatus: e.target.value})}>
              {VENDOR_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Input>
            <Input label="Fecha Compromiso" type="date" value={form.commitDate} onChange={(e) => setForm({...form, commitDate: e.target.value})} />
            <Input label="Notas" type="textarea" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedVendor ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => remove(selectedVendor?.id)} title="Eliminar proveedor" message={`¿Seguro que quieres eliminar a "${selectedVendor?.name}"?`} />
      </div>
    </Layout>
  )
}
