import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchRandomAnime, type AnimeEntry } from '../src/lib/anilist.ts'

function entry(id: number): AnimeEntry {
  return { media: { id, title: { english: null, romaji: `Anime ${id}` }, episodes: null,
    format: 'TV', status: 'FINISHED', genres: [], description: null, averageScore: null,
    seasonYear: null, coverImage: null }, status: 'PLANNING', score: null }
}

function reply(body: unknown, status = 200): typeof fetch {
  return async () => new Response(JSON.stringify(body), { status })
}

const collection = (entries: AnimeEntry[]) => ({ data: { MediaListCollection: { lists: [{ entries }] } } })

test('each anime has one chance even when included in custom lists', async () => {
  const result = await fetchRandomAnime('user', reply(collection([entry(1), entry(1), entry(2)])), () => 0.5)
  assert.equal(result.media.id, 2)
})

test('trims usernames before sending the GraphQL request', async () => {
  const fetcher: typeof fetch = async (_url, init) => {
    assert.equal(JSON.parse(String(init?.body)).variables.username, 'user')
    assert.ok(init?.signal)
    return new Response(JSON.stringify(collection([entry(1)])))
  }
  await fetchRandomAnime('  user  ', fetcher)
})

test('reports HTTP failures even if the response is not JSON', async () => {
  await assert.rejects(fetchRandomAnime('user', async () => new Response('Unavailable', { status: 503 })), /503/)
})

test('reports rate limiting clearly', async () => {
  await assert.rejects(fetchRandomAnime('user', reply({}, 429)), /rate limit/i)
})

test('preserves GraphQL error messages', async () => {
  await assert.rejects(fetchRandomAnime('user', reply({ errors: [{ message: 'User not found' }] })), /User not found/)
})

test('handles empty error arrays and missing data', async () => {
  await assert.rejects(fetchRandomAnime('user', reply({ errors: [] })), /No anime list found/)
})

test('handles empty anime lists', async () => {
  await assert.rejects(fetchRandomAnime('user', reply(collection([]))), /No anime found/)
})

test('handles null media entries without selecting them', async () => {
  const body = collection([entry(1)])
  body.data.MediaListCollection.lists[0].entries.unshift({ media: null } as unknown as AnimeEntry)
  assert.equal((await fetchRandomAnime('user', reply(body), () => 0)).media.id, 1)
})
