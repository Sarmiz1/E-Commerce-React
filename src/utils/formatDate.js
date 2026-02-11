import dayjs from "dayjs";

export const formatDate = (ms) => {
  const formattedDate = dayjs(ms).format ('ddd, MMM D')

  return formattedDate
}


export const formatDateMonthDay = (ms) => {
  const formattedDate = dayjs(ms).format ('MMM D')

  return formattedDate
}