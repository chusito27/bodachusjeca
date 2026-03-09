import { db } from './firebase'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

const COLLECTION = 'guests'

export const guestService = {
  async getAll(userId, eventId) {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId), where('eventId', '==', eventId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  async add(data, userId, eventId) {
    return await addDoc(collection(db, COLLECTION), {
      ...data,
      userId,
      eventId,
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
