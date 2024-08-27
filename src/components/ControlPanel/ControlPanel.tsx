import * as React from 'react';
import {useState} from 'react'

import { VisibilityType, VisibilityProps } from '@/types/interfaces';


function ControlPanel({visibility, setVisibility} : VisibilityProps) {
  const categories = ['proposed', 'planned', 'active', 'completed'];
  const colors : {[key: string]: string} = {
    'proposed': 'magenta',
    'planned': 'blue',
    'active': 'red',
    'completed': 'green'
  };
  const onVisibilityChange = (name : string, value : boolean) => {
    console.log(name + " " + value);
    setVisibility({...visibility, [name]: value});
  };
  const [bar, setBar] = useState({ isHidden: true });
  function toggleHidden() {
      setBar({ isHidden: !bar.isHidden });
  }
  // const style = { display: bar.isHidden ? 'none' : 'flex' };
  const myClassName = "px-2 md:w-1/4 flex-row md:justify-center " + (bar.isHidden ? "hidden md:flex" : "flex");
  
  return (
    <div className="control-panel-ctrl top-28 md:top-0 mx-auto w-2/5 md:w-1/3 inset-x-0 bg-slate-200 flex flex-col md:flex-row flex-wrap justify-between absolute shadow-xl rounded-m">
      <button className="md:hidden" onClick={() => {toggleHidden()}}>Filters <i className={bar.isHidden ? "arrow right" : "arrow down"}></i></button>
      {categories.map(name => (
        <div key={name} className={myClassName} style={Object.assign({}, {color: colors[name]}, {})}>
          <input className="pr-2 my-1 align-middle"
            type="checkbox"
            checked={visibility[name]}
            // onChange={evt => setVisibility(evt.target.checked)}
            onChange={evt => onVisibilityChange(name, evt.target.checked)}
          />
          <label className='text-sm md:text-[1vw] pl-2 my-1 align-middle capitalize' >{name}</label>
        </div>
      ))}
    </div>
  );
}

export default React.memo(ControlPanel);