export const calculateMM = (value) => {
  if (!value || value <= 0) return 0
  return Math.round((value / 143.5) * 100) / 100
}

export const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}
