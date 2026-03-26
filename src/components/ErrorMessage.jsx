
export const ErrorMessage = ({ errorMessage }) => {
  {
    errorMessage &&
    <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
  }
}
