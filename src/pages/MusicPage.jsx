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
import { musicService } from '../services/musicService'
import { MUSIC_MOMENTS } from '../utils/constants'
import { IoAdd, IoMusicalNote, IoCreateOutline, IoTrashOutline } from 'react-icons/io5'

const emptySong = { title: '', artist: '', moment: 'fiesta', requestedBy: '', notes: '' }

export default function MusicPage() {
  const { data: songs, loading, add, update, remove } = useFirestore(musicService)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [form, setForm] = useState(emptySong)
  const [filterMoment, setFilterMoment] = useState('')

  const filtered = useMemo(() => {
    return filterMoment ? songs.filter(s => s.moment === filterMoment) : songs
  }, [songs, filterMoment])

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(song => {
      const key = song.moment || 'otro'
      if (!groups[key]) groups[key] = []
      groups[key].push(song)
    })
    return groups
  }, [filtered])

  const openCreate = () => { setForm(emptySong); setSelectedSong(null); setModalOpen(true) }
  const openEdit = (song) => { setForm({ ...emptySong, ...song }); setSelectedSong(song); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedSong) { await update(selectedSong.id, form) } else { await add(form) }
    setModalOpen(false)
  }

  if (loading) return <Layout><Header title="Música" /><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Header title="Música / Playlist" />
      <div className="p-4 sm:p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <Input type="select" value={filterMoment} onChange={(e) => setFilterMoment(e.target.value)} className="mb-0 min-w-full sm:min-w-[180px]">
            <option value="">Todos los momentos</option>
            {MUSIC_MOMENTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Input>
          <Badge variant="gold">{songs.length} canciones</Badge>
          <div className="ml-auto">
            <Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Canción</Button>
          </div>
        </div>

        {/* Song List */}
        {filtered.length === 0 ? (
          <EmptyState icon="🎵" title="No hay canciones" description="Crea tu playlist de boda" action={<Button onClick={openCreate}><IoAdd className="mr-1" /> Añadir Canción</Button>} />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([moment, songList]) => (
              <div key={moment}>
                <h3 className="text-sm font-medium text-text-light uppercase mb-3">
                  {MUSIC_MOMENTS.find(m => m.value === moment)?.label || moment} ({songList.length})
                </h3>
                <div className="space-y-2">
                  {songList.map(song => (
                    <Card key={song.id}>
                      <CardBody className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IoMusicalNote className="text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-text text-sm">{song.title}</h4>
                            <p className="text-xs text-text-light">{song.artist}</p>
                            {song.requestedBy && <p className="text-xs text-text-light">Pedida por: {song.requestedBy}</p>}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(song)}><IoCreateOutline size={16} /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedSong(song); setConfirmOpen(true) }}><IoTrashOutline size={16} className="text-error" /></Button>
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
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedSong ? 'Editar Canción' : 'Nueva Canción'}>
          <form onSubmit={handleSubmit}>
            <Input label="Título" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            <Input label="Artista" value={form.artist} onChange={(e) => setForm({...form, artist: e.target.value})} required />
            <Input label="Momento" type="select" value={form.moment} onChange={(e) => setForm({...form, moment: e.target.value})}>
              {MUSIC_MOMENTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </Input>
            <Input label="Pedida por" value={form.requestedBy} onChange={(e) => setForm({...form, requestedBy: e.target.value})} />
            <Input label="Notas" type="textarea" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedSong ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => remove(selectedSong?.id)} title="Eliminar canción" message={`¿Seguro que quieres eliminar "${selectedSong?.title}"?`} />
      </div>
    </Layout>
  )
}
