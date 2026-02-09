import dayjs from "dayjs";

export const formatDate = (ms) => {
  const formattedDate = dayjs(ms).format ('ddd, MMM D')

  return formattedDate
}