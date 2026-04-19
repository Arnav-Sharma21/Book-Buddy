import axios from 'axios'

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en'

export const fetchDefinition = async (word) => {
  const { data } = await axios.get(`${BASE_URL}/${encodeURIComponent(word)}`)
  const entry = data[0]
  const meanings = entry.meanings.flatMap((m) =>
    m.definitions.slice(0, 2).map((d) => ({
      partOfSpeech: m.partOfSpeech,
      definition: d.definition,
      example: d.example || '',
    }))
  )
  return { word: entry.word, phonetic: entry.phonetic || '', meanings }
}