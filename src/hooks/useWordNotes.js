import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getBookWords,
  addWordNote,
  deleteWordNote,
} from '../services/firestoreWords'
import { toast } from 'react-toastify'

export function useWordNotes(bookId) {
  const { user } = useAuth()
  const [wordNotes, setWordNotes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWordNotes = async () => {
    if (!bookId || !user) return
    setLoading(true)
    try {
      const data = await getBookWords(user.uid, bookId)
      setWordNotes(data.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)))
    } catch (err) {
      console.error(err)
      toast.error('Word notes error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWordNotes()
  }, [bookId, user])

  const handleAddWordNote = async (data) => {
    try {
      await addWordNote(user.uid, bookId, data)
      toast.success(`"${data.word}" saved to notebook! 📓`)
      await fetchWordNotes()
    } catch {
      toast.error('Could not save word note.')
    }
  }

  const handleDeleteWordNote = async (wordId) => {
    try {
      await deleteWordNote(wordId)
      toast.success('Word note removed.')
      await fetchWordNotes()
    } catch {
      toast.error('Failed to delete word note.')
    }
  }

  return {
    wordNotes,
    loading,
    fetchWordNotes,
    handleAddWordNote,
    handleDeleteWordNote,
  }
}