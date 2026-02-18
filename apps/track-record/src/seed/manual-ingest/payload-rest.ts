interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH'
  path: string
  token?: string
  query?: Record<string, unknown>
  body?: Record<string, unknown>
}

function appendQuery(
  params: URLSearchParams,
  key: string,
  value: unknown,
): void {
  if (value === undefined || value === null) return

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      appendQuery(params, `${key}[${i}]`, value[i])
    }
    return
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const [childKey, childValue] of Object.entries(obj)) {
      appendQuery(params, `${key}[${childKey}]`, childValue)
    }
    return
  }

  params.append(key, String(value))
}

function buildQueryString(query?: Record<string, unknown>): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    appendQuery(params, key, value)
  }
  const str = params.toString()
  return str.length > 0 ? `?${str}` : ''
}

export class PayloadRESTClient {
  readonly baseURL: string
  private token?: string

  constructor(baseURL: string, token?: string) {
    this.baseURL = baseURL.replace(/\/$/, '')
    this.token = token
  }

  setToken(token: string): void {
    this.token = token
  }

  async login(email: string, password: string): Promise<string> {
    const result = await this.request<{ token: string }>({
      method: 'POST',
      path: '/api/users/login',
      body: { email, password },
      token: undefined,
    })

    if (!result.token) {
      throw new Error('Login succeeded but no token was returned by Payload.')
    }

    this.token = result.token
    return result.token
  }

  async find<T = Record<string, unknown>>(args: {
    collection: string
    where?: Record<string, unknown>
    limit?: number
    depth?: number
    sort?: string
  }): Promise<{ docs: T[]; totalDocs: number }> {
    const result = await this.request<{ docs: T[]; totalDocs: number }>({
      method: 'GET',
      path: `/api/${args.collection}`,
      query: {
        where: args.where,
        limit: args.limit ?? 1,
        depth: args.depth ?? 0,
        sort: args.sort,
      },
    })

    return {
      docs: Array.isArray(result.docs) ? result.docs : [],
      totalDocs: typeof result.totalDocs === 'number' ? result.totalDocs : 0,
    }
  }

  async create<T = Record<string, unknown>>(collection: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>({
      method: 'POST',
      path: `/api/${collection}`,
      body: data,
    })
  }

  async update<T = Record<string, unknown>>(
    collection: string,
    id: number,
    data: Record<string, unknown>,
  ): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      path: `/api/${collection}/${id}`,
      body: data,
    })
  }

  private async request<T>(options: RequestOptions): Promise<T> {
    const token = options.token ?? this.token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const query = buildQueryString(options.query)
    const response = await fetch(`${this.baseURL}${options.path}${query}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const text = await response.text()
    const payload = text ? safeJSONParse(text) : {}

    if (!response.ok) {
      throw new Error(
        `Payload request failed (${options.method} ${options.path}): ${response.status} ${response.statusText} - ${text}`,
      )
    }

    return payload as T
  }
}

function safeJSONParse(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return { raw: value }
  }
}
