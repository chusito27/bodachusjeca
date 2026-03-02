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
import { menuService } from '../services/menuService'
import { MENU_CATEGORIES } from '../utils/constants'
import { IoAdd, IoCreateOutline, IoTrashOutline, IoLeafOutline, IoNutritionOutline } from 'react-icons/io5'

const emptyItem = {
  name: '', category: 'entrada', description: '',
  isVegetarian: false, isVegan: false, isGlutenFree: false
}

export default function MenuPage() {
  const { data: items, loading, add, update, remove } = useFirestore(menuService)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [form, setForm] = useState(emptyItem)
  const [filterCategory, setFilterCategory] = useState('')

  const filtered = useMemo(() => {
    return filterCategory ? items.filter(i => i.category === filterCategory) : items
  }, [items, filterCategory])

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(item => {
      const key = item.category || 'otro'
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }, [filtered])

  const openCreate = () => { setForm(emptyItem); setSelectedItem(null); setModalOpen(true) }
  const openEdit = (item) => { setForm({ ...emptyItem, ...item }); setSelectedItem(item); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedItem) { await update(selectedItem.id, form) } else { await add(form) }
    setModalOpen(false)
  }

  if (loading) return <Layout><Header title="Menú" /><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Header title="Menú" />
      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <Input type="select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="mb-0 min-w-[180px]">
            <option value="">Todas las categorías</option>
            {MENU_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Input>
          <Badge variant="gold">{items.length} platos</Badge>
          <div className="ml-auto">
            <Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Plato</Button>
          </div>
        </div>

        {/* Menu Items */}
        {filtered.length === 0 ? (
          <EmptyState icon="🍽️" title="No hay platos" description="Configura las opciones de menú para tu boda" action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Plato</Button>} />
        ) : (
          <div className="space-y-8">
            {MENU_CATEGORIES.filter(c => grouped[c.value]).map(cat => (
              <div key={cat.value}>
                <h3 className="text-lg font-semibold text-text mb-4 pb-2 border-b border-gold/20">
                  {cat.label}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grouped[cat.value].map(item => (
                    <Card key={item.id}>
                      <CardBody>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-text">{item.name}</h4>
                            {item.description && <p className="text-sm text-text-light mt-1">{item.description}</p>}
                            <div className="flex gap-2 mt-2">
                              {item.isVegetarian && <Badge variant="success"><IoLeafOutline className="mr-1 inline" />Vegetariano</Badge>}
                              {item.isVegan && <Badge variant="success"><IoNutritionOutline className="mr-1 inline" />Vegano</Badge>}
                              {item.isGlutenFree && <Badge variant="info">Sin Gluten</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0 ml-4">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><IoCreateOutline size={16} /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(item); setConfirmOpen(true) }}><IoTrashOutline size={16} className="text-error" /></Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedItem ? 'Editar Plato' : 'Nuevo Plato'}>
          <form onSubmit={handleSubmit}>
            <Input label="Nombre del Plato" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <Input label="Categoría" type="select" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {MENU_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Input>
            <Input label="Descripción" type="textarea" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-text mb-2">Restricciones Alimentarias</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isVegetarian} onChange={(e) => setForm({...form, isVegetarian: e.target.checked})} className="rounded" />
                  Vegetariano
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isVegan} onChange={(e) => setForm({...form, isVegan: e.target.checked})} className="rounded" />
                  Vegano
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isGlutenFree} onChange={(e) => setForm({...form, isGlutenFree: e.target.checked})} className="rounded" />
                  Sin Gluten
                </label>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedItem ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => remove(selectedItem?.id)} title="Eliminar plato" message={`¿Seguro que quieres eliminar "${selectedItem?.name}"?`} />
      </div>
    </Layout>
  )
}
