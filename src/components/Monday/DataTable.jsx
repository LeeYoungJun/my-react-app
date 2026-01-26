import React from 'react'
import PropTypes from 'prop-types'
import { MONTH_COLUMNS } from './constants'
import { calculateMM } from './utils'

function DataTable({ subitemStats }) {
  const subitemNames = Object.keys(subitemStats).sort()
  const currentMonth = `${new Date().getMonth() + 1}월`

  if (subitemNames.length === 0) {
    return <p className="text-gray-500">하위 아이템이 없습니다.</p>
  }

  return (
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
  )
}

DataTable.propTypes = {
  subitemStats: PropTypes.objectOf(
    PropTypes.shape({
      months: PropTypes.objectOf(PropTypes.number).isRequired,
      items: PropTypes.instanceOf(Set).isRequired,
      itemMonths: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)).isRequired,
    })
  ).isRequired,
}

export default DataTable
