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
  GeolocateControl,
  ViewState
} from 'react-map-gl';

import Pin from './pin';
import ControlPanel from './control-panel';
import SearchPanel from './search-panel';
import WelcomePanel from './welcome-panel';
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

    const categories = ['proposed', 'planned', 'active', 'concluded'];
    type VisibilityType = { [key: string]: boolean }
    const [visibility, setVisibility] = useState<VisibilityType>({
        "proposed": true,
        "planned": true,
        "active": true,
        "concluded": true
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
      EXPERIMENTS["experiment_data"].map((experiment: any, index: any) => {if (visibility[experiment.info.status]) return (
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
        {(() => {
            switch (experiment.info.status) {
            case "active":   return <Pin fill={"red"} />;
            case "concluded":   return <Pin fill={"chartreuse"} />;
            case "planned":   return <Pin fill={"aqua"} />;
            case "proposed":   return <Pin fill={"fuchsia"} />;
            default:      return <Pin fill={"gray"} />;
            }
        })()}
        </Marker>
      )}),
    []
  );

  const textColor = (status : string) => {
    switch (status) {
        case "active":   return "red";
        case "concluded":   return "green";
        case "planned":   return "blue";
        case "proposed":   return "fuchsia";
        default:      return "gray";
    }
  };

  return (
    <>
      <Map
        ref={mapRef}
        onLoad={onMapLoad}
        onMove={evt => setViewState(evt.viewState)}
        {...viewState}
        // initialViewState={{
        //   latitude: 80,
        //   longitude: -100,
        //   zoom: 1.0,
        //   bearing: 0,
        //   pitch: 0
        // }}
        {...settings}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={TOKEN}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {/* {pins} */}
        {EXPERIMENTS["experiment_data"].map((experiment: any, index: any) => {if (visibility[experiment.info.status]) return (
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
        {(() => {
            switch (experiment.info.status) {
            case "active":   return <Pin fill={"red"} />;
            case "concluded":   return <Pin fill={"chartreuse"} />;
            case "planned":   return <Pin fill={"aqua"} />;
            case "proposed":   return <Pin fill={"fuchsia"} />;
            default:      return <Pin fill={"gray"} />;
            }
        })()}
        </Marker>
      )})}

        {console.log(visibility)}


        {/* {content && <MyPopup content={content} />} */}
        {content && (
          <Popup
            anchor="top"
            longitude={Number(content.id.longitude)}
            latitude={Number(content.id.latitude)}
            onClose={() => setContent(null)}
          >
            <div className="">
            <div className="text-xl items-center text-center font-bold pb-3.5">
              {content.id.longname} ({content.id.shortname}) 
            </div>
            <div className="flex items-center">
            <div className="items-left w-1/2 h-full pr-2">
            <table className="w-full">
            <tbody>
              {Object.entries(content.info).map(([mykey,value] : [string, any]): React.ReactNode => {
                if (typeof value !== 'object') {
                    return (<tr className="even:bg-white odd:bg-slate-200" key={mykey}><td><span className="font-bold capitalize">{mykey}</span>: <span className="first-letter:capitalize inline-block" style={{color: (mykey !== "status" ? "black" : textColor(value))}}>{value}</span>
                    </td></tr>)
                }
                else {
                    return (<>
                    {Object.entries(value).map(([mykey2,value2] : [string, any]): React.ReactNode => {
                        return (<tr className="even:bg-white odd:bg-slate-200" key={mykey2}><td className="pl-3"><span className="font-bold capitalize">{mykey2}</span>: <span className="inline-block first-letter:capitalize">{value2}</span></td></tr>)
                    })}
                    </>)
                }
              })}
            </tbody>
            </table>
            </div>
            <div className="items-center w-1/2 h-full relative pl-2">
              <Image className="w-full h-auto items-center max-h-25" width={0} height={0} sizes="100vw" alt={content.id.longname} src={content.id.image} />
              {/* <Image layout="fill" objectFit="contain"alt={content.id.longname} src={content.id.image} /> */}
            </div>
            </div>
            </div>
          </Popup>
            )}
      </Map>

      <ControlPanel visibility={visibility} setVisibility={setVisibility} />
      <SearchPanel data={EXPERIMENTS} viewState={viewState} setViewState={setViewState} setContent={setContent} />
      <WelcomePanel />
    </>
  );
}

export default React.memo(FullMap);