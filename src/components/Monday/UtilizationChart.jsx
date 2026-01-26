import React from 'react'
import PropTypes from 'prop-types'
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

function UtilizationChart({ data }) {
  if (!data || data.length === 0) return null

  return (
    <div className="chart-container">
      <h3 className="chart-title">월별 가동율 (%)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
        {data[0]?.personCount || 0}
        명
      </p>
    </div>
  )
}

UtilizationChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      utilization: PropTypes.number.isRequired,
      totalMM: PropTypes.number.isRequired,
      personCount: PropTypes.number.isRequired,
    })
  ),
}

UtilizationChart.defaultProps = {
  data: [],
}

export default UtilizationChart
