import * as React from 'react';
import { useState, useEffect } from 'react'

import './ControlPanel.css'
import { VisibilityProps, StatusColors, StatusCategories, MapStyleProps } from '@/types/interfaces';

// function ControlPanel({visibility, setVisibility} : VisibilityProps, {toggleMapStyle, setToggleMapStyle} : MapStyleProps ) {
function ControlPanel({visibility, setVisibility, isDark, setIsDark}) {

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [isDark]
);

  const onVisibilityChange = (name : string, value : boolean) => {
    // console.log(name + " " + value);
    setVisibility({...visibility, [name]: value});
  };
  const [bar, setBar] = useState({ isHidden: true });
  function toggleHidden() {
      setBar({ isHidden: !bar.isHidden });
  }
  // const style = { display: bar.isHidden ? 'none' : 'flex' };
  const myClassName = "px-2 md:w-1/4 flex-row md:justify-center " + (bar.isHidden ? "hidden md:flex" : "flex");
  
  return (
    <div className="control-panel-ctrl top-28 md:top-0 mx-auto w-2/5 md:w-1/3 inset-x-0 bg-slate-200 dark:bg-slate-800 flex flex-col md:flex-row flex-wrap justify-between absolute shadow-xl rounded-m">
      <button className="md:hidden" onClick={() => {toggleHidden()}}>Filters <i className={bar.isHidden ? "arrow right" : "arrow down"}></i></button>
      <label className="switch">
        <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
        <span className="slider round"></span>
      </label>
      {StatusCategories.map(status => (
        <div key={status} className={myClassName} style={Object.assign({}, {color: StatusColors[status]}, {})}>
          <label className='capitalize display-block align-middle'>
          {/* // <label className='text-sm md:text-[1vw] pl-2 my-1 align-middle capitalize' > */}
          {/* <input className="pr-2 my-1 align-middle" */}
            <input className='align-middle display-block'
              type="checkbox"
              checked={visibility[status]}
              // onChange={evt => setVisibility(evt.target.checked)}
              onChange={evt => onVisibilityChange(status, evt.target.checked)}
            />
            <span className='align-middle pl-2'>{status}</span>
          </label>
        </div>
      ))}
    </div>
  );
}

export default React.memo(ControlPanel);