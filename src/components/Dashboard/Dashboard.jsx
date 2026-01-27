import { useState } from 'react'
import PropTypes from 'prop-types'

// 통계 카드 컴포넌트
function StatCard({ title, value, change, changeType, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'up' ? '↑' : '↓'}
            {' '}
            {change}
          </p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  changeType: PropTypes.oneOf(['up', 'down']).isRequired,
  icon: PropTypes.string.isRequired,
}

// 사이드바 컴포넌트
function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { name: '대시보드', icon: '📊', active: true },
    { name: '주문관리', icon: '📦', active: false },
    { name: '고객관리', icon: '👥', active: false },
    { name: '상품관리', icon: '🏷️', active: false },
    { name: '분석', icon: '📈', active: false },
    { name: '설정', icon: '⚙️', active: false },
  ]

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Enter' && onClose()}
          aria-label="사이드바 닫기"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors text-left ${
                item.active
                  ? 'bg-slate-700 text-white border-r-4 border-indigo-500'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
      </aside>
    </>
  )
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

// 상단 헤더 컴포넌트
function Header({ onMenuClick }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 햄버거 메뉴 버튼 (모바일) */}
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* 검색바 */}
          <div className="relative">
            <input
              type="text"
              placeholder="검색..."
              className="w-64 md:w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 우측 아이콘들 */}
        <div className="flex items-center gap-4">
          {/* 알림 아이콘 */}
          <button type="button" className="relative p-2 rounded-lg hover:bg-gray-100" aria-label="알림">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* 프로필 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">관리자</span>
          </div>
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
}

// 최근 주문 테이블 컴포넌트
function RecentOrders() {
  const orders = [
    { id: '#12345', customer: '김철수', product: '노트북 Pro 15', amount: '₩1,890,000', status: '배송완료', statusColor: 'bg-green-100 text-green-800' },
    { id: '#12346', customer: '이영희', product: '무선 이어폰', amount: '₩289,000', status: '배송중', statusColor: 'bg-blue-100 text-blue-800' },
    { id: '#12347', customer: '박지민', product: '스마트워치', amount: '₩459,000', status: '준비중', statusColor: 'bg-yellow-100 text-yellow-800' },
    { id: '#12348', customer: '최수현', product: '태블릿 128GB', amount: '₩899,000', status: '배송완료', statusColor: 'bg-green-100 text-green-800' },
    { id: '#12349', customer: '정민수', product: '블루투스 스피커', amount: '₩159,000', status: '취소', statusColor: 'bg-red-100 text-red-800' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">최근 주문</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문번호</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${order.statusColor}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 메인 Dashboard 컴포넌트
function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stats = [
    { title: '총 매출', value: '₩45,231,890', change: '12.5% 지난달 대비', changeType: 'up', icon: '💰' },
    { title: '사용자 수', value: '2,845', change: '8.2% 지난달 대비', changeType: 'up', icon: '👤' },
    { title: '총 주문', value: '1,234', change: '3.1% 지난달 대비', changeType: 'up', icon: '📦' },
    { title: '전환율', value: '3.24%', change: '0.4% 지난달 대비', changeType: 'down', icon: '📈' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 메인 콘텐츠 영역 */}
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-6">
          {/* 페이지 제목 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
            <p className="text-gray-500 mt-1">비즈니스 현황을 한눈에 확인하세요</p>
          </div>

          {/* 통계 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* 최근 주문 테이블 */}
          <RecentOrders />
        </main>
      </div>
    </div>
  )
}

export default Dashboard
