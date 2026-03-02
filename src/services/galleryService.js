import { db } from './firebase'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const COLLECTION = 'gallery'

export const galleryService = {
  async getAll(userId) {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
  },

  async upload(file, userId) {
    const storageRef = ref(storage, `gallery/${userId}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const url = await getDownloadURL(snapshot.ref)
    return { url, path: snapshot.ref.fullPath }
  },

  async deleteFile(path) {
    const storageRef = ref(storage, path)
    return await deleteObject(storageRef)
  }
}
