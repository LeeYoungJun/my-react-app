import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useMondayApi } from './hooks/useMondayApi'
import { useSubitemStats } from './hooks/useSubitemStats'
import { exportToExcel } from './exportToExcel'
import { getTodayDate } from './utils'
import UtilizationChart from './UtilizationChart'
import DataTable from './DataTable'
import './Monday.css'

function Monday() {
  const [boardName, setBoardName] = useState('')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showChart, setShowChart] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [availableDates, setAvailableDates] = useState([])
  const fetchedRef = useRef(false)

  const {
    getCachedData,
    getAvailableDates,
    getDataByDate,
    saveCacheData,
    fetchFromMondayAPI,
  } = useMondayApi()

  const { subitemStats, monthlyUtilization } = useSubitemStats(groups)

  useEffect(() => {
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
        const cachedData = await getCachedData()
        const today = getTodayDate()

        if (cachedData && cachedData.updated_at === today) {
          const boardData = cachedData.board_data
          setBoardName(boardData.name)
          setGroups(boardData.groups)
          setSelectedDate(today)
        } else {
          const board = await fetchFromMondayAPI(apiKey)
          await saveCacheData(board)
          setBoardName(board.name)
          setGroups(board.groups)
          setSelectedDate(today)
        }

        const dates = await getAvailableDates()
        setAvailableDates(dates)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBoardData()
  }, [getCachedData, fetchFromMondayAPI, saveCacheData, getAvailableDates])

  const handleDateChange = useCallback(async (date) => {
    if (date === selectedDate) return

    setLoading(true)
    setSelectedDate(date)

    try {
      const today = getTodayDate()

      if (date === today) {
        const cachedData = await getCachedData()
        if (cachedData && cachedData.updated_at === today) {
          const boardData = cachedData.board_data
          setBoardName(boardData.name)
          setGroups(boardData.groups)
        } else {
          const apiKey = import.meta.env.VITE_MONDAY_API_KEY
          const board = await fetchFromMondayAPI(apiKey)
          await saveCacheData(board)
          setBoardName(board.name)
          setGroups(board.groups)

          const dates = await getAvailableDates()
          setAvailableDates(dates)
        }
      } else {
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
  }, [selectedDate, getCachedData, fetchFromMondayAPI, saveCacheData, getAvailableDates, getDataByDate])

  const handleExportExcel = useCallback(() => {
    exportToExcel(subitemStats, boardName)
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

  const hasData = Object.keys(subitemStats).length > 0

  return (
    <div className="monday-container">
      <div className="monday-board">
        <div className="monday-header">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{boardName}</h1>
            <h2 className="monday-subtitle">사용자 월별 작업 시간</h2>
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
              disabled={!hasData}
            >
              월별 가동율
            </button>
            <button
              type="button"
              className="dashboard-btn"
              onClick={() => window.open('https://sphinfo.monday.com/boards/18393300831', '_blank')}
            >
              대시보드로 이동
            </button>
            <button
              type="button"
              className="export-btn"
              onClick={handleExportExcel}
              disabled={!hasData}
            >
              Excel 다운로드
            </button>
          </div>
        </div>

        {showChart && <UtilizationChart data={monthlyUtilization} />}

        <DataTable subitemStats={subitemStats} />
      </div>
    </div>
  )
}

export default Monday
