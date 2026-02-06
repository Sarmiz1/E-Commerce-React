import ButtonPrimary from "../../../../components/ui/ButtonPrimary"

function AddToCart() {

  return(
    <>
      <div className="added-to-cart text-greenPry text-base flex items-center mb-2 opacity-0">
        <img 
          className="h-5 mr-[6px]"
          src="images/icons/checkmark.png"/>
        Added
      </div>

      <ButtonPrimary 
      text={'Add to Cart'}
      className={`text-base w-full mt-[1px]  border border-solid rounded-md 
        [box-shadow: 0 2px 5px rgba(220, 220, 220, 0.5)] 
        hover:bg-greenPy/75 hover:border hover:border-solid
        hover:border-transparent`}
      />
    </>
  )
}

export default AddToCart