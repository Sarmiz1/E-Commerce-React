export const useSessionStorage = (storageName = 'data', data) => {

  let storedData = []

  if (data.length > 0) {
    storedData = JSON.parse(sessionStorage.getItem(storageName)) || []

    
  sessionStorage.setItem(storageName, JSON.stringify(data))

  }

  return storedData

} 