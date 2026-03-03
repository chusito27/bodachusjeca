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
import ProgressBar from '../components/ui/ProgressBar'
import { useFirestore } from '../hooks/useFirestore'
import { taskService } from '../services/taskService'
import { TASK_PRIORITIES, TASK_STATUS, TASK_CATEGORIES } from '../utils/constants'
import { formatDate } from '../utils/formatters'
import { IoAdd, IoCheckmarkCircle, IoCreateOutline, IoTrashOutline } from 'react-icons/io5'

const emptyTask = {
  title: '', description: '', dueDate: '', category: 'Otros',
  priority: 'media', status: 'pendiente'
}

export default function TasksPage() {
  const { data: tasks, loading, add, update, remove } = useFirestore(taskService)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [form, setForm] = useState(emptyTask)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const filtered = useMemo(() => {
    return tasks
      .filter(t => (!filterStatus || t.status === filterStatus) && (!filterPriority || t.priority === filterPriority))
      .sort((a, b) => {
        const priorityOrder = { alta: 0, media: 1, baja: 2 }
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
      })
  }, [tasks, filterStatus, filterPriority])

  const completed = tasks.filter(t => t.status === 'completada').length

  const openCreate = () => { setForm(emptyTask); setSelectedTask(null); setModalOpen(true) }
  const openEdit = (task) => { setForm({ ...emptyTask, ...task }); setSelectedTask(task); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedTask) { await update(selectedTask.id, form) } else { await add(form) }
    setModalOpen(false)
  }

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completada' ? 'pendiente' : 'completada'
    await update(task.id, { status: newStatus })
  }

  const priorityBadge = (priority) => {
    const config = TASK_PRIORITIES.find(p => p.value === priority)
    return <Badge variant={config?.color || 'default'}>{config?.label || priority}</Badge>
  }

  if (loading) return <Layout><Header title="Tareas" /><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Header title="Tareas" />
      <div className="p-4 sm:p-6">
        {/* Progress */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-text">Progreso General</h3>
              <span className="text-sm text-text-light">{completed} de {tasks.length} tareas</span>
            </div>
            <ProgressBar value={completed} max={tasks.length} color="success" />
          </CardBody>
        </Card>

        {/* Filters & Add */}
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <Input type="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="mb-0 min-w-full sm:min-w-[150px]">
            <option value="">Todos los estados</option>
            {TASK_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Input>
          <Input type="select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="mb-0 min-w-full sm:min-w-[150px]">
            <option value="">Todas las prioridades</option>
            {TASK_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Input>
          <Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Tarea</Button>
        </div>

        {/* Task List */}
        {filtered.length === 0 ? (
          <EmptyState icon="✅" title="No hay tareas" description="Crea tu checklist de boda" action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Tarea</Button>} />
        ) : (
          <div className="space-y-2">
            {filtered.map(task => (
              <Card key={task.id}>
                <CardBody>
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleComplete(task)} className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completada' ? 'bg-success border-success text-white' : 'border-border hover:border-gold'}`}>
                      {task.status === 'completada' && <IoCheckmarkCircle size={16} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-medium ${task.status === 'completada' ? 'line-through text-text-light' : 'text-text'}`}>{task.title}</h3>
                        {priorityBadge(task.priority)}
                        <Badge variant="gold">{task.category}</Badge>
                      </div>
                      {task.description && <p className="text-sm text-text-light mt-1">{task.description}</p>}
                      {task.dueDate && <p className="text-xs text-text-light mt-1">Fecha límite: {formatDate(task.dueDate)}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(task)}><IoCreateOutline size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedTask(task); setConfirmOpen(true) }}><IoTrashOutline size={16} className="text-error" /></Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedTask ? 'Editar Tarea' : 'Nueva Tarea'}>
          <form onSubmit={handleSubmit}>
            <Input label="Título" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            <Input label="Descripción" type="textarea" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Categoría" type="select" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Input>
              <Input label="Prioridad" type="select" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                {TASK_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Input>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Estado" type="select" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                {TASK_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Input>
              <Input label="Fecha Límite" type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} />
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedTask ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => remove(selectedTask?.id)} title="Eliminar tarea" message={`¿Seguro que quieres eliminar "${selectedTask?.title}"?`} />
      </div>
    </Layout>
  )
}
