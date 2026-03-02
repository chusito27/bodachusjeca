import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBMb1vaU4Bp7oacV10L8Vcue80k9rwmgCk",
  authDomain: "bodachusyjeca.firebaseapp.com",
  databaseURL: "https://bodachusyjeca-default-rtdb.firebaseio.com",
  projectId: "bodachusyjeca",
  storageBucket: "bodachusyjeca.firebasestorage.app",
  messagingSenderId: "311525180055",
  appId: "1:311525180055:web:09d9778be285af37fb1fd2",
  measurementId: "G-BGBR9VZEG2"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
