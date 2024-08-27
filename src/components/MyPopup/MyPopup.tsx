'use client'

import Image from 'next/image';
import {Popup} from 'react-map-gl';
import {memo} from 'react';

function MyPopup({content, setContent}: {content: any, setContent: (data : any) => void}) {
    const list_fields = ['status', 'description'];

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
        <Popup
          anchor="top"
          longitude={Number(content.custom_data.longitude)}
          latitude={Number(content.custom_data.latitude)}
          onClose={() => setContent(null)}
        >
          <div className="">
          <div className="text-xl items-center text-center font-bold pb-3.5">
            <a className="outline-none" target="_blank" href={content.inspire_data.urls[0].value}>{content.inspire_data.long_name} ({content.inspire_data.normalized_name_variants[0]})</a>
          </div>
          <div className="flex items-center">
          <div className="items-left w-1/2 h-full pr-2">
          <table className="w-full">
          <tbody>
            {/* {Object.entries(content.custom_data).map(([mykey,value] : [string, any]): React.ReactNode => {
              if (typeof value !== 'object') {
                  if (list_fields.includes(mykey)) {
                    return (<tr className="even:bg-white odd:bg-slate-200" key={mykey}><td><span className="font-bold capitalize">{mykey}</span>: <span className="first-letter:capitalize inline-block" style={{color: (mykey !== "status" ? "black" : textColor(value))}}>{value}</span>
                    </td></tr>)
                  }
              }
              else {
                  return (<>
                  {Object.entries(value).map(([mykey2,value2] : [string, any]): React.ReactNode => {
                      return (<tr className="even:bg-white odd:bg-slate-200" key={mykey2}><td className="pl-3"><span className="font-bold capitalize">{mykey2}</span>: <span className="inline-block first-letter:capitalize">{value2}</span></td></tr>)
                  })}
                  </>)
              }
            })} */}
            {Object.entries(content.inspire_data).map(([mykey,value] : [string, any]): React.ReactNode => {
              if (typeof value !== 'object' && typeof value !== 'array') {
                  if (list_fields.includes(mykey)) {
                    return (<tr className="even:bg-white odd:bg-slate-200" key={mykey}><td><span className="font-bold capitalize">{mykey}</span>: <span className="first-letter:capitalize inline-block" style={{color: (mykey !== "status" ? "black" : textColor(value))}}>{value}</span>
                    </td></tr>)
                  }
              }
              // else {
              //     return (<>
              //     {Object.entries(value).map(([mykey2,value2] : [string, any]): React.ReactNode => {
              //         return (<tr className="even:bg-white odd:bg-slate-200" key={mykey2}><td className="pl-3"><span className="font-bold capitalize">{mykey2}</span>: <span className="inline-block first-letter:capitalize">{value2}</span></td></tr>)
              //     })}
              //     </>)
              // }
            })}
          </tbody>
          </table>
          </div>
          <div className="items-center w-1/2 h-full relative pl-2">
          <a className="outline-none" target="_blank" href={content.inspire_data.urls[0].value}><Image className="w-full h-auto items-center max-h-25" width={0} height={0} sizes="100vw" alt={content.inspire_data.long_name} src={content.custom_data.image} /></a>
            {/* <Image layout="fill" objectFit="contain"alt={content.id.longname} src={content.id.image} /> */}
          </div>
          </div>
          </div>
        </Popup>
          );

}

export default memo(MyPopup);