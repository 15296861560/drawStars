const db = {
  local: {
    save(key, value) {
      localStorage.setItem(key, JSON.stringify(value))
    },
    get(key, defaultValue = '') {
      return JSON.parse(localStorage.getItem(key)) || defaultValue
    },
    remove(key) {
      localStorage.removeItem(key)
    },
    clear() {
      localStorage.clear()
    }
  },
  session: {
    save(key, value) {
      sessionStorage.setItem(key, JSON.stringify(value))
    },
    get(key, defaultValue = '') {
      return JSON.parse(sessionStorage.getItem(key)) || defaultValue
    },
    remove(key) {
      sessionStorage.removeItem(key)
    },
    clear() {
      sessionStorage.clear()
    }
  }
}

export default db
