import * as React from 'react';

function ControlPanel() {
  return (
    <div className="control-panel">
      <h3 style={{textAlign:"center", fontWeight:"bold"}}>Welcome to HEP-MAP!</h3>
      <p>
        See the location of various particle physics experiments around the world! Click on a marker to learn
        more about each experiment. <span className="spanMobileView">Advanced functionality coming soon!</span>
      </p>
      {/* 
      <div className="source-link">
        <a
          href="https://github.com/visgl/react-map-gl/tree/7.0-release/examples/controls"
          target="_new"
        >
          View Code ↗
        </a>
      </div> */}
    </div>
  );
}

export default React.memo(ControlPanel);
