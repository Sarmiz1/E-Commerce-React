function ProgressLevel({level, isActive}) {

  return(
    <div className={`progress-label mb-1 ${isActive? 'text-greenPry' : ''}`}>
      {level}
    </div>
  )
}

export default ProgressLevel