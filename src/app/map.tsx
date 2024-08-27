'use client'

import {useState, useMemo, useRef, useCallback} from 'react';
import * as React from 'react';
import Map, {NavigationControl, FullscreenControl, ScaleControl, GeolocateControl, ViewState} from 'react-map-gl';

import { VisibilityType } from '@/types/interfaces';
import ControlPanel from '../components/ControlPanel/ControlPanel';
import SearchPanel from '../components/SearchPanel/SearchPanel';
import WelcomePanel from '../components/WelcomePanel/WelcomePanel';
import MyMarker from '../components/MyMarker/MyMarker';
import MyPopup from '../components/MyPopup/MyPopup';
// import ResetMapControl from './reset-map-control'

const TOKEN = process.env.NEXT_PUBLIC_MY_MAPBOX_API_TOKEN;

function FullMap({ EXPERIMENTS } : any) {

  const [viewState, setViewState] = useState<ViewState>({
      latitude: 80,
      longitude: -100,
      zoom: 1.0,
      bearing: 0,
      pitch: 0,
      padding: {top: 0, bottom: 0, left: 0, right: 0}
  });

  const [visibility, setVisibility] = useState<VisibilityType>({
      "proposed": true,
      "planned": true,
      "active": true,
      "completed": true
  });
  // const [visibility, setVisibility] = useState(true);

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
      EXPERIMENTS["experiment_data"].map((experiment: any, index: any) => {
        if (visibility[experiment.custom_data.status])
          return (<MyMarker experiment={experiment} setContent={setContent} index={index} />)
      }),
    []
  );

  return (
    <>
      <Map
        ref={mapRef}
        onLoad={onMapLoad}
        onMove={evt => setViewState(evt.viewState)}
        {...viewState}
        {...settings}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={TOKEN}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        {/* Note: pins cannot be defined outside Map, since it does not update the visibility. TODO: understand this */}
        {/* {pins} */}
        {EXPERIMENTS["experiment_data"].map((experiment: any, index: any) => {
          if (visibility[experiment.custom_data.status])
            return (<MyMarker experiment={experiment} setContent={setContent} index={index} />)
        })}
        {/* Only draw popup if 'content' is defined (not null) */}
        {content && <MyPopup content={content} setContent={setContent} />}
      </Map>
      <ControlPanel visibility={visibility} setVisibility={setVisibility} />
      <SearchPanel data={EXPERIMENTS} viewState={viewState} setViewState={setViewState} setContent={setContent} />
      <WelcomePanel />
    </>
  );
}

export default React.memo(FullMap);