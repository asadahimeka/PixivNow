class MyStorage {

  _drive: Storage = localStorage

  constructor(drive?: Storage) {
    if (drive) this._drive = drive
  }

  get(key: string, def?: any) {
    console.log('%c - storage get: ' + key, 'color:purple')
    let result = this._drive.getItem(key)
    if (result) {
      let data = deserialize(result)

      if (Math.floor(+new Date() / 1000) >= data.expires && data.expires !== -1) {
        data.data = def
        this.remove(key)
      }

      return data.data

    } else {
      return def
    }
  }

  set(key: string, val: any, expires = -1) {
    console.log('%c - storage set: ' + key, 'color:blue')
    try {
      if (val === undefined) {
        return this.remove(key)
      }

      if (typeof expires === 'number' && expires >= 0) {
        expires = Math.floor(+new Date() / 1000) + expires
      } else {
        expires = -1
      }

      let data = {
        data: val,
        expires
      }

      this._drive.setItem(key, serialize(data))
    }
    catch (e) {
      console.log("Local Storage is full, Please empty data");
    }
    return val
  }

  has(key: string) {
    return this.get(key) !== undefined
  }

  remove(key: string) {
    this._drive.removeItem(key)
  }

  clear() {
    this._drive.clear()
  }

  get size() {
    let total = 0;
    for (let x in this._drive) {
      // Value is multiplied by 2 due to data being stored in `utf-16` format, which requires twice the space.
      let amount = (this._drive[x].length * 2);
      if (!isNaN(amount) && Object.prototype.hasOwnProperty.call(this._drive, x)) {
        total += amount;
      }
    }
    return total.toFixed(2);
  }
}

export const LocalStorage = new MyStorage()
export const SessionStorage = new MyStorage(sessionStorage)

function serialize(val: any) {
  return JSON.stringify(val)
}

function deserialize(val: any) {
  if (typeof val !== 'string') {
    return undefined
  }
  try {
    return JSON.parse(val)
  } catch (e) {
    return val || undefined
  }
}
