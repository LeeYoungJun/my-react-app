import * as XLSX from 'xlsx'
import { MONTH_COLUMNS } from './constants'
import { calculateMM } from './utils'

export function exportToExcel(subitemStats, boardName) {
  const subitemNames = Object.keys(subitemStats).sort()

  // 헤더 행 생성
  const header1 = ['No', '이름', '아이템']
  const header2 = ['', '', '']
  MONTH_COLUMNS.forEach((month) => {
    header1.push(month, '', '')
    header2.push('아이템별', '시간', 'M/M')
  })
  header1.push('합계')
  header2.push('시간')

  // 데이터 행 생성
  const dataRows = subitemNames.map((name, index) => {
    const personStats = subitemStats[name]
    const total = MONTH_COLUMNS.reduce(
      (sum, month) => sum + personStats.months[month],
      0
    )
    const itemList = Array.from(personStats.items)
    const itemListStr = itemList.join(', ')

    const row = [index + 1, name, itemListStr]
    MONTH_COLUMNS.forEach((month) => {
      const value = personStats.months[month]
      const mm = calculateMM(value)
      const itemHours = itemList
        .map((itemName) => personStats.itemMonths[itemName]?.[month] || 0)
        .join(', ')
      row.push(itemHours, value > 0 ? value : 0, mm > 0 ? mm : 0)
    })
    row.push(total > 0 ? total : 0)

    return row
  })

  // 워크시트 생성
  const wsData = [header1, header2, ...dataRows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // 셀 병합 (월별 헤더)
  const merges = []
  let colIdx = 3
  MONTH_COLUMNS.forEach(() => {
    merges.push({ s: { r: 0, c: colIdx }, e: { r: 0, c: colIdx + 2 } })
    colIdx += 3
  })
  ws['!merges'] = merges

  // 열 너비 설정
  ws['!cols'] = [
    { wch: 5 }, // No
    { wch: 15 }, // 이름
    { wch: 40 }, // 아이템
    ...MONTH_COLUMNS.flatMap(() => [{ wch: 10 }, { wch: 8 }, { wch: 8 }]),
    { wch: 10 }, // 합계
  ]

  // 워크북 생성 및 다운로드
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '월별 작업 시간')

  const today = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `${boardName}_${today}.xlsx`)
}
