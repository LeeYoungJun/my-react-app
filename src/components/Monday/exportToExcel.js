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

  // 데이터 행 생성 - 테이블과 동일하게 각 아이템을 별도 행으로
  const dataRows = []
  const rowMerges = [] // No, 이름, 시간, M/M, 합계 병합을 위한 배열

  subitemNames.forEach((name, index) => {
    const personStats = subitemStats[name]
    const total = MONTH_COLUMNS.reduce(
      (sum, month) => sum + personStats.months[month],
      0
    )
    const itemList = Array.from(personStats.items)
    const itemCount = itemList.length

    if (itemCount === 0) {
      // 아이템이 없는 경우
      const row = [index + 1, name, '-']
      MONTH_COLUMNS.forEach((month) => {
        const value = personStats.months[month]
        const mm = calculateMM(value)
        row.push('-', value > 0 ? value : 0, mm > 0 ? mm : 0)
      })
      row.push(total > 0 ? total : 0)
      dataRows.push(row)
    } else {
      // 각 아이템별로 행 생성
      const startRowIdx = dataRows.length + 2 // 헤더 2행 고려

      itemList.forEach((itemName, itemIdx) => {
        const row = []

        if (itemIdx === 0) {
          // 첫 번째 아이템 행: No와 이름 포함
          row.push(index + 1, name, itemName)
        } else {
          // 이후 행: No와 이름은 빈값 (병합될 예정)
          row.push('', '', itemName)
        }

        MONTH_COLUMNS.forEach((month) => {
          const itemHours = personStats.itemMonths[itemName]?.[month] || 0
          if (itemIdx === 0) {
            // 첫 번째 행에만 시간, M/M 표시
            const value = personStats.months[month]
            const mm = calculateMM(value)
            row.push(itemHours, value > 0 ? value : 0, mm > 0 ? mm : 0)
          } else {
            // 이후 행: 아이템별 시간만, 시간/M/M은 빈값
            row.push(itemHours, '', '')
          }
        })

        if (itemIdx === 0) {
          row.push(total > 0 ? total : 0)
        } else {
          row.push('')
        }

        dataRows.push(row)
      })

      // 병합 정보 저장 (아이템이 2개 이상인 경우)
      if (itemCount > 1) {
        const endRowIdx = startRowIdx + itemCount - 1
        // No 열 병합
        rowMerges.push({ s: { r: startRowIdx, c: 0 }, e: { r: endRowIdx, c: 0 } })
        // 이름 열 병합
        rowMerges.push({ s: { r: startRowIdx, c: 1 }, e: { r: endRowIdx, c: 1 } })
        // 각 월의 시간, M/M 열 병합
        MONTH_COLUMNS.forEach((_, monthIdx) => {
          const baseCol = 3 + monthIdx * 3
          // 시간 열 병합
          rowMerges.push({ s: { r: startRowIdx, c: baseCol + 1 }, e: { r: endRowIdx, c: baseCol + 1 } })
          // M/M 열 병합
          rowMerges.push({ s: { r: startRowIdx, c: baseCol + 2 }, e: { r: endRowIdx, c: baseCol + 2 } })
        })
        // 합계 열 병합
        const totalCol = 3 + MONTH_COLUMNS.length * 3
        rowMerges.push({ s: { r: startRowIdx, c: totalCol }, e: { r: endRowIdx, c: totalCol } })
      }
    }
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

  // 데이터 행 병합 추가
  ws['!merges'] = [...merges, ...rowMerges]

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
