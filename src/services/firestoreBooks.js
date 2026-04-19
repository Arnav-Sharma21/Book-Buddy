import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const booksCol = collection(db, 'books')

export const addBook = (userId, data) =>
  addDoc(booksCol, {
    ...data,
    userId,
    currentPage: 0,
    rating: 0,
    review: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const getUserBooks = async (userId) => {
  const q = query(booksCol, where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const updateBook = (bookId, data) =>
  updateDoc(doc(db, 'books', bookId), {
    ...data,
    updatedAt: serverTimestamp(),
  })

export const deleteBook = (bookId) =>
  deleteDoc(doc(db, 'books', bookId))