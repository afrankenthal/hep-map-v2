import * as React from 'react';
import {useState, useRef, useCallback} from 'react';
import {
  ViewState
} from 'react-map-gl';


function SearchPanel({data, viewState, setViewState, setContent} : {data: any, viewState: ViewState, setViewState: (viewState : ViewState) => void, setContent: (data : any) => void}) {
  const [query, setQuery] = useState('Search experiment');
  const [active, setActive] = useState(false)
  const [results, setResults] = useState<Object[]>([])
  const searchRef = useRef(null) as React.MutableRefObject<HTMLInputElement | null>

  const searchFunction = (my_query : string): string[] => {
    // Object.entries(content.info).map(([mykey,value] : [string, any])
    const result : any = Array.from(data["experiment_data"].values()).filter((item: any) => item.id.shortname.toLowerCase().includes(my_query.toLowerCase()));
    // data["experiment_data"].map((experiment: any, index: any) => {
    //   if (experiment.id.shortname === my_query) {
    //     console.log("found one!")
    //     return [my_query]
    //   }
    // })
    // console.log(result)
    return result
  }

  const onLinkClick = (experiment: any) => {
    console.log('onlinkclick')
    setViewState({...viewState, 'latitude': experiment.id.latitude, 'longitude': experiment.id.longitude})
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
    <div className="p-0 mx-auto inset-x-0 md:mx-5 search-panel w-3/5 md:w-1/4 h-10 right-2 md:left-10 top-14 md:top-0 absolute shadow-xl rounded-m" ref={searchRef}>
        <input className="border-normal-text focus:outline-none border border-solid
                    box-border w-full rounded-m
                    text-normal-text text-m p-2 text-slate-600
                    dark:border-off-white dark:bg-background-dark-mode dark:text-off-white"
            type="text"
            value={query}
            onChange={onChange}
            onFocus={onFocus}
            // onClick={onClick}
            // onBlur={() => setQuery((query == "" ? "Search experiment" : query))}
         />
         {active && results.length > 0 && (
        <ul
          className="list-none overflow-hidden p-2 absolute top-full inset-x-0 min-h-100px
          bg-white dark:bg-background-dark-mode"
        >
          
          {results.map((entry: any) => {
            return (<li className="bg-white hover:bg-red-100 text-normal-text p-0 leading-4 dark:bg-background-dark-mode" key={entry.id.shortname}><a href="#" className="block h-full p-2 w-full" onClick={() => onLinkClick(entry)} >{entry.id.shortname}</a></li>)
          })}
          {/* {results.map(({ key, }) => (
            <li className="bg-white text-normal-text mt-2 leading-4 last:mb-4" key={key}>
              {console.log(key)}
              {console.log(value)}
              {key} : {value}
            </li>
          ))} */}
        </ul>
      )}
    </div>
  );
}

export default React.memo(SearchPanel);
