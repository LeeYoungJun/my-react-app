import { useMemo } from 'react'
import { MONTH_COLUMNS } from '../constants'
import { calculateMM } from '../utils'

export function useSubitemStats(groups) {
  // 하위 아이템 이름별로 월별 합계 및 아이템명 계산
  const subitemStats = useMemo(() => {
    const stats = {}

    groups.forEach((group) => {
      group.items_page.items.forEach((item) => {
        item.subitems?.forEach((subitem) => {
          const name = subitem.name
          const itemKey = `[${group.title}] ${item.name}`

          if (!stats[name]) {
            stats[name] = {
              months: {},
              items: new Set(),
              itemMonths: {},
            }
            MONTH_COLUMNS.forEach((month) => {
              stats[name].months[month] = 0
            })
          }

          // 아이템명 추가 (그룹명 포함)
          stats[name].items.add(itemKey)

          // 아이템별 월별 시간 초기화
          if (!stats[name].itemMonths[itemKey]) {
            stats[name].itemMonths[itemKey] = {}
            MONTH_COLUMNS.forEach((month) => {
              stats[name].itemMonths[itemKey][month] = 0
            })
          }

          subitem.column_values?.forEach((col) => {
            const title = col.column?.title
            if (MONTH_COLUMNS.includes(title) && col.text) {
              const value = parseFloat(col.text) || 0
              stats[name].months[title] += value
              stats[name].itemMonths[itemKey][title] += value
            }
          })
        })
      })
    })

    return stats
  }, [groups])

  // 월별 가동율 계산: (M/M 합계 / 인원 수) * 100
  const monthlyUtilization = useMemo(() => {
    const subitemNames = Object.keys(subitemStats)
    const personCount = subitemNames.length

    if (personCount === 0) return []

    return MONTH_COLUMNS.map((month) => {
      let totalMM = 0
      subitemNames.forEach((name) => {
        const value = subitemStats[name].months[month]
        totalMM += calculateMM(value)
      })

      const utilization = (totalMM / personCount) * 100

      return {
        month,
        utilization: Math.round(utilization * 100) / 100,
        totalMM: Math.round(totalMM * 100) / 100,
        personCount,
      }
    })
  }, [subitemStats])

  return { subitemStats, monthlyUtilization }
}
