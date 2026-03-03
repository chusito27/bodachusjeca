import { createContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { userService } from '../services/userService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (!firebaseUser) {
        setUserProfile(null)
        setProfileLoading(false)
      }
    })
    return unsubscribe
  }, [])

  // Realtime listener for user profile in Firestore
  useEffect(() => {
    if (!user) return

    setProfileLoading(true)
    const ref = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        setUserProfile({ uid: snap.id, ...snap.data() })
        setProfileLoading(false)
      } else {
        // Legacy user without Firestore doc — create one
        await userService.create(user.uid, {
          email: user.email,
          displayName: user.displayName
        })
        // onSnapshot will fire again with the new doc
      }
    })

    return unsubscribe
  }, [user])

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    await userService.create(result.user.uid, { email, displayName })
    return result
  }

  const logout = () => {
    return signOut(auth)
  }

  const value = { user, loading, userProfile, profileLoading, login, register, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
