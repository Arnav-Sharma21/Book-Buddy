import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getBookQuotes,
  addQuote,
  deleteQuote,
} from '../services/firestoreQuotes'
import { toast } from 'react-toastify'

export function useQuotes(bookId) {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchQuotes = async () => {
    if (!bookId || !user) return
    setLoading(true)
    try {
      const data = await getBookQuotes(user.uid, bookId)
      // Sort oldest first so pages read naturally
      setQuotes(data.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds))
    } catch {
      toast.error('Could not load quotes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [bookId, user])

  const handleAddQuote = async (data) => {
    try {
      await addQuote(user.uid, bookId, data)
      toast.success('Quote saved! ✨')
      await fetchQuotes()
    } catch {
      toast.error('Failed to save quote.')
    }
  }

  const handleDeleteQuote = async (quoteId) => {
    try {
      await deleteQuote(quoteId)
      toast.success('Quote removed.')
      await fetchQuotes()
    } catch {
      toast.error('Failed to delete quote.')
    }
  }

  return {
    quotes,
    loading,
    fetchQuotes,
    handleAddQuote,
    handleDeleteQuote,
  }
}