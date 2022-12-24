/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 23:56:05
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 14:19:50
 */
const storage = {
  local: {
    save(key:string, value:string) {
      localStorage.setItem(key, JSON.stringify(value))
    },
    get(key:string, defaultValue:string = '') {
      return JSON.parse(localStorage.getItem(key)) || defaultValue
    },
    remove(key:string) {
      localStorage.removeItem(key)
    },
    clear() {
      localStorage.clear()
    }
  },
  session: {
    save(key:string, value:string) {
      sessionStorage.setItem(key, JSON.stringify(value))
    },
    get(key:string, defaultValue:string = '') {
      return JSON.parse(sessionStorage.getItem(key)) || defaultValue
    },
    remove(key:string) {
      sessionStorage.removeItem(key)
    },
    clear() {
      sessionStorage.clear()
    }
  }
}

export default storage
