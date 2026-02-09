export const useLocalStorage = (data) => {

  const storedData = JSON.parse(localStorage.getItem('data'))

    
  localStorage.setItem('data', JSON.stringify(data))

  return storedData

} 