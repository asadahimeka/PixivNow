import localforage from 'localforage'

interface DataItem {
  expires:  number
  data: any
}

class LocalDB {

  _drive = localforage

  async get(key: string, def?: any) {
    console.log('%c - db get: ' + key, 'color:blueviolet')
    let result = await this._drive.getItem<DataItem>(key)
    if (result) {

      if (Math.floor(+new Date() / 1000) >= result.expires && result.expires !== -1) {
        result.data = def
        this.remove(key)
      }

      return result.data

    } else {
      return def
    }
  }

  async set(key: string, val: any, expires = -1) {
    console.log('%c - db set: ' + key, 'color:deeppink')
    try {
      if (val === undefined) {
        await this.remove(key)
        return
      }

      if (typeof expires === 'number' && expires >= 0) {
        expires = Math.floor(+new Date() / 1000) + expires
      } else {
        expires = -1
      }

      let data: DataItem = {
        data: val,
        expires
      }

      await this._drive.setItem(key, data)

    } catch (error) {
      console.log('db error:', error);
    }
  }

  async remove(key: string) {
    return this._drive.removeItem(key)
  }

  async clear() {
    return this._drive.clear()
  }

  async size() {
    return this._drive.length()
  }
}

const localDb = new LocalDB()
export default localDb
