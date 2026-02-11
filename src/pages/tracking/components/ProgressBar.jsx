function ProgressBar({ progress }) {
  return (
    <div
      className=" h-6 w-full border border-solid  mb-10
      border-borderColor rounded-[50px] overflow-hidden"
    >
      <div
        className={`progress-bar h-full bg-greenPry rounded-[50px]
      ${progress < 50 ? "w-1/5" : progress < 100 ? "w-2/4" : "w-full"} `}
      ></div>
    </div>
  );
}

export default ProgressBar;
