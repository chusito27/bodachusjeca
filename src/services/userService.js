import { db } from './firebase'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore'

const COLLECTION = 'users'

export const userService = {
  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTION))
    return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))
  },

  async getByUid(uid) {
    const ref = doc(db, COLLECTION, uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return { uid: snap.id, ...snap.data() }
  },

  async create(uid, data) {
    const ref = doc(db, COLLECTION, uid)
    return await setDoc(ref, {
      email: data.email || '',
      displayName: data.displayName || '',
      role: null,
      eventId: null,
      createdAt: serverTimestamp()
    })
  },

  async update(uid, data) {
    const ref = doc(db, COLLECTION, uid)
    return await updateDoc(ref, data)
  },

  async delete(uid) {
    return await deleteDoc(doc(db, COLLECTION, uid))
  },

  async clearEventAssignment(eventId) {
    const q = query(collection(db, COLLECTION), where('eventId', '==', eventId))
    const snapshot = await getDocs(q)
    const updates = snapshot.docs.map(d => updateDoc(d.ref, { eventId: null }))
    return await Promise.all(updates)
  }
}
