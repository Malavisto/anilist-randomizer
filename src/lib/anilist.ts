interface AnimeMedia {
  id: number
  title: {
    english: string | null
    romaji: string
  }
  episodes: number | null
  format: string
  status: string
  genres: string[]
  description: string | null
  averageScore: number | null
  seasonYear: number | null
  coverImage: {
    medium: string
    large: string
    extraLarge: string
  } | null
}

export interface AnimeEntry {
  media: AnimeMedia
  status: string
  score: number | null
}

interface AnimeList {
  entries: AnimeEntry[]
}

interface MediaListCollection {
  lists: AnimeList[]
}

interface AniListResponse {
  data?: {
    MediaListCollection: MediaListCollection | null
  }
  errors?: Array<{ message: string }>
}

export const fetchRandomAnime = async (
  username: string,
  fetcher: typeof fetch = fetch,
  random: () => number = Math.random,
): Promise<AnimeEntry> => {
  const query = `
    query ($username: String) {
      MediaListCollection(userName: $username, type: ANIME) {
        lists {
          entries {
            media {
              id
              title {
                english
                romaji
              }
              episodes
              format
              status
              genres
              description
              averageScore
              seasonYear
              coverImage {
                medium
                large
                extraLarge
              }
            }
            status
            score
          }
        }
      }
    }
  `

  const variables = { username: username.trim() }

  try {
    const response = await fetcher('https://graphql.anilist.co', {
      method: 'POST',
      signal: AbortSignal.timeout(15_000),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(response.status === 429
        ? 'AniList rate limit reached. Please wait a minute and try again.'
        : `AniList request failed (${response.status}). Please try again later.`)
    }

    const data: AniListResponse = await response.json()

    if (data.errors?.length) {
      throw new Error(data.errors[0].message)
    }

    const lists = data.data?.MediaListCollection?.lists
    if (!lists || lists.length === 0) {
      throw new Error(`No anime list found for username: ${username}`)
    }

    // Custom lists can repeat anime from the user's regular lists.
    const uniqueEntries = new Map<number, AnimeEntry>()
    for (const list of lists) {
      for (const entry of list.entries) {
        if (entry.media?.id) uniqueEntries.set(entry.media.id, entry)
      }
    }
    const allEntries = [...uniqueEntries.values()]
    if (allEntries.length === 0) {
      throw new Error('No anime found in list')
    }

    return allEntries[Math.floor(random() * allEntries.length)]
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('AniList took too long to respond. Please try again.')
    }
    throw new Error(`Error fetching anime: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
