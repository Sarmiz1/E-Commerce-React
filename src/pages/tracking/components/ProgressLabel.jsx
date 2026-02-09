import ProgressLevel from "./ProgressLevel"

function ProgressLabel({progress}) {



  return (
    <div className="progress-labels-container flex justify-between
      font-medium text-[20px] mb-4">
      <ProgressLevel level={'Preparing'} 
      isActive={progress? progress < 50? true : false : false}/>

      <ProgressLevel level={'Shipped'} 
      isActive={progress? progress >= 50 && progress < 100 ? true: false :false}/>

      <ProgressLevel level={'Delivered'} 
      isActive={progress? progress === 100 ? true: false : false}/>
    </div>
  )
}

export default ProgressLabel