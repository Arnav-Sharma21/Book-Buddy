/**
 * recommendationsApi.js
 *
 * Fetches live book recommendations from the Open Library Search API
 * based on genres/subjects derived from the user's library.
 *
 * No hardcoded book lists — everything comes from the API.
 */

const OL_SEARCH = 'https://openlibrary.org/search.json'

/**
 * Given a list of subject/genre strings, fetches recommended books
 * from Open Library. Deduplicates against titles the user already has.
 *
 * @param {string[]} subjects  - e.g. ['fantasy', 'mystery', 'science fiction']
 * @param {Set<string>} ownedTitles - lowercase titles the user already has
 * @param {number} limit       - max results to return (default 8)
 * @returns {Promise<Array>}   - array of {title, author, coverUrl, subjects, olKey}
 */
export async function fetchRecommendations(subjects, ownedTitles = new Set(), limit = 8) {
  if (!subjects || subjects.length === 0) return []

  // Query each top genre, then merge + deduplicate
  const seen = new Set([...ownedTitles])
  const results = []

  // Try genres in order of preference, stop once we have enough
  for (const subject of subjects.slice(0, 4)) {
    if (results.length >= limit) break
    try {
      const url = `${OL_SEARCH}?subject=${encodeURIComponent(subject)}&fields=title,author_name,cover_i,subject,key&limit=12&sort=editions`
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()

      for (const doc of (data.docs || [])) {
        if (results.length >= limit) break
        const title = doc.title?.trim()
        if (!title) continue
        const key = title.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)

        results.push({
          title,
          author: doc.author_name?.[0] || 'Unknown',
          coverUrl: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : null,
          subjects: (doc.subject || []).slice(0, 4),
          olKey: doc.key || '',
          matchedGenre: subject,
        })
      }
    } catch {
      // silently skip failed subjects
    }
  }

  return results
}

/**
 * Extracts a ranked list of genres/subjects from the user's books.
 * Prioritises books they are currently reading or want to read,
 * then finished books with high ratings.
 *
 * @param {Array} books - user's library books from Firestore
 * @returns {string[]}  - up to 5 genre/subject strings
 */
export function deriveGenresFromLibrary(books) {
  const scoreMap = {}

  for (const book of books) {
    // Weight: reading = 4, want = 3, finished+rated ≥4 = 2, finished = 1
    let weight = 0
    if (book.status === 'reading')        weight = 4
    else if (book.status === 'want')      weight = 3
    else if (book.status === 'finished')  weight = book.rating >= 4 ? 2 : 1

    if (weight === 0) continue

    for (const g of (book.genres || [])) {
      const key = g.trim().toLowerCase()
      if (!key) continue
      scoreMap[key] = (scoreMap[key] || 0) + weight
    }
  }

  return Object.entries(scoreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre)
}
