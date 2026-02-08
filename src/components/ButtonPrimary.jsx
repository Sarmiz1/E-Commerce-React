function ButtonPrimary({text, className, children}){

  return(
    <button className={`place-order-button button-primary 
        bg-greenPry text-white text-sm cursor-pointer
        shadow-3xl hover:outline hover:outline-2 hover:border-solid p-4
        active:bg-greenPryTrans active:border-transparent active:shadow-none
        ${className}`}>
        {children}
        {text}
    </button>
  )
}

export default ButtonPrimary
