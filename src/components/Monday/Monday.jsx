import { useEffect, useState } from 'react'
import './Monday.css'

const MONDAY_API_URL = 'https://api.monday.com/v2'
const BOARD_ID = '18395459318'

function Monday() {
  const [columns, setColumns] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBoardData = async () => {
      console.log('All env:', import.meta.env)
      const apiKey = import.meta.env.VITE_MONDAY_KEY
      console.log('API Key exists:', !!apiKey)
      console.log('API Key length:', apiKey?.length)

      if (!apiKey) {
        setError('VITE_MONDAY_KEY가 설정되지 않았습니다.')
        setLoading(false)
        return
      }

      const query = `
              query {
          boards(ids: ${BOARD_ID}) {
            name
            columns {
              id
              title
              type
            }
            items_page(limit: 50) {
              items {
                id
                name
                column_values {
                  id
                  text
                  value
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
        setColumns(board.columns)
        setItems(board.items_page.items)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBoardData()
  }, [])

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

  return (
    <div className="monday-container">
      <div className="monday-board">
        <h1 className="text-2xl font-bold text-white mb-6">Monday.com Board</h1>
        <div className="overflow-x-auto">
          <table className="monday-table">
            <thead>
              <tr>
                <th>이름</th>
                {columns
                  .filter((col) => col.id !== 'name')
                  .map((col) => (
                    <th key={col.id}>{col.title}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  {columns
                    .filter((col) => col.id !== 'name')
                    .map((col) => {
                      const colValue = item.column_values.find((cv) => cv.id === col.id)
                      return <td key={col.id}>{colValue?.text || '-'}</td>
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Monday
