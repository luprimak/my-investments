interface QueueItem {
  url: string
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}

const MAX_CONCURRENT = 3
const MIN_INTERVAL_MS = 200
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

let activeRequests = 0
let lastRequestTime = 0
const queue: QueueItem[] = []

function processQueue(): void {
  while (queue.length > 0 && activeRequests < MAX_CONCURRENT) {
    const item = queue.shift()
    if (!item) break

    const now = Date.now()
    const elapsed = now - lastRequestTime
    const delay = Math.max(0, MIN_INTERVAL_MS - elapsed)

    activeRequests++
    lastRequestTime = now + delay

    setTimeout(() => {
      executeFetch(item.url)
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          activeRequests--
          processQueue()
        })
    }, delay)
  }
}

async function executeFetch(url: string, attempt = 0): Promise<unknown> {
  try {
    const response = await fetch(url)

    if (response.status === 429 || response.status >= 500) {
      if (attempt < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
        await new Promise(r => setTimeout(r, backoff))
        return executeFetch(url, attempt + 1)
      }
    }

    if (!response.ok) {
      throw new Error(`MOEX API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    if (attempt < MAX_RETRIES && error instanceof TypeError) {
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
      await new Promise(r => setTimeout(r, backoff))
      return executeFetch(url, attempt + 1)
    }
    throw error
  }
}

export async function moexGet<T = unknown>(url: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push({ url, resolve: resolve as (value: unknown) => void, reject })
    processQueue()
  })
}

export function resetClient(): void {
  queue.length = 0
  activeRequests = 0
  lastRequestTime = 0
}
