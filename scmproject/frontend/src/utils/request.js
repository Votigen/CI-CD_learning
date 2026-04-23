// src/utils/request.js
import { BASE_URL, TIMEOUT } from '@/api/config'

class Request {
    constructor(baseURL, timeout) {
        this.baseURL = baseURL
        this.timeout = timeout
    }

    async request(config) {
        const { url, method = 'GET', data = {}, headers = {} } = config

        // 从 localStorage 直接获取 token，避免在非组件环境使用 Pinia
        const token = localStorage.getItem('access_token')

        // 设置认证头
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        return new Promise((resolve, reject) => {
            fetch(`${this.baseURL}${url}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: method !== 'GET' ? JSON.stringify(data) : undefined,
            })
                .then(async response => {
                    const result = await response.json()

                    if (response.ok) {
                        resolve(result)
                    } else {
                        // 如果是 401 未授权错误，清除 token 并跳转到登录页
                        if (response.status === 401) {
                            localStorage.removeItem('access_token')
                            window.location.href = '/login'
                        }
                        reject({
                            status: response.status,
                            message: result.message || '请求失败'
                        })
                    }
                })
                .catch(error => {
                    reject({
                        status: 0,
                        message: error.message || '网络错误'
                    })
                })
        })
    }

    get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString()
        const fullUrl = queryString ? `${url}?${queryString}` : url
        return this.request({ url: fullUrl, method: 'GET' })
    }

    post(url, data = {}) {
        return this.request({ url, method: 'POST', data })
    }

    put(url, data = {}) {
        return this.request({ url, method: 'PUT', data })
    }

    delete(url) {
        return this.request({ url, method: 'DELETE' })
    }
}

const request = new Request(BASE_URL, TIMEOUT)
export default request