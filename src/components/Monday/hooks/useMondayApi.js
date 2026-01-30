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

  // 특정 월의 모든 날짜 데이터 조회 (일별 시간 계산용)
  const getMonthlyData = useCallback(async (year, month) => {
    if (!supabase) return []

    // 해당 월의 시작일과 종료일 계산
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`

    const { data, error: fetchError } = await supabase
      .from('monday_board_cache')
      .select('*')
      .eq('board_id', BOARD_ID)
      .gte('updated_at', startDate)
      .lte('updated_at', endDate)
      .order('updated_at', { ascending: true })

    if (fetchError || !data) return []
    return data
  }, [])

  // Supabase에 데이터 저장 (같은 날짜면 UPDATE, 없으면 INSERT)
  const saveCacheData = useCallback(async (boardData) => {
    if (!supabase) return

    const today = getTodayDate()

    // board_id + updated_at 복합 UNIQUE 제약 활용한 upsert
    const { error } = await supabase
      .from('monday_board_cache')
      .upsert(
        {
          board_id: BOARD_ID,
          board_name: boardData.name,
          board_data: boardData,
          updated_at: today,
        },
        { onConflict: 'board_id,updated_at' }
      )

    if (error) {
      console.error('Failed to save cache data:', error)
    }
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
    getMonthlyData,
    saveCacheData,
    fetchFromMondayAPI,
  }
}
