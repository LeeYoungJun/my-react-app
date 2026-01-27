export const calculateMM = (value) => {
  if (!value || value <= 0) return 0
  return Math.round((value / 143.5) * 100) / 100
}

export const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
