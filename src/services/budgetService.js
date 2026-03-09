import { db } from './firebase'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

const COLLECTION = 'expenses'

export const budgetService = {
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
  },

  async getCategories(userId, eventId) {
    const q = query(collection(db, 'budget_categories'), where('userId', '==', userId), where('eventId', '==', eventId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  async addCategory(data, userId, eventId) {
    return await addDoc(collection(db, 'budget_categories'), { ...data, userId, eventId })
  },

  async updateCategory(id, data) {
    return await updateDoc(doc(db, 'budget_categories', id), data)
  },

  async deleteCategory(id) {
    return await deleteDoc(doc(db, 'budget_categories', id))
  }
}
