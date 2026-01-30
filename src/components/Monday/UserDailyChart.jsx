import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function UserDailyChart({ userName, monthlyData, selectedMonth, onClose, loading }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (!monthlyData || monthlyData.length === 0 || !userName) {
      setChartData([])
      return
    }

    // 각 날짜별로 사용자의 월별 누적 시간 추출
    const dailyAccumulated = monthlyData.map((dayData) => {
      const boardData = dayData.board_data
      let userMonthTotal = 0

      boardData.groups?.forEach((group) => {
        group.items_page?.items?.forEach((item) => {
          item.subitems?.forEach((subitem) => {
            if (subitem.name === userName) {
              subitem.column_values?.forEach((col) => {
                const title = col.column?.title
                if (title === selectedMonth && col.text) {
                  userMonthTotal += parseFloat(col.text) || 0
                }
              })
            }
          })
        })
      })

      return {
        date: dayData.updated_at,
        accumulated: userMonthTotal,
      }
    })

    // 일별 시간 계산 (당일 누적 - 전일 누적)
    const dailyHours = dailyAccumulated.map((day, index) => {
      const prevAccumulated = index > 0 ? dailyAccumulated[index - 1].accumulated : 0
      const dailyValue = day.accumulated - prevAccumulated

      // 날짜에서 일자만 추출 (예: "2025-01-15" -> "15일")
      const dateObj = new Date(day.date)
      const dayLabel = `${dateObj.getDate()}일`

      return {
        date: day.date,
        dayLabel,
        daily: dailyValue >= 0 ? dailyValue : 0, // 음수인 경우 0으로 처리
        accumulated: day.accumulated,
      }
    })

    setChartData(dailyHours)
  }, [monthlyData, userName, selectedMonth])

  if (!userName) return null

  return (
    <div className="user-daily-chart-container">
      <div className="user-daily-chart-header">
        <h3 className="chart-title">
          {userName}
          {' '}
          -
          {' '}
          {selectedMonth}
          {' '}
          일별 작업 시간
        </h3>
        <button type="button" className="close-btn" onClick={onClose}>
          닫기
        </button>
      </div>
      {loading ? (
        <p className="no-data-message">데이터를 불러오는 중...</p>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3d3d5c" />
            <XAxis dataKey="dayLabel" stroke="#a0a0c0" />
            <YAxis stroke="#a0a0c0" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e1e2e',
                border: '1px solid #3d3d5c',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value, name) => {
                if (name === 'daily') return [`${value}h`, '일별 시간']
                if (name === 'accumulated') return [`${value}h`, '누적 시간']
                return [value, name]
              }}
              labelFormatter={(label) => `날짜: ${label}`}
            />
            <Legend
              formatter={(value) => {
                if (value === 'daily') return '일별 시간'
                if (value === 'accumulated') return '누적 시간'
                return value
              }}
            />
            <Line
              type="monotone"
              dataKey="daily"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="accumulated"
              stroke="#6c5ce7"
              strokeWidth={2}
              dot={{ fill: '#6c5ce7', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="no-data-message">해당 월의 데이터가 없습니다.</p>
      )}
      <p className="chart-note">
        데이터 기준:
        {' '}
        {chartData.length}
        일 | 총 누적 시간:
        {' '}
        {chartData[chartData.length - 1]?.accumulated || 0}
        h
      </p>
    </div>
  )
}

UserDailyChart.propTypes = {
  userName: PropTypes.string,
  monthlyData: PropTypes.arrayOf(PropTypes.shape({
    updated_at: PropTypes.string,
    board_data: PropTypes.shape({
      groups: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  })),
  selectedMonth: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

UserDailyChart.defaultProps = {
  userName: null,
  monthlyData: [],
  loading: false,
}

export default UserDailyChart
