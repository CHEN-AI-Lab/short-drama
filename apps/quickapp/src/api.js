const BASE_URL = 'https://short-drama-iota.vercel.app'

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    fetch.fetch({
      url: BASE_URL + path,
      method: options.method || 'GET',
      header: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      success: (res) => {
        try {
          resolve(JSON.parse(res.data))
        } catch (e) {
          resolve(res.data)
        }
      },
      fail: (err) => reject(err),
    })
  })
}

export function generateDrama(params) {
  return request('/api/generate', {
    method: 'POST',
    body: params,
  })
}

export function checkSession() {
  return request('/api/user/session')
}

export function signIn(email, password) {
  return request('/api/auth/signin', {
    method: 'POST',
    body: { email, password },
  })
}

export function signUp(email, password) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: { email, password },
  })
}