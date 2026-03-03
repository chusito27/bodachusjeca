import { db } from './firebase'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

const COLLECTION = 'guests'

export const guestService = {
  async getAll(userId, weddingId) {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId), where('weddingId', '==', weddingId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  async add(data, userId, weddingId) {
    return await addDoc(collection(db, COLLECTION), {
      ...data,
      userId,
      weddingId,
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
