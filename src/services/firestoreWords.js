import {
  collection, addDoc, deleteDoc, doc,
  getDocs, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const wordsCol = collection(db, 'wordNotes')

export const addWordNote = (userId, bookId, data) =>
  addDoc(wordsCol, {
    ...data,
    userId,
    bookId,
    createdAt: serverTimestamp(),
  })

export const getBookWords = async (userId, bookId) => {
  const q = query(
    wordsCol,
    where('userId', '==', userId),
    where('bookId', '==', bookId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const deleteWordNote = (wordId) =>
  deleteDoc(doc(db, 'wordNotes', wordId))