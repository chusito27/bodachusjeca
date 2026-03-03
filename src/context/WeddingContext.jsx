import { createContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { weddingService } from '../services/weddingService'
import toast from 'react-hot-toast'

export const WeddingContext = createContext(null)

const LS_KEY = 'selectedWeddingId'

export function WeddingProvider({ children }) {
  const { user, userProfile } = useAuth()
  const [weddings, setWeddings] = useState([])
  const [selectedWedding, setSelectedWedding] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = userProfile?.role === 'admin'

  const fetchWeddings = useCallback(async () => {
    if (!user || !userProfile?.role) {
      setWeddings([])
      setSelectedWedding(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      if (isAdmin) {
        // Admin: fetch all weddings they own, use localStorage for selection
        const result = await weddingService.getAll(user.uid)
        setWeddings(result)

        const savedId = localStorage.getItem(LS_KEY)
        const saved = savedId ? result.find(w => w.id === savedId) : null

        if (saved) {
          setSelectedWedding(saved)
        } else if (result.length > 0) {
          setSelectedWedding(result[0])
          localStorage.setItem(LS_KEY, result[0].id)
        } else {
          setSelectedWedding(null)
          localStorage.removeItem(LS_KEY)
        }
      } else if (userProfile.role === 'dueno' && userProfile.weddingId) {
        // Dueño: fetch only their assigned wedding
        const wedding = await weddingService.getById(userProfile.weddingId)
        if (wedding) {
          setWeddings([wedding])
          setSelectedWedding(wedding)
        } else {
          setWeddings([])
          setSelectedWedding(null)
        }
      } else {
        // Dueño without wedding or unknown role
        setWeddings([])
        setSelectedWedding(null)
      }
    } catch (error) {
      console.error('Error fetching weddings:', error)
    } finally {
      setLoading(false)
    }
  }, [user, userProfile, isAdmin])

  useEffect(() => {
    fetchWeddings()
  }, [fetchWeddings])

  const selectWedding = (wedding) => {
    setSelectedWedding(wedding)
    if (wedding) {
      localStorage.setItem(LS_KEY, wedding.id)
    } else {
      localStorage.removeItem(LS_KEY)
    }
  }

  const addWedding = async (data) => {
    if (!isAdmin) return
    try {
      const docRef = await weddingService.add(data, user.uid)
      const newWedding = { id: docRef.id, ...data, userId: user.uid }
      const updated = [newWedding, ...weddings]
      setWeddings(updated)
      if (!selectedWedding) {
        selectWedding(newWedding)
      }
      toast.success('Boda creada exitosamente')
      return newWedding
    } catch (error) {
      console.error('Error adding wedding:', error)
      toast.error('Error al crear boda')
    }
  }

  const updateWedding = async (id, data) => {
    try {
      await weddingService.update(id, data)
      const updated = weddings.map(w => w.id === id ? { ...w, ...data } : w)
      setWeddings(updated)
      if (selectedWedding?.id === id) {
        setSelectedWedding({ ...selectedWedding, ...data })
      }
      toast.success('Boda actualizada exitosamente')
    } catch (error) {
      console.error('Error updating wedding:', error)
      toast.error('Error al actualizar boda')
    }
  }

  const deleteWedding = async (id) => {
    if (!isAdmin) return
    try {
      await weddingService.delete(id)
      const updated = weddings.filter(w => w.id !== id)
      setWeddings(updated)
      if (selectedWedding?.id === id) {
        if (updated.length > 0) {
          selectWedding(updated[0])
        } else {
          selectWedding(null)
        }
      }
      toast.success('Boda eliminada exitosamente')
    } catch (error) {
      console.error('Error deleting wedding:', error)
      toast.error('Error al eliminar boda')
    }
  }

  const value = {
    weddings,
    selectedWedding,
    loading,
    selectWedding,
    addWedding,
    updateWedding,
    deleteWedding,
    refreshWeddings: fetchWeddings
  }

  return (
    <WeddingContext.Provider value={value}>
      {children}
    </WeddingContext.Provider>
  )
}
