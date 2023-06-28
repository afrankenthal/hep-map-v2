import * as React from 'react';
import {useState} from 'react'
import Link from 'next/link';

function WelcomePanel() {
  const [bar, setBar] = useState({ isHidden: true });
  function toggleHidden() {
      setBar({ isHidden: !bar.isHidden });
  }
  const myClassName = (bar.isHidden ? "hidden md:block px-6 md:px-0" : "block px-6 md:px-0");

  return (
    <div className="px-0 md:px-6 py-1 control-panel mx-auto my-2 inset-x-0 md:left-2/3 w-4/6 md:w-1/4 top-1 md:top-0 absolute bg-white shadow-xl rounded-m">
      <h3 className="hidden md:block text-center font-bold">Welcome to HEP-MAP!</h3>
      <button className="block md:hidden align-center w-full" onClick={() => {toggleHidden()}}><h3 className="text-center font-bold">Welcome to HEP-MAP! <i className={bar.isHidden ? "arrow right" : "arrow down"}></i></h3></button>
      <p className={myClassName}>
        See the location of various particle physics experiments around the world! Click on a marker to learn
        more about each experiment. Please report any feedback <a className="source-link" href="mailto:afrankenthal@gmail.com">here</a>.
        {/* <span className="inline pt-0 sm:block sm:pt-3.5"></span> */}
      </p>
    </div>
  );
}

export default React.memo(WelcomePanel);
