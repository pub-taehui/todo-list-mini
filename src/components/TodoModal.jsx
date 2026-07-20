import React from 'react';

function TodoModal(props) {
  //부모 컴포넌트(App.jsx)로부터 전달받은 props 객체
  if (!props.isOpen) return null

  const handleOverlayClick = (e) => {
    // 실제 누른 영역이 어두운 배경(overlay) 자기 자신일 때만 모달 닫기
    if (e.target === e.currentTarget) {
      props.onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-window">
        <div className="modal-header">
          <h3>{props.todoId ? '할 일 수정하기' : '새로운 할 일 추가'}</h3>
          <button type="button" className="btn-close-modal" onClick={props.onClose}>✕</button>
        </div>
        
        <form onSubmit={props.onSave}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="modal-todo-title">할 일 제목</label>
              <input type="text" id="modal-todo-title" className="modal-input-text" placeholder="할 일의 제목을 입력하세요."
                value={props.title} onChange={(e) => props.setTitle(e.target.value)} required autoFocus
              />
            </div>

            <div className="form-group">
              <label>카테고리 선택</label>
              <div className="modal-category-chips">
                {props.categories.map(cate => (
                  <button key={cate} type="button" className={`modal-category-chip ${props.category === cate ? 'selected' : ''}`}
                    onClick={() => props.setCategory(cate)}>
                    {cate === '공부' && '📖 공부'}
                    {cate === '업무' && '💼 업무'}
                    {cate === '운동' && '🏃 운동'}
                    {cate === '쇼핑' && '🛒 쇼핑'}
                    {cate === '기타' && '💬 기타'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="modal-todo-deadline">마감일</label>
              <input 
                type="date" 
                id="modal-todo-deadline"
                className="modal-input-date"
                value={props.deadline}
                onChange={(e) => props.setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-solid-cancel" onClick={props.onClose}>취소</button>
            <button type="submit" className="btn-solid-submit">{props.todoId ? '수정 완료' : '추가하기'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TodoModal
