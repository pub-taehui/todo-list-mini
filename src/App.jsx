import { useState, useEffect } from 'react'
import TodoModal from './components/TodoModal'
import './assets/css/reset.css'
import './assets/css/todolist.css'
import './App.css'

// Initial mock data based on the provided UI example image
const INITIAL_TODOS = [
  { id: 1, title: 'React 기초 공부', category: '공부', completed: false, deadline: '2026-07-15', createdAt: '2026-07-01T10:00:00Z' },
  { id: 2, title: 'Spring Boot 프로젝트 진행', category: '업무', completed: false, deadline: '2026-07-18', createdAt: '2026-07-02T11:00:00Z' },
  { id: 3, title: '헬스장 운동', category: '운동', completed: true, deadline: '2026-07-09', createdAt: '2026-07-03T09:00:00Z' },
  { id: 4, title: 'TypeScript 학습', category: '공부', completed: false, deadline: '2026-07-20', createdAt: '2026-07-04T15:00:00Z' },
  { id: 5, title: '장보기 목록 작성', category: '쇼핑', completed: false, deadline: '2026-07-10', createdAt: '2026-07-05T12:00:00Z' },
  { id: 6, title: '블로그 글 작성', category: '기타', completed: true, deadline: '2026-07-08', createdAt: '2026-07-06T08:00:00Z' },
]

const CATEGORIES = ['공부', '업무', '운동', '쇼핑', '기타']

