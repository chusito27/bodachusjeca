import { useState, useMemo } from 'react'
import Layout from '../components/layout/Layout'
import Header from '../components/layout/Header'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatsCard from '../components/ui/StatsCard'
import ProgressBar from '../components/ui/ProgressBar'
import { useFirestore } from '../hooks/useFirestore'
import { budgetService } from '../services/budgetService'
import { BUDGET_CATEGORIES, PAYMENT_STATUS } from '../utils/constants'
import { formatCurrency } from '../utils/formatters'
import { IoAdd, IoWalletOutline, IoTrendingUp, IoTrendingDown, IoCheckmarkDone, IoCreateOutline, IoTrashOutline } from 'react-icons/io5'

const emptyExpense = {
  concept: '', category: 'venue', estimatedAmount: '',
  realAmount: '', paymentStatus: 'pendiente', vendorName: '', notes: ''
}

export default function BudgetPage() {
  const { data: expenses, loading, add, update, remove } = useFirestore(budgetService)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [form, setForm] = useState(emptyExpense)
  const [filterCategory, setFilterCategory] = useState('')

  const stats = useMemo(() => {
    const estimated = expenses.reduce((sum, e) => sum + (Number(e.estimatedAmount) || 0), 0)
    const real = expenses.reduce((sum, e) => sum + (Number(e.realAmount) || 0), 0)
    const paid = expenses.filter(e => e.paymentStatus === 'pagado').reduce((sum, e) => sum + (Number(e.realAmount) || Number(e.estimatedAmount) || 0), 0)
    return { estimated, real, paid }
  }, [expenses])

  const categoryBreakdown = useMemo(() => {
    const breakdown = {}
    expenses.forEach(e => {
      if (!breakdown[e.category]) breakdown[e.category] = { estimated: 0, real: 0 }
      breakdown[e.category].estimated += Number(e.estimatedAmount) || 0
      breakdown[e.category].real += Number(e.realAmount) || 0
    })
    return breakdown
  }, [expenses])

  const filtered = useMemo(() => {
    return filterCategory ? expenses.filter(e => e.category === filterCategory) : expenses
  }, [expenses, filterCategory])

  const openCreate = () => { setForm(emptyExpense); setSelectedExpense(null); setModalOpen(true) }
  const openEdit = (exp) => { setForm({ ...emptyExpense, ...exp, estimatedAmount: exp.estimatedAmount || '', realAmount: exp.realAmount || '' }); setSelectedExpense(exp); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, estimatedAmount: Number(form.estimatedAmount) || 0, realAmount: Number(form.realAmount) || 0 }
    if (selectedExpense) { await update(selectedExpense.id, data) } else { await add(data) }
    setModalOpen(false)
  }

  const paymentBadge = (status) => {
    const colors = { pendiente: 'warning', parcial: 'info', pagado: 'success' }
    return <Badge variant={colors[status] || 'default'}>{PAYMENT_STATUS.find(p => p.value === status)?.label || status}</Badge>
  }

  if (loading) return <Layout><Header title="Presupuesto" /><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Header title="Presupuesto" />
      <div className="p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatsCard icon={<IoTrendingUp />} label="Estimado Total" value={formatCurrency(stats.estimated)} color="gold" />
          <StatsCard icon={<IoTrendingDown />} label="Gasto Real" value={formatCurrency(stats.real)} color="warning" />
          <StatsCard icon={<IoCheckmarkDone />} label="Pagado" value={formatCurrency(stats.paid)} color="success" />
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <Card className="mb-6">
            <CardHeader><h3 className="font-semibold text-text">Distribución por Categoría</h3></CardHeader>
            <CardBody>
              <div className="space-y-3">
                {BUDGET_CATEGORIES.filter(c => categoryBreakdown[c.value]).map(cat => (
                  <div key={cat.value}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.icon} {cat.label}</span>
                      <span className="font-medium">{formatCurrency(categoryBreakdown[cat.value]?.real || categoryBreakdown[cat.value]?.estimated || 0)}</span>
                    </div>
                    <ProgressBar
                      value={categoryBreakdown[cat.value]?.real || categoryBreakdown[cat.value]?.estimated || 0}
                      max={stats.estimated || 1}
                      showPercentage={false}
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Filters & Add */}
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <Input type="select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="mb-0 min-w-full sm:min-w-[180px]">
            <option value="">Todas las categorías</option>
            {BUDGET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
          </Input>
          <Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Gasto</Button>
        </div>

        {/* Expense List */}
        {filtered.length === 0 ? (
          <EmptyState icon="💰" title="No hay gastos" description="Comienza registrando los gastos del evento" action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Gasto</Button>} />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 sm:px-6 py-3 text-xs font-medium text-text-light uppercase">Concepto</th>
                    <th className="text-left px-3 sm:px-6 py-3 text-xs font-medium text-text-light uppercase hidden md:table-cell">Categoría</th>
                    <th className="text-right px-3 sm:px-6 py-3 text-xs font-medium text-text-light uppercase hidden sm:table-cell">Estimado</th>
                    <th className="text-right px-3 sm:px-6 py-3 text-xs font-medium text-text-light uppercase">Real</th>
                    <th className="text-left px-3 sm:px-6 py-3 text-xs font-medium text-text-light uppercase hidden sm:table-cell">Estado</th>
                    <th className="text-right px-3 sm:px-6 py-3 text-xs font-medium text-text-light uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(expense => (
                    <tr key={expense.id} className="border-b border-border hover:bg-surface-elevated/50">
                      <td className="px-3 sm:px-6 py-3">
                        <p className="text-sm font-medium text-text truncate max-w-[100px] sm:max-w-none">{expense.concept}</p>
                        {expense.vendorName && <p className="text-xs text-text-light truncate max-w-[100px] sm:max-w-none">{expense.vendorName}</p>}
                      </td>
                      <td className="px-3 sm:px-6 py-3 hidden md:table-cell">
                        <span className="text-sm">{BUDGET_CATEGORIES.find(c => c.value === expense.category)?.icon} {BUDGET_CATEGORIES.find(c => c.value === expense.category)?.label}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-right text-sm hidden sm:table-cell">{formatCurrency(expense.estimatedAmount)}</td>
                      <td className="px-3 sm:px-6 py-3 text-right text-sm font-medium">{formatCurrency(expense.realAmount)}</td>
                      <td className="px-3 sm:px-6 py-3 hidden sm:table-cell">{paymentBadge(expense.paymentStatus)}</td>
                      <td className="px-3 sm:px-6 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(expense)}><IoCreateOutline size={16} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedExpense(expense); setConfirmOpen(true) }}><IoTrashOutline size={16} className="text-error" /></Button>
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
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedExpense ? 'Editar Gasto' : 'Nuevo Gasto'}>
          <form onSubmit={handleSubmit}>
            <Input label="Concepto" value={form.concept} onChange={(e) => setForm({...form, concept: e.target.value})} required />
            <Input label="Categoría" type="select" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {BUDGET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </Input>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Monto Estimado" type="number" value={form.estimatedAmount} onChange={(e) => setForm({...form, estimatedAmount: e.target.value})} />
              <Input label="Monto Real" type="number" value={form.realAmount} onChange={(e) => setForm({...form, realAmount: e.target.value})} />
            </div>
            <Input label="Estado de Pago" type="select" value={form.paymentStatus} onChange={(e) => setForm({...form, paymentStatus: e.target.value})}>
              {PAYMENT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Input>
            <Input label="Proveedor" value={form.vendorName} onChange={(e) => setForm({...form, vendorName: e.target.value})} />
            <Input label="Notas" type="textarea" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedExpense ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => remove(selectedExpense?.id)} title="Eliminar gasto" message={`¿Seguro que quieres eliminar "${selectedExpense?.concept}"?`} />
      </div>
    </Layout>
  )
}
