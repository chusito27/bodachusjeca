import { db } from './firebase'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

const COLLECTION = 'events'

export const eventService = {
  async getAll(userId) {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  async getById(id) {
    const ref = doc(db, COLLECTION, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() }
  },

  async add(data, userId) {
    return await addDoc(collection(db, COLLECTION), {
      ...data,
      userId,
      createdAt: serverTimestamp()
    })
  },

  async update(id, data) {
    const ref = doc(db, COLLECTION, id)
    return await updateDoc(ref, data)
  },

  async delete(id) {
    return await deleteDoc(doc(db, COLLECTION, id))
  }
}
