export const useLocalStorage = (storageName,data) => {

  const storedData = JSON.parse(localStorage.getItem(storageName)) || []

    
  localStorage.setItem(storageName, JSON.stringify(data))

  return storedData

} 



export const useLocalStorageObject = (storageName,data) => {

  const storedData = JSON.parse(localStorage.getItem(storageName)) || null

    
  localStorage.setItem(storageName, JSON.stringify(data))

  return storedData

} 