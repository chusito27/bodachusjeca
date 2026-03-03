import { useContext } from 'react'
import { WeddingContext } from '../context/WeddingContext'

export function useWedding() {
  const context = useContext(WeddingContext)
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider')
  }
  return context
}
