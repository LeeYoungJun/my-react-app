import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import './Monday.css'

const MONDAY_API_URL = 'https://api.monday.com/v2'
const BOARD_ID = '18393300831'

const MONTH_COLUMNS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

const calculateMM = (value) => {
  if (!value || value <= 0) return 0
  return Math.round((value / 143.5) * 100) / 100
}

function Monday() {
  const [boardName, setBoardName] = useState('')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showChart, setShowChart] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [availableDates, setAvailableDates] = useState([])
  const fetchedRef = useRef(false)

  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
  const getTodayDate = useCallback(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }, [])

  // Supabase에서 캐시된 데이터 조회 (가장 최근 레코드)
  const getCachedData = useCallback(async () => {
    if (!supabase) return null

    const { data, error: fetchError } = await supabase
      .from('monday_board_cache')
      .select('*')
      .eq('board_id', BOARD_ID)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !data) return null
    return data
  }, [])

  // Supabase에서 사용 가능한 날짜 목록 조회
  const getAvailableDates = useCallback(async () => {
    if (!supabase) return []

    const { data, error: fetchError } = await supabase
      .from('monday_board_cache')
      .select('updated_at')
      .eq('board_id', BOARD_ID)
      .order('updated_at', { ascending: false })

    if (fetchError || !data) return []
    return data.map((d) => d.updated_at)
  }, [])

  // 특정 날짜의 데이터 조회
  const getDataByDate = useCallback(async (date) => {
    if (!supabase) return null

    const { data, error: fetchError } = await supabase
      .from('monday_board_cache')
      .select('*')
      .eq('board_id', BOARD_ID)
      .eq('updated_at', date)
      .single()

    if (fetchError || !data) return null
    return data
  }, [])

  // Supabase에 새 데이터 INSERT (히스토리 보관)
  const saveCacheData = useCallback(async (boardData) => {
    if (!supabase) return

    const today = getTodayDate()

    await supabase
      .from('monday_board_cache')
      .insert({
        board_id: BOARD_ID,
        board_name: boardData.name,
        board_data: boardData,
        updated_at: today,
      })
  }, [getTodayDate])

  // Monday.com API에서 데이터 가져오기
  const fetchFromMondayAPI = useCallback(async (apiKey) => {
    const query = `
      query {
        boards(ids: ${BOARD_ID}) {
          name
          groups {
            id
            title
            items_page(limit: 100) {
              items {
                id
                name
                subitems {
                  id
                  name
                  column_values {
                    id
                    text
                    column {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch(MONDAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ query }),
    })

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0].message)
    }

    return result.data.boards[0]
  }, [])

  useEffect(() => {
    // StrictMode에서 중복 호출 방지
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchBoardData = async () => {
      const apiKey = import.meta.env.VITE_MONDAY_API_KEY

      if (!apiKey) {
        setError('VITE_MONDAY_API_KEY가 설정되지 않았습니다.')
        setLoading(false)
        return
      }

      try {
        // 1. Supabase 캐시 확인
        const cachedData = await getCachedData()
        const today = getTodayDate()

        if (cachedData && cachedData.updated_at === today) {
          // 오늘 날짜와 같으면 캐시 데이터 사용
          const boardData = cachedData.board_data
          setBoardName(boardData.name)
          setGroups(boardData.groups)
          setSelectedDate(today)
        } else {
          // 2. 캐시가 없거나 오늘 이전이면 Monday.com API 호출
          const board = await fetchFromMondayAPI(apiKey)

          // 3. Supabase에 캐시 저장
          await saveCacheData(board)

          setBoardName(board.name)
          setGroups(board.groups)
          setSelectedDate(today)
        }

        // 4. 사용 가능한 날짜 목록 조회
        const dates = await getAvailableDates()
        setAvailableDates(dates)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBoardData()
  }, [getCachedData, getTodayDate, fetchFromMondayAPI, saveCacheData, getAvailableDates])

  // 날짜 선택 변경 핸들러
  const handleDateChange = async (date) => {
    if (date === selectedDate) return

    setLoading(true)
    setSelectedDate(date)

    try {
      const today = getTodayDate()

      if (date === today) {
        // 오늘 날짜 선택시 최신 데이터 확인
        const cachedData = await getCachedData()
        if (cachedData && cachedData.updated_at === today) {
          const boardData = cachedData.board_data
          setBoardName(boardData.name)
          setGroups(boardData.groups)
        } else {
          // Monday.com API에서 새로 가져오기
          const apiKey = import.meta.env.VITE_MONDAY_API_KEY
          const board = await fetchFromMondayAPI(apiKey)
          await saveCacheData(board)
          setBoardName(board.name)
          setGroups(board.groups)

          // 날짜 목록 갱신
          const dates = await getAvailableDates()
          setAvailableDates(dates)
        }
      } else {
        // 과거 날짜 선택시 Supabase에서 조회
        const data = await getDataByDate(date)
        if (data) {
          const boardData = data.board_data
          setBoardName(boardData.name)
          setGroups(boardData.groups)
        } else {
          setError(`${date} 날짜의 데이터가 없습니다.`)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

  const exportToExcel = useCallback(() => {
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
  }, [subitemStats, boardName])

  if (loading) {
    return (
      <div className="monday-container">
        <div className="monday-content">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="monday-container">
        <div className="monday-content">
          <p className="text-red-600">
            에러:
            {error}
          </p>
        </div>
      </div>
    )
  }

  const subitemNames = Object.keys(subitemStats).sort()
  const currentMonth = `${new Date().getMonth() + 1}월`

  return (
    <div className="monday-container">
      <div className="monday-board">
        <div className="monday-header">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{boardName}</h1>
            <h2 className="text-lg text-gray-400">사용자 월별 작업 시간</h2>
          </div>
          <div className="header-buttons">
            <div className="date-selector">
              <label htmlFor="date-select">데이터 날짜:</label>
              <select
                id="date-select"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                disabled={loading || availableDates.length === 0}
              >
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                    {date === getTodayDate() ? ' (오늘)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={`chart-btn ${showChart ? 'active' : ''}`}
              onClick={() => setShowChart(!showChart)}
              disabled={Object.keys(subitemStats).length === 0}
            >
              월별 가동율
            </button>
            <button
              type="button"
              className="export-btn"
              onClick={exportToExcel}
              disabled={Object.keys(subitemStats).length === 0}
            >
              Excel 다운로드
            </button>
          </div>
        </div>

        {showChart && monthlyUtilization.length > 0 && (
          <div className="chart-container">
            <h3 className="chart-title">월별 가동율 (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyUtilization} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3d3d5c" />
                <XAxis dataKey="month" stroke="#a0a0c0" />
                <YAxis stroke="#a0a0c0" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e2e',
                    border: '1px solid #3d3d5c',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value, name) => {
                    if (name === 'utilization') return [`${value}%`, '가동율']
                    return [value, name]
                  }}
                />
                <Legend
                  formatter={(value) => (value === 'utilization' ? '가동율' : value)}
                />
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '100%', fill: '#ef4444', position: 'right' }} />
                <Bar dataKey="utilization" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="chart-note">
              계산식: (M/M 합계 / 인원수) × 100 | 인원수: 
              {' '}
              {monthlyUtilization[0]?.personCount || 0}
              명
            </p>
          </div>
        )}

        {subitemNames.length === 0 ? (
          <p className="text-gray-500">하위 아이템이 없습니다.</p>
        ) : (
          <div className="table-scroll-container">
            <table className="monday-table">
              <thead>
                <tr>
                  <th className="col-no">No</th>
                  <th>이름</th>
                  <th>아이템</th>
                  {MONTH_COLUMNS.map((month) => (
                    <th key={month} colSpan="3" className={month === currentMonth ? 'col-current-month' : ''}>{month}</th>
                  ))}
                  <th className="col-total">합계</th>
                </tr>
                <tr>
                  <th className="col-no" aria-label="No 서브헤더" />
                  <th aria-label="이름 서브헤더" />
                  <th aria-label="아이템 서브헤더" />
                  {MONTH_COLUMNS.map((month) => (
                    <React.Fragment key={`${month}-sub`}>
                      <th className={`col-sub col-item-hours ${month === currentMonth ? 'col-current-month-sub' : ''}`}>아이템별</th>
                      <th className={`col-sub ${month === currentMonth ? 'col-current-month-sub' : ''}`}>시간</th>
                      <th className={`col-sub ${month === currentMonth ? 'col-current-month-sub' : ''}`}>M/M</th>
                    </React.Fragment>
                  ))}
                  <th className="col-sub">시간</th>
                </tr>
              </thead>
              <tbody>
                {subitemNames.map((name, index) => {
                  const personStats = subitemStats[name]
                  const total = MONTH_COLUMNS.reduce(
                    (sum, month) => sum + personStats.months[month],
                    0
                  )
                  const itemList = Array.from(personStats.items)

                  return (
                    <tr key={name}>
                      <td className="col-no">{index + 1}</td>
                      <td>{name}</td>
                      <td className="col-items">
                        <div className="item-list">
                          {itemList.map((itemName) => (
                            <span key={itemName} className="item-tag">
                              {itemName}
                            </span>
                          ))}
                        </div>
                      </td>
                      {MONTH_COLUMNS.map((month) => {
                        const value = personStats.months[month]
                        const mm = calculateMM(value)
                        const itemHours = itemList.map((itemName) => ({
                          name: itemName,
                          hours: personStats.itemMonths[itemName]?.[month] || 0,
                        }))

                        return (
                          <React.Fragment key={month}>
                            <td className="col-item-hours">
                              <div className="item-hours-list">
                                {itemHours.map((ih) => (
                                  <span key={ih.name} className="item-hours-tag">
                                    {ih.hours}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              {value > 0 ? value : '-'}
                            </td>
                            <td className="col-mm">
                              {mm > 0 ? mm.toFixed(2) : '0'}
                            </td>
                          </React.Fragment>
                        )
                      })}
                      <td style={{ color: '#60a5fa', fontWeight: 'bold' }}>
                        {total > 0 ? total.toFixed(2) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Monday
