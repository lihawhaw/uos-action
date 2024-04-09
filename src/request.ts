import fetch, {Response} from 'node-fetch'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: string | FormData
  nonStandardResult?: boolean
}

interface RequestConfig {
  baseUrl?: string
  defaultHeaders?: () => Record<string, string>
}

class CustomRequestError extends Error {
  constructor(message: string) {
    super(`${message}`)
    this.name = 'CustomRequestError'
  }
}

export class CustomRequest {
  private baseUrl: string | undefined
  private defaultHeaders: () => Record<string, string>

  constructor(config?: RequestConfig) {
    this.baseUrl = config?.baseUrl
    this.defaultHeaders = config?.defaultHeaders || (() => ({}))
  }

  private buildUrl(url: string): URL {
    return new URL(url, this.baseUrl)
  }

  private buildHeaders(config?: RequestOptions): Record<string, string> {
    return {...this.defaultHeaders(), ...config?.headers}
  }

  private async handleResponse<T>(response: Response, options?: { useNonStandardResult?: boolean }): Promise<T> {
    const {useNonStandardResult} = options || {}

    if (useNonStandardResult) {
      return (await response.json()) as any
    }

    const result = (await response.json()) as { code: number; data: any; message?: string }

    if (response.ok) {
      if (result.code === 0) {
        return result.data
      } else {
        throw new CustomRequestError(result.message || result.data)
      }
    } else {
      throw new CustomRequestError(`${response.status}`)
    }
  }

  private async handleError(error: any): Promise<never> {
    throw error
  }

  private async makeRequest<T = unknown>(
    url: string,
    method: HttpMethod,
    params?: object,
    config?: RequestOptions,
  ): Promise<T> {
    const fullUrl = this.buildUrl(url)
    const options: RequestOptions = {method, headers: this.buildHeaders(config), body: undefined}

    if (params && method === 'GET') {
      const keys = Object.keys(params)
      // @ts-ignore
      for (const key of keys) fullUrl.searchParams.append(key, String(params[key]))
    }

    if (['POST', 'PUT'].includes(method)) options.body = JSON.stringify(params)

    const response = await fetch(fullUrl.toString(), options)
    return this.handleResponse<T>(response, {useNonStandardResult: config?.nonStandardResult})
  }

  private async performRequest<T = unknown>(
    url: string,
    method: HttpMethod,
    params?: object,
    config?: RequestOptions,
  ): Promise<T> {
    try {
      return await this.makeRequest(url, method, params, config)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async get<T = unknown>(url: string, params?: object, config?: RequestOptions): Promise<T> {
    return this.performRequest<T>(url, 'GET', params, config)
  }

  async post<T = unknown>(url: string, params?: object, config?: RequestOptions): Promise<T> {
    return this.performRequest<T>(url, 'POST', params, config)
  }

  async put<T = unknown>(url: string, params?: object, config?: RequestOptions): Promise<T> {
    return this.performRequest<T>(url, 'PUT', params, config)
  }

  async delete<T = unknown>(url: string, params?: object, config?: RequestOptions): Promise<T> {
    return this.performRequest<T>(url, 'DELETE', params, config)
  }

  async uploadFile(url: string, file: File, params?: FormData, config?: RequestOptions): Promise<void> {
    try {
      const fullUrl = this.buildUrl(url)
      const formData = new FormData()
      formData.append('file', file)

      if (params) {
        const keys = Object.keys(params)
        // @ts-ignore
        for (const key of keys) formData.append(key, String(params[key]))
      }

      const options: RequestOptions = {method: 'POST', headers: this.buildHeaders(config), body: formData}
      const response = await fetch(fullUrl.toString(), options)

      if (!response.ok) throw new CustomRequestError(`${response.status}`)
    } catch (error: any) {
      throw new CustomRequestError(`${error?.message || error}`)
    }
  }
}

export const request = new CustomRequest()
