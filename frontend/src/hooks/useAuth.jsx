import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Load profile from Firestore
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (profileDoc.exists()) {
          setProfile(profileDoc.data())
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (email, password, name) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })

    // Create initial Firestore profile
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      name,
      email,
      createdAt: serverTimestamp(),
      // Profile fields — filled in onboarding
      age: null,
      gender: null,
      dietaryPreference: null,
      allergies: [],
      healthConditions: [],
    })

    return credential.user
  }

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const updateUserProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated')
    await setDoc(doc(db, 'users', user.uid), updates, { merge: true })
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  const refreshProfile = async () => {
    if (!user) return
    const profileDoc = await getDoc(doc(db, 'users', user.uid))
    if (profileDoc.exists()) setProfile(profileDoc.data())
  }

  const value = {
    user,
    profile,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    refreshProfile,
    isAuthenticated: !!user,
    hasProfile: !!profile?.dietaryPreference,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
