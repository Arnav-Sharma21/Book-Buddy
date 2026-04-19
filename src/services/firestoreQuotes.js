import {
  collection, addDoc, deleteDoc, doc,
  getDocs, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const quotesCol = collection(db, 'quotes')

export const addQuote = (userId, bookId, data) =>
  addDoc(quotesCol, {
    ...data,
    userId,
    bookId,
    stickers: data.stickers || [],
    createdAt: serverTimestamp(),
  })

export const getBookQuotes = async (userId, bookId) => {
  const q = query(
    quotesCol,
    where('userId', '==', userId),
    where('bookId', '==', bookId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const deleteQuote = (quoteId) =>
  deleteDoc(doc(db, 'quotes', quoteId))