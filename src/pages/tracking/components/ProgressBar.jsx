function ProgressBar({progress}) {

  return(
    <div className="progress-bar-container h-6 w-full border border-solid 
      border-borderColor rounded-[50px] overflow-hidden">
      <div className={`progress-bar h-full bg-greenPry rounded-[50px]
      w-[${progress}%]`}></div>
    </div>
  )
}

export default ProgressBar