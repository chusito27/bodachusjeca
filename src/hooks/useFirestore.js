import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

export function useFirestore(service) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const result = await service.getAll(user.uid)
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [user, service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const add = async (itemData) => {
    try {
      await service.add(itemData, user.uid)
      await fetchData()
      toast.success('Creado exitosamente')
    } catch (error) {
      console.error('Error adding:', error)
      toast.error('Error al crear')
    }
  }

  const update = async (id, itemData) => {
    try {
      await service.update(id, itemData)
      await fetchData()
      toast.success('Actualizado exitosamente')
    } catch (error) {
      console.error('Error updating:', error)
      toast.error('Error al actualizar')
    }
  }

  const remove = async (id) => {
    try {
      await service.delete(id)
      await fetchData()
      toast.success('Eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Error al eliminar')
    }
  }

  return { data, loading, add, update, remove, refresh: fetchData }
}
