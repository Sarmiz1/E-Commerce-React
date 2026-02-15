export const localStorageStore = (storageName = 'data', data) => {

  let storedData = []

  if (data.length > 0) {
    storedData = JSON.parse(localStorage.getItem(storageName)) || []


    localStorage.setItem(storageName, JSON.stringify(data))

  }

  return storedData

}



export const localStorageStoreObject = (storageName = 'data', data) => {

  let storedData = null

  if (data !== undefined) {
    storedData = JSON.parse(localStorage.getItem(storageName)) || []


    localStorage.setItem(storageName, JSON.stringify(data))

  }

  return storedData

} 