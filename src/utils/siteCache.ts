import localDb from "./localDb"

const _siteCacheData = new Map<string | number, any>()

export async function setCache(key: string | number, val: any, expires = 60 * 60 * 24) {
  console.log('setCache', key, val)
  _siteCacheData.set(key, val)
  await localDb.set(key.toString(), val, expires)
}

export async function getCache(key: string | number) {
  let val = _siteCacheData.get(key)
  if (!val) val = await localDb.get(key.toString())
  console.log('getCache', key, val)
  return val
}