function App() {
  const [todos, setTodos] = useState(INITIAL_TODOS)
  const [theme, setTheme] = useState('dark') // Dark mode by default
  
  // 필터
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedFilter, setSelectedFilter] = useState('전체'); // 전체, 진행 중, 완료
  const [sortOption, setSortOption] = useState('newest'); // newest, oldest, deadline
  
  // 검색
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAddText, setQuickAddText] = useState('');
  
  // 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTodoId, setModalTodoId] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalCategory, setModalCategory] = useState('공부');
  const [modalDeadline, setModalDeadline] = useState('');

  // 라이트/다크 테마
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('theme-dark');
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('theme-dark');
    }
  }, [theme])

  // 테마 전환
  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  // 모달 열기
  const handleOpenAddModal = (e) => {
    if (e) e.preventDefault()
    setModalTodoId(null)
    setModalTitle(quickAddText)
    setModalCategory('공부')
    const today = new Date().toISOString().split('T')[0]
    setModalDeadline(today)
    setIsModalOpen(true)
  }

  // 수정 모달 열기
  const handleOpenEditModal = (todo) => {
    setModalTodoId(todo.id)
    setModalTitle(todo.title)
    setModalCategory(todo.category)
    setModalDeadline(todo.deadline || '')
    setIsModalOpen(true)
  }

  // 할일 저장
  const handleSaveTodo = (e) => {
    e.preventDefault()
    if (!modalTitle.trim()) {
      alert('할 일 제목을 입력해주세요!')
      return
    }
    // 할 일 추가(수정) 로직
    if (modalTodoId !== null) {
      // 수정로직
      // map을 사용해 배열에서 수정할 요소만 찾아서 변경
      setTodos(prev => prev.map(todo => todo.id === modalTodoId ? {
        ...todo,
        title: modalTitle.trim(),
        category: modalCategory,
        deadline: modalDeadline
      } : todo))
    } else {
      // 추가로직
      const newTodo = {
        id: Date.now(),
        title: modalTitle.trim(),
        category: modalCategory,
        completed: false,
        deadline: modalDeadline,
        createdAt: new Date().toISOString()
      }
      setTodos(prev => [newTodo, ...prev]) // ...spread 문법으로 기존 배열 앞에 새 요소 추가
      setQuickAddText(''); // 입력란 초기화
    }
    setIsModalOpen(false); // 모달 닫기
  }

  const handleToggleComplete = (id) => { // 할일 완료 토글
    setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)) // 불변성 유지를 위해 map 사용
  }

  const handleDeleteTodo = (id) => { // 할일 삭제
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setTodos(prev => prev.filter(todo => todo.id !== id)) // filter로 해당 요소 제외하여 삭제
    }
  }

  // 통계
  const getCategoryCount = (cate) => {
    if (cate === '전체') return todos.length;
    return todos.filter(t => t.category === cate).length;
  }
  // 필터링된 할일 목록 개수
  const getFilterCount = (filter) => {
    if (filter === '전체') return todos.length;
    if (filter === '진행 중') return todos.filter(t => !t.completed).length;
    if (filter === '완료') return todos.filter(t => t.completed).length;
  }

  // 정렬된 할일 목록
  const filteredTodos = todos.filter(todo => { // 할일 목록 필터링
      if (selectedCategory !== '전체' && todo.category !== selectedCategory) return false; // 카테고리 필터링
      if (selectedFilter === '진행 중' && todo.completed) return false; // 진행중 필터링
      if (selectedFilter === '완료' && !todo.completed) return false; // 완료 필터링
      if (searchQuery.trim() && !todo.title.toLowerCase().includes(searchQuery.toLowerCase())) return false; // 검색 필터링
      return true; // 모든 조건에 일치하면 true
  }).sort((a, b) => { // 할일 목록 정렬
      if (sortOption === 'newest') return new Date(b.createdAt) - new Date(a.createdAt) // 최신순
      if (sortOption === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt) // 오래된순
      if (sortOption === 'deadline') { // 마감순
        if (!a.deadline) return 1 // 마감일이 없으면 뒤로
        if (!b.deadline) return -1 // 마감일이 없으면 뒤로
        return new Date(a.deadline) - new Date(b.deadline) // 마감일 오름차순
      }
      return 0
    })

  const formatDate = (dateStr) => { // 날짜 포맷 변환
    if (!dateStr) return '' // 날짜가 없으면 빈문자열
    const parts = dateStr.split('-') // 날짜 문자열 분리
    if (parts.length < 3) return dateStr // 날짜 형식이 맞지 않으면 그대로 반환
    const month = parseInt(parts[1], 10) // 월 추출
    const day = parseInt(parts[2], 10) // 일 추출
    return `${month}월 ${day}일` // 날짜 포맷 변환
  }

  return (
    <div className={`layout-app-container theme-${theme}`}>
      {/* Left Sidebar */}
      <aside className="aside-sidebar">
        <div className="logo-area">
          <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#3b82f6"/>
            <path d="M7 12L10.5 15.5L17 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="logo-text">Tania's Todolist</span>
        </div>

        <button type="button" className="btn-solid-add" onClick={() => handleOpenAddModal(null)}>
          <span className="icon">+</span> 할 일 추가
        </button>

        <nav className="nav-menu">
          <div className="menu-section">
            <h3 className="menu-title">카테고리</h3>
            <ul className="menu-list">
              <li className={`menu-item ${selectedCategory === '전체' ? 'is-active' : ''}`} onClick={() => setSelectedCategory('전체')}>
                <span className="menu-item-left">
                  <span className="icon">📂</span>
                  <span className="name">전체</span>
                </span>
                <span className="badge-count">{getCategoryCount('전체')}</span>
              </li>
              {CATEGORIES.map(cate => (
                <li key={cate} className={`menu-item ${selectedCategory === cate ? 'is-active' : ''}`} onClick={() => setSelectedCategory(cate)}>
                  <span className="menu-item-left">
                    <span className="icon">
                      {cate === '공부' && '📖'}
                      {cate === '업무' && '💼'}
                      {cate === '운동' && '🏃'}
                      {cate === '쇼핑' && '🛒'}
                      {cate === '기타' && '💬'}
                    </span>
                    <span className="name">{cate}</span>
                  </span>
                  <span className="badge-count">{getCategoryCount(cate)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="menu-section">
            <h3 className="menu-title">필터</h3>
            <ul className="menu-list">
              {['전체', '진행 중', '완료'].map(filter => (
                <li key={filter} className={`menu-item ${selectedFilter === filter ? 'is-active' : ''}`} onClick={() => setSelectedFilter(filter)}>
                  <span className="menu-item-left">
                    <span className="name">{filter}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="menu-section">
            <h3 className="menu-title">정렬</h3>
            <select className="select-sort-sidebar" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="deadline">마감일순</option>
            </select>
          </div>
        </nav>
      </aside>

      {/* Right Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h2 className="title-today">오늘의 할 일 👏</h2>
            <p className="subtitle">계획을 세우고 차근차근 완료해보세요!</p>
          </div>
          
          <div className="header-right">
            <button type="button" className="btn-lined-theme-toggle" onClick={handleToggleTheme} title={theme === 'light' ? '다크 모드로 변경' : '라이트 모드로 변경'}>
              {theme === 'light' ? '☀️' : '🌙'}
            </button>
            <div className="user-avatar" title="사용자 정보">
              <svg className="user-avatar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21C20 19.6076 20 18.9114 19.6614 18.3562C19.2319 17.6516 18.5284 17.1141 17.708 16.858C17.061 16.656 16.3268 16.656 14.8584 16.656H9.14162C7.67322 16.656 6.93902 16.656 6.29202 16.858C5.47158 17.1141 4.76813 17.6516 4.33857 18.3562C4 18.9114 4 19.6076 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </header>

        {/* Content Box Wrap */}
        <div className="content-card-wrap">
          {/* List Header */}
          <div className="list-header">
            <form onSubmit={handleOpenAddModal} className="form-search-add">
              <div className="search-input-group">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  className="input-search-text"
                  placeholder="할 일을 검색하고 추가해 보세요..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setQuickAddText(e.target.value)
                  }}
                />
              </div>
              <button type="submit" className="btn-solid-add-main">
                <span className="icon">+</span> 할 일 추가
              </button>
            </form>

            <div className="filter-chips-row">
              <div className="category-chips">
                <button 
                  type="button" 
                  className={`category-chip ${selectedCategory === '전체' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('전체')}
                >
                  📂 전체
                </button>
                {CATEGORIES.map(cate => (
                  <button 
                    key={cate}
                    type="button" 
                    className={`category-chip ${selectedCategory === cate ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cate)}
                  >
                    {cate === '공부' && '📖 공부'}
                    {cate === '업무' && '💼 업무'}
                    {cate === '운동' && '🏃 운동'}
                    {cate === '쇼핑' && '🛒 쇼핑'}
                    {cate === '기타' && '💬 기타'}
                  </button>
                ))}
              </div>

              <select 
                className="select-sort-main"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="deadline">마감일순</option>
              </select>
            </div>
          </div>

          {/* Todo List Box */}
          <div className="todo-list-box">
            {filteredTodos.length === 0 ? (
              <div className="empty-state">
                <p>표시할 할 일이 없습니다.</p>
              </div>
            ) : (
              <ul className="todo-list">
                {filteredTodos.map(todo => (
                  <li key={todo.id} className={`todo-item-card ${todo.completed ? 'completed' : ''}`}>
                    <div className="todo-item-left">
                      <label className="checkbox-container">
                        <input 
                          type="checkbox" 
                          checked={todo.completed} 
                          onChange={() => handleToggleComplete(todo.id)}
                        />
                        <span className="checkmark"></span>
                      </label>
                      <span className="todo-title">{todo.title}</span>
                      <span className={`category-badge cat-${todo.category === '공부' ? 'study' : todo.category === '업무' ? 'work' : todo.category === '운동' ? 'exercise' : todo.category === '쇼핑' ? 'shopping' : 'etc'}`}>
                        {todo.category}
                      </span>
                    </div>

                    <div className="todo-item-right">
                      {todo.deadline && (
                        <span className="deadline-badge">
                          <span className="icon">📅</span> {formatDate(todo.deadline)}
                        </span>
                      )}
                      
                      <button 
                        type="button" 
                        className="btn-action-edit"
                        onClick={() => handleOpenEditModal(todo)}
                        title="수정"
                      >
                        ✏️
                      </button>
                      <button 
                        type="button" 
                        className="btn-action-delete"
                        onClick={() => handleDeleteTodo(todo.id)}
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* List Footer */}
          <div className="list-footer">
            <div className="footer-stat-box">
              <span className="stat-icon icon-all">📝</span>
              <div className="stat-content">
                <div className="stat-row">
                  <span className="stat-label">전체</span>
                  <span className="stat-count">{getFilterCount('전체')} 개</span>
                </div>
              </div>
            </div>
            <div className="footer-stat-box">
              <span className="stat-icon icon-progress">🔄</span>
              <div className="stat-content">
                <div className="stat-row">
                  <span className="stat-label">진행 중</span>
                  <span className="stat-count">{getFilterCount('진행 중')} 개</span>
                </div>
              </div>
            </div>
            <div className="footer-stat-box">
              <span className="stat-icon icon-done">✅</span>
              <div className="stat-content">
                <div className="stat-row">
                  <span className="stat-label">완료</span>
                  <span className="stat-count">{getFilterCount('완료')} 개</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTodo}
        todoId={modalTodoId}
        title={modalTitle}
        setTitle={setModalTitle}
        category={modalCategory}
        setCategory={setModalCategory}
        deadline={modalDeadline}
        setDeadline={setModalDeadline}
        categories={CATEGORIES}
      />
    </div>
  )
}

export default App
