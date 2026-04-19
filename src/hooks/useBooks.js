import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getUserBooks,
  addBook,
  updateBook,
  deleteBook,
} from '../services/firestoreBooks'
import { toast } from 'react-toastify'

export function useBooks() {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const data = await getUserBooks(user.uid)
      setBooks(data)
    } catch (err) {
      toast.error('Could not load books.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchBooks()
  }, [user])

  const handleAddBook = async (data) => {
    try {
      await addBook(user.uid, data)
      toast.success(`"${data.title}" added! 📖`)
      await fetchBooks()
    } catch {
      toast.error('Failed to add book.')
    }
  }

  const handleUpdateBook = async (bookId, data) => {
    try {
      await updateBook(bookId, data)
      toast.success('Book updated!')
      await fetchBooks()
    } catch {
      toast.error('Failed to update book.')
    }
  }

  const handleDeleteBook = async (bookId) => {
    try {
      await deleteBook(bookId)
      toast.success('Book removed.')
      await fetchBooks()
    } catch {
      toast.error('Failed to delete book.')
    }
  }

  return {
    books,
    loading,
    fetchBooks,
    handleAddBook,
    handleUpdateBook,
    handleDeleteBook,
  }
}