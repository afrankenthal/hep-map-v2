'use client'

import Image from 'next/image'
import {useState, useMemo, useEffect, useRef, useCallback} from 'react';
import * as React from 'react';

import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl
} from 'react-map-gl';

import Pin from './pin';
import ControlPanel from './control-panel';

const TOKEN = 'pk.eyJ1IjoiYWZyYW5rZW50aGFsIiwiYSI6ImNsaDI5cTFtaDE4anEzbXNhaTNyejFqbGoifQ.fDTJJiWcR4DJyyqsOmcixA'; // Set your mapbox token here

function FullMap({ EXPERIMENTS }) {

  const [content, setContent] = useState<any | null>(null);

  const mapRef = useRef<any | null>(null);

  const onMapLoad = useCallback(()  => {
    // if (mapRef.current) {
      const map = mapRef.current.getMap()
    // }
    //turn off option to rotate map with SHIFT+Cursor
    map.keyboard.disableRotation()
    map.touchZoomRotate.disableRotation()
  }, []);

  const [settings, setSettings] = useState({
    scrollZoom: true,
    boxZoom: true,
    dragRotate: false,
    dragPan: true,
    keyboard: true,
    doubleClickZoom: true,
    touchZoomRotate: true,
    touchPitch: false,
    minZoom: 1,
    maxZoom: 20
  });

  const pins = useMemo( () =>
      EXPERIMENTS["experiment_data"].map((experiment, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={experiment.id.longitude}
          latitude={experiment.id.latitude}
          anchor="bottom"
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setContent(experiment);
          }}
        >
          <Pin />
        </Marker>
      )),
    []
  );

  return (
    <>
      <Map
        ref={mapRef}
        onLoad={onMapLoad}
        initialViewState={{
          latitude: 80,
          longitude: -100,
          zoom: 1.0,
          bearing: 0,
          pitch: 0
        }}
        {...settings}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={TOKEN}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {pins}

        {/* {content && <MyPopup content={content} />} */}
        {content && (
          <Popup
            anchor="top"
            longitude={Number(content.id.longitude)}
            latitude={Number(content.id.latitude)}
            onClose={() => setContent(null)}
          >
            <div className="expName">
              {content.id.longname} ({content.id.shortname}) 
            </div>
            <div style={{"display": "flex", "alignItems": "center"}}>
            <div style={{"float": "left", "width": "50%", "height": "100%"}}>
              {Object.entries(content.info).map(([mykey,value] : [string, any]): React.ReactNode => {
                return (<p style={{textTransform: 'capitalize'}} key={mykey}> {mykey}: {value} </p>)
              })}
            </div>
            <div style={{"width": "50%", "height": "100%", "position": "relative", "float": "right"}}>
              <Image style={{ width: '100%', height: 'auto' }} width={0} height={0} sizes="100vw" alt={content.id.longname} src={content.id.image} />
            </div>
            </div>
          </Popup>
            )}
      </Map>

      <ControlPanel />
    </>
  );
}

export default React.memo(FullMap);