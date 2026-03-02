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
import { useAuth } from '../hooks/useAuth'
import { galleryService } from '../services/galleryService'
import { GALLERY_CATEGORIES } from '../utils/constants'
import { IoAdd, IoTrashOutline, IoCloudUploadOutline, IoExpandOutline } from 'react-icons/io5'
import toast from 'react-hot-toast'

export default function GalleryPage() {
  const { data: photos, loading, add, remove, refresh } = useFirestore(galleryService)
  const { user } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [uploadCategory, setUploadCategory] = useState('inspiracion')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [files, setFiles] = useState(null)

  const filtered = useMemo(() => {
    return filterCategory ? photos.filter(p => p.category === filterCategory) : photos
  }, [photos, filterCategory])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const { url, path } = await galleryService.upload(file, user.uid)
        await add({ url, path, category: uploadCategory, description: uploadDescription })
      }
      toast.success('Fotos subidas exitosamente')
      setUploadModalOpen(false)
      setFiles(null)
      setUploadDescription('')
      refresh()
    } catch (error) {
      toast.error('Error al subir fotos')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photo) => {
    try {
      if (photo.path) await galleryService.deleteFile(photo.path)
    } catch (e) { /* ignore storage errors */ }
    await remove(photo.id)
  }

  if (loading) return <Layout><Header title="Galería" /><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Header title="Galería de Fotos" />
      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <Input type="select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="mb-0 min-w-[180px]">
            <option value="">Todas las categorías</option>
            {GALLERY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Input>
          <Badge variant="gold">{photos.length} fotos</Badge>
          <div className="ml-auto">
            <Button onClick={() => setUploadModalOpen(true)}>
              <IoCloudUploadOutline className="mr-1" /> Subir Fotos
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        {filtered.length === 0 ? (
          <EmptyState icon="📷" title="No hay fotos" description="Sube fotos de inspiración para tu boda" action={<Button onClick={() => setUploadModalOpen(true)}><IoCloudUploadOutline className="mr-1" /> Subir Fotos</Button>} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(photo => (
              <Card key={photo.id} className="overflow-hidden group">
                <div className="relative aspect-square">
                  <img src={photo.url} alt={photo.description || 'Foto'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => { setPreviewUrl(photo.url); setPreviewOpen(true) }} className="bg-white/90 p-2 rounded-full hover:bg-white">
                      <IoExpandOutline size={18} />
                    </button>
                    <button onClick={() => { setSelectedPhoto(photo); setConfirmOpen(true) }} className="bg-white/90 p-2 rounded-full hover:bg-white text-error">
                      <IoTrashOutline size={18} />
                    </button>
                  </div>
                </div>
                <CardBody className="py-2 px-3">
                  <Badge variant="gold" className="text-xs">
                    {GALLERY_CATEGORIES.find(c => c.value === photo.category)?.label || photo.category}
                  </Badge>
                  {photo.description && <p className="text-xs text-text-light mt-1 truncate">{photo.description}</p>}
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Subir Fotos">
          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1">Fotos</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} className="w-full text-sm text-text" required />
            </div>
            <Input label="Categoría" type="select" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
              {GALLERY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Input>
            <Input label="Descripción" value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} />
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={uploading}>{uploading ? 'Subiendo...' : 'Subir'}</Button>
            </div>
          </form>
        </Modal>

        {/* Preview Modal */}
        <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Vista Previa" size="xl">
          <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
        </Modal>

        <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => handleDelete(selectedPhoto)} title="Eliminar foto" message="¿Seguro que quieres eliminar esta foto?" />
      </div>
    </Layout>
  )
}
