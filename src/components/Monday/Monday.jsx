import { useEffect, useState, useMemo } from 'react'
import './Monday.css'

const MONDAY_API_URL = 'https://api.monday.com/v2'
const BOARD_ID = '18393300831'

const MONTH_COLUMNS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function Monday() {
  const [boardName, setBoardName] = useState('')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBoardData = async () => {
      const apiKey = import.meta.env.VITE_MONDAY_API_KEY

      if (!apiKey) {
        setError('VITE_MONDAY_API_KEY가 설정되지 않았습니다.')
        setLoading(false)
        return
      }

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

      try {
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

        const board = result.data.boards[0]
        setBoardName(board.name)
        setGroups(board.groups)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBoardData()
  }, [])

  // 하위 아이템 이름별로 월별 합계 및 아이템명 계산
  const subitemStats = useMemo(() => {
    const stats = {}

    groups.forEach((group) => {
      group.items_page.items.forEach((item) => {
        item.subitems?.forEach((subitem) => {
          const name = subitem.name

          if (!stats[name]) {
            stats[name] = {
              months: {},
              items: new Set(),
            }
            MONTH_COLUMNS.forEach((month) => {
              stats[name].months[month] = 0
            })
          }

          // 아이템명 추가
          stats[name].items.add(item.name)

          subitem.column_values?.forEach((col) => {
            const title = col.column?.title
            if (MONTH_COLUMNS.includes(title) && col.text) {
              const value = parseFloat(col.text) || 0
              stats[name].months[title] += value
            }
          })
        })
      })
    })

    return stats
  }, [groups])

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

  return (
    <div className="monday-container">
      <div className="monday-board">
        <h1 className="text-2xl font-bold text-white mb-6">{boardName}</h1>
        <h2 className="text-lg text-gray-400 mb-4">사용자 월별 작업 시간</h2>

        {subitemNames.length === 0 ? (
          <p className="text-gray-500">하위 아이템이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="monday-table">
              <thead>
                <tr>
                  <th>이름</th>
                  {MONTH_COLUMNS.map((month) => (
                    <th key={month}>{month}</th>
                  ))}
                  <th className="col-total">합계</th>
                  <th>아이템</th>
                </tr>
              </thead>
              <tbody>
                {subitemNames.map((name) => {
                  const personStats = subitemStats[name]
                  const total = MONTH_COLUMNS.reduce(
                    (sum, month) => sum + personStats.months[month],
                    0
                  )
                  const itemList = Array.from(personStats.items)

                  return (
                    <tr key={name}>
                      <td>{name}</td>
                      {MONTH_COLUMNS.map((month) => (
                        <td key={month}>
                          {personStats.months[month] > 0 ? personStats.months[month] : '-'}
                        </td>
                      ))}
                      <td style={{ color: '#60a5fa', fontWeight: 'bold' }}>
                        {total > 0 ? total.toFixed(2) : '-'}
                      </td>
                      <td>
                        <div className="item-list">
                          {itemList.map((itemName) => (
                            <span key={itemName} className="item-tag">
                              {itemName}
                            </span>
                          ))}
                        </div>
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
