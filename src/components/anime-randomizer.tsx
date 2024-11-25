"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import sanitizeHtml from 'sanitize-html'

interface AnimeMedia {
  title: {
    english: string | null
    romaji: string
  }
  episodes: number | null
  format: string
  status: string
  genres: string[]
  description: string | null
  averageScore: number
  seasonYear: number | null
  coverImage: {
    medium: string
    large: string
    extraLarge: string
  } | null
}

interface AnimeEntry {
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
  data: {
    MediaListCollection: MediaListCollection | null
  }
  errors?: Array<{ message: string }>
}

const AnimeRandomizer = () => {
  const [username, setUsername] = useState('')
  const [anime, setAnime] = useState<AnimeEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatDescription = (description: string | null): string => {
    if (!description) return 'No description available.'
    
    return sanitizeHtml(description, {
      allowedTags: [],
      allowedAttributes: {}
    }).replace(/<br\s*\/?>/gi, '\n')
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
  }

  const fetchRandomAnime = async (username: string): Promise<AnimeEntry> => {

    const query = `
      query ($username: String) {
        MediaListCollection(userName: $username, type: ANIME) {
          lists {
            entries {
              media {
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


   const variables = { username }

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      const data: AniListResponse = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      const lists = data.data.MediaListCollection?.lists
      if (!lists || lists.length === 0) {
        throw new Error(`No anime list found for username: ${username}`)
      }

      const allEntries = lists.flatMap((list: AnimeList) => list.entries)
      if (allEntries.length === 0) {
        throw new Error('No anime found in list')
      }

      return allEntries[Math.floor(Math.random() * allEntries.length)]
    } catch (error) {
      throw new Error(`Error fetching anime: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setLoading(true)
    setError('')
    setAnime(null)

    try {
      const result = await fetchRandomAnime(username)
      setAnime(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Random Anime Picker</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-lg p-3 bg-muted/50">
            <div>
              <p className="font-medium mb-1">About This App</p>
              <p>This application uses the AniList GraphQL API but is not affiliated with or endorsed by AniList. 
                 It helps you discover random anime from your list.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter AniList username"
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              Get Random Anime
            </Button>
          </form>

          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}

          {anime && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {anime.media.coverImage?.extraLarge && (
                  <img
                    src={
                      anime.media.coverImage.extraLarge ||
                      anime.media.coverImage.large ||
                      anime.media.coverImage.medium
                    }
                    alt={anime.media.title.english || anime.media.title.romaji}
                    className="w-32 h-auto rounded object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {anime.media.title.english || anime.media.title.romaji}
                  </h2>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>Episodes: {anime.media.episodes || 'N/A'}</div>
                    <div>Format: {anime.media.format || 'N/A'}</div>
                    <div>Your Status: {anime.status}</div>
                    <div>Your Score: {anime.score || 'Not rated'}</div>
                    <div>Average Score: {anime.media.averageScore}%</div>
                    <div>Year: {anime.media.seasonYear || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.media.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {formatDescription(anime.media.description)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



export default AnimeRandomizer