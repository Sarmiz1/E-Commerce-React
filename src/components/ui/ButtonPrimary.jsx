function ButtonPrimary({text, className}){

  return(
    <button className={`place-order-button button-primary 
        bg-greenPry text-white text-sm cursor-pointer
        shadow-3xl hover:outline hover:outline-2 hover:border-solid
        active:bg-greenPryTrans active:border-transparent active:shadow-none
        ${className}`}>
        {text}
    </button>
  )
}

export default ButtonPrimary