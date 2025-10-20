import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.resolve(__dirname, 'data', 'reviews.json')

let cache = null
let lastLoaded = 0
const CACHE_TTL_MS = 10 * 1000

async function ensureFile() {
  try {
    await fs.access(DATA_PATH)
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
    await fs.writeFile(DATA_PATH, '[]', 'utf8')
  }
}

async function loadAll(force = false) {
  await ensureFile()
  if (!force && cache && Date.now() - lastLoaded < CACHE_TTL_MS) {
    return cache
  }
  const raw = await fs.readFile(DATA_PATH, 'utf8')
  try {
    cache = JSON.parse(raw)
  } catch {
    cache = []
  }
  lastLoaded = Date.now()
  return cache
}

async function persist(all) {
  cache = all
  lastLoaded = Date.now()
  await fs.writeFile(DATA_PATH, JSON.stringify(all, null, 2), 'utf8')
}

export async function listReviews(menuId = null) {
  const all = await loadAll()
  if (!menuId) return all.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return all
    .filter((r) => r.menuId === menuId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function addReview(review) {
  const all = await loadAll()
  all.push(review)
  await persist(all)
  return review
}

export async function clearCache() {
  cache = null
  lastLoaded = 0
}
