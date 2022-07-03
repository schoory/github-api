import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import './App.scss';

function App() {

  const [searchValue, setSearchValue] = useState('')
  const [responseItems, setResponseItems] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [responseStatus, setResponseStatus] = useState({ status: 200, statusText: "" })
  const [isLoading, setIsLoading] = useState(false)

  const searchRepository = async () => {
    // обнуляем значения перед выполнением
    setResponseItems([]) 
    setTotalCount(0)
    setResponseStatus({ status: 200, statusText: "" })
    // если поиск пустой - выход
    if (!searchValue.trim()) return
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${searchValue.trim()}&per_page=10`,
        { 
          headers: {
            accept: 'application/vnd.github+json'
          } 
        }  
      )
      setResponseStatus({ status: response.status, statusText: response.statusText }) // устанавливаем статус ответа
      if (response.status === 200) {
        const json = await response.json()
        setTotalCount(json.total_count) // устанавливаем общее количество
        setResponseItems(json.items) // устанавливаем репозитории
      }
    }
    catch(e) {
      setIsLoading(false)
      if (!window.navigator.onLine) return setResponseStatus({ status: 523, statusText: 'Отсутсвует подключение к интернету' })
      return setResponseStatus({ status: 500, statusText: "Что-то пошло не так" })
    }
    setIsLoading(false)
  }

  const handleInputKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') searchRepository()
  }

  return (
    <div className="api">
      <div className="api__search">
        <input 
          type='text' 
          className="api__search-input" 
          placeholder='Search' 
          value={searchValue} 
          onInput={(event: ChangeEvent<HTMLInputElement>) => setSearchValue(event.target.value)} 
          onKeyDown={handleInputKeyDown}
        />
        <span></span>
        {
          searchValue.trim()
            ? (
              <button className='api__search-btn' onClick={searchRepository}>
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
              </button>
            )
            : null
        }
      </div>
      <div className="api__table">
        <div className="api__table-header">
          <p className="api__table-count">Всего: <big>{totalCount}</big></p>
        </div>
        <div className="api__table-body">
          {
            isLoading
              ? <span className='api__table-loading' />
              : responseStatus.status !== 200
              ? (
                <p className="api__table-status">{`${responseStatus.status} - ${responseStatus.statusText}`}</p>
              )
              : responseItems.length === 0 
              ? (
                <p className="api__table-empty">Ничего не найдено</p>
              )
              : (
                <>
                  <div className="api__table-row">
                    <p className='api__table-column'>Название</p>
                    <p className='api__table-column'>Владелец</p>
                    <p className='api__table-column'>Создан</p>
                    <p className='api__table-column'>Язык</p>
                  </div>
                  {
                    responseItems.map(item => (
                      <div className="api__table-row" key={item.id}>
                        <a href={item.html_url} target="_blank" className='api__table-link'>{item.name}</a>
                        <a href={item.owner.html_url} target="_blank" className="api__table-owner">{item.owner.login}</a>
                        <p className="api__table-created">{new Date(item.created_at).toLocaleDateString()}</p>
                        <p className="api__table-language">{item.language}</p>
                      </div>
                    ))
                  }
                </>
              )
          }
        </div>
      </div>
    </div>
  );
}

export default App;
