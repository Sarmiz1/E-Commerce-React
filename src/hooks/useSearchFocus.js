import { useEffect } from "react";

const useSearchFocus = (ref) => {

  useEffect(() => {
    ref.current.focus()
    
  },[ref])

}


export default useSearchFocus