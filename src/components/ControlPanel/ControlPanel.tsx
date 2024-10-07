import * as React from 'react';
import { useState, useEffect } from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { FaRegMoon, FaRegSun } from "react-icons/fa";

import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"


import './ControlPanel.css'
import { ControlPanelProps, StatusColors, StatusCategories } from '@/types/interfaces';

// function ControlPanel({visibility, setVisibility} : VisibilityProps, {toggleMapStyle, setToggleMapStyle} : MapStyleProps ) {
function ControlPanel({visibility, setVisibility, isDark, setIsDark} : ControlPanelProps) {

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
  // const myClassName = "px-2 md:w-1/4 flex-row md:justify-center " + (bar.isHidden ? "hidden md:flex" : "flex");
  const myClassName = "space-x-2"; // + (bar.isHidden ? "hidden md:flex" : "flex");
  
  return (
    <div className="control-panel-ctrl top-28 md:top-0 mx-auto w-2/5 md:w-1/3 inset-x-0 flex flex-col md:flex-row flex-wrap justify-between absolute shadow-xl rounded-m">
      {/* <label className="switch">
        <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
        <span className="slider round"></span>
      </label> */}
      <div onClick={() => setIsDark(!isDark)}>
        <input type="checkbox" checked={isDark} className="checkbox" id="checkbox" />
          <label className="checkbox-label">
            <FaRegMoon className="fa-moon" />
            <FaRegSun className="fa-sun" />
            {/* <i className="fas fa-moon"></i> */}
            {/* <i className="fas fa-sun"></i> */}
            <span className="ball"></span>
          </label>
      </div>

      {/* <button className="" onClick={() => {toggleHidden()}}>Filters <i className={bar.isHidden ? "arrow right" : "arrow down"}></i></button> */}
      <Popover onOpenChange={() => toggleHidden()}>
        <PopoverTrigger>
          Experiment status{bar.isHidden ? <FaChevronRight className='ml-1 inline'/> : <FaChevronDown className='ml-1 inline'/>}
        </PopoverTrigger>
        <PopoverContent className="w-40">
        {StatusCategories.map(status => (
          <div key={status} className={myClassName} style={Object.assign({}, {color: StatusColors[status]}, {})}>
            {/* // <label className='text-sm md:text-[1vw] pl-2 my-1 align-middle capitalize' > */}
            {/* <input className="pr-2 my-1 align-middle" */}
              <Checkbox className='align-middle'
                // type="checkbox"
                checked={visibility[status]}
                // onChange={evt => setVisibility(evt.target.checked)}
                onCheckedChange={evt => onVisibilityChange(status, evt ? true : false)}
              />
            <label className='capitalize align-middle'>{status}
            </label>
          </div>
        ))}
        </PopoverContent>
      </Popover>
      {/* {StatusCategories.map(status => (
        <div key={status} className={myClassName} style={Object.assign({}, {color: StatusColors[status]}, {})}>
          <label className='capitalize display-block align-middle'>
            <Checkbox className='align-middle display-block'
              checked={visibility[status]}
              onCheckedChange={evt => onVisibilityChange(status, evt ? true : false)}
            />
            <span className='align-middle pl-2'>{status}</span>
          </label>
        </div>
      ))} */}
    </div>
  );
}

export default React.memo(ControlPanel);