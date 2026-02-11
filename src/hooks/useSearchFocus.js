import { useEffect } from "react";

const useSearchFocus = (ref) => {

  useEffect(() => {
    ref.current.focus()
    
  },[])

}


export default useSearchFocus