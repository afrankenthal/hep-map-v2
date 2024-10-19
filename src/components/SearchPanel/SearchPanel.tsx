import * as React from 'react';
import {useState, useRef, useCallback} from 'react';
import {ViewState} from 'react-map-gl';
import './SearchPanel.css'


function SearchPanel({data, viewState, setViewState, setContent} : {data: any, viewState: ViewState, setViewState: (viewState : ViewState) => void, setContent: (data : any) => void}) {
  const [query, setQuery] = useState('Search experiment');
  const [active, setActive] = useState(false)
  const [results, setResults] = useState<Object[]>([])
  const searchRef = useRef(null) as React.MutableRefObject<HTMLInputElement | null>

  const searchFunction = (my_query : string): string[] => {
    // Object.entries(content.info).map(([mykey,value] : [string, any])
    const result : any = Array.from(data["experiment_data"].values()).filter((item: any) => item.inspire_data.name_variants[0].toLowerCase().includes(my_query.toLowerCase()));
    return result
  }

  const onLinkClick = (experiment: any) => {
    console.log('onlinkclick')
    setViewState({...viewState, 'latitude': experiment.custom_data.latitude, 'longitude': experiment.custom_data.longitude})
    setActive(false)
    setQuery('Search experiment')
    setContent(experiment)
    setResults([])
  }

  const onClick = useCallback((event: any) => {
    console.log('onclick')
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setActive(false)
      setQuery('Search experiment')
      setResults([])
      window.removeEventListener('click', onClick)
    }
  }, [])

  const onFocus = () => {
    setActive(true)
    setQuery("")
    window.addEventListener('click', onClick)
  }

  const onChange = useCallback((event : any) => {
    const query = event.target.value
    setQuery(query)
    if (query.length) {
      setResults(searchFunction(query))
    } else {
      setResults([])
    }
  }, [])

  return (
    <div className="p-0 mx-auto inset-x-0 md:mx-5 search-panel w-3/5 md:w-1/4 h-10 right-2 md:left-10 top-14 my-2 md:top-0 absolute shadow-xl rounded-m" ref={searchRef}>
        <input 
            className="focus:outline-none border border-gray-300 border-solid box-border w-full text-m px-2 h-10 text-slate-600"
            type="text"
            value={query}
            onChange={onChange}
            onFocus={onFocus}
            // onClick={onClick}
            // onBlur={() => setQuery((query == "" ? "Search experiment" : query))}
        />
          {active && results.length > 0 && (
            <ul className="bg-white dark:bg-gray-400 list-none overflow-hidden p-2 absolute top-full inset-x-0 min-h-100p">
              {results.map((entry: any) => {
                return (
                  <li className="text-black dark:text-white bg-white dark:bg-gray-400 dark:hover:bg-red-300 hover:bg-red-100 p-0 leading-4" key={entry.inspire_data.name_variants[0]}>
                    <a href="#" className="text-black dark:text-white block h-full p-2 w-full" onClick={() => onLinkClick(entry)} >
                      {entry.inspire_data.name_variants[0]}
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
    </div>
  );
}

export default React.memo(SearchPanel);