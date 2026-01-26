import { useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { MONDAY_API_URL, BOARD_ID } from '../constants'
import { getTodayDate } from '../utils'

export function useMondayApi() {
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
  }, [])

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

  return {
    getCachedData,
    getAvailableDates,
    getDataByDate,
    saveCacheData,
    fetchFromMondayAPI,
  }
}
