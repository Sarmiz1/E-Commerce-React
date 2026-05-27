
export const ErrorMessage = ({ errorMessage }) => {
  return (
    errorMessage &&
    <p className="text-red-500 mt-2 text-[15px] text-center">{errorMessage}</p>
  )
}
