import { db } from './firebase'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

const COLLECTION = 'gallery'
const IMGBB_API_KEY = '856f90c4d5b5d658378dffbfc3daa28d'

export const galleryService = {
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
  },

  async upload(file) {
    const formData = new FormData()
    formData.append('key', IMGBB_API_KEY)
    formData.append('image', file)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error('Error al subir imagen a imgBB')
    }

    return { url: data.data.display_url }
  }
}
