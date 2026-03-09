import { createContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { eventService } from '../services/eventService'
import toast from 'react-hot-toast'

export const EventContext = createContext(null)

const LS_KEY = 'selectedEventId'

export function EventProvider({ children }) {
  const { user, userProfile } = useAuth()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = userProfile?.role === 'admin'

  const fetchEvents = useCallback(async () => {
    if (!user || !userProfile?.role) {
      setEvents([])
      setSelectedEvent(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      if (isAdmin) {
        const result = await eventService.getAll(user.uid)
        setEvents(result)
        const savedId = localStorage.getItem(LS_KEY)
        const saved = savedId ? result.find(e => e.id === savedId) : null
        if (saved) {
          setSelectedEvent(saved)
        } else if (result.length > 0) {
          setSelectedEvent(result[0])
          localStorage.setItem(LS_KEY, result[0].id)
        } else {
          setSelectedEvent(null)
          localStorage.removeItem(LS_KEY)
        }
      } else if (userProfile.role === 'dueno' && userProfile.eventId) {
        const event = await eventService.getById(userProfile.eventId)
        if (event) {
          setEvents([event])
          setSelectedEvent(event)
        } else {
          setEvents([])
          setSelectedEvent(null)
        }
      } else {
        setEvents([])
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [user, userProfile, isAdmin])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const selectEvent = (event) => {
    setSelectedEvent(event)
    if (event) {
      localStorage.setItem(LS_KEY, event.id)
    } else {
      localStorage.removeItem(LS_KEY)
    }
  }

  const addEvent = async (data) => {
    if (!isAdmin) return
    try {
      const docRef = await eventService.add(data, user.uid)
      const newEvent = { id: docRef.id, ...data, userId: user.uid }
      const updated = [newEvent, ...events]
      setEvents(updated)
      if (!selectedEvent) selectEvent(newEvent)
      toast.success('Evento creado exitosamente')
      return newEvent
    } catch (error) {
      console.error('Error adding event:', error)
      toast.error('Error al crear evento')
    }
  }

  const updateEvent = async (id, data) => {
    try {
      await eventService.update(id, data)
      const updated = events.map(e => e.id === id ? { ...e, ...data } : e)
      setEvents(updated)
      if (selectedEvent?.id === id) {
        setSelectedEvent({ ...selectedEvent, ...data })
      }
      toast.success('Evento actualizado exitosamente')
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Error al actualizar evento')
    }
  }

  const deleteEvent = async (id) => {
    if (!isAdmin) return
    try {
      await eventService.delete(id)
      const updated = events.filter(e => e.id !== id)
      setEvents(updated)
      if (selectedEvent?.id === id) {
        if (updated.length > 0) selectEvent(updated[0])
        else selectEvent(null)
      }
      toast.success('Evento eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Error al eliminar evento')
    }
  }

  const value = {
    events,
    selectedEvent,
    loading,
    selectEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents
  }

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  )
}
