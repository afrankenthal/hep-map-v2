'use client'

import Image from 'next/image';
import {Popup} from 'react-map-gl';
import {memo} from 'react';

import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableRow} from "@/components/ui/table"

import './MyPopup.css'
import { StatusColors, StatusCategories } from '@/types/interfaces';

function MyPopup({content, setContent}: {content: any, setContent: (data : any) => void}) {
    const list_fields = ['status', 'classification', 'accelerator'];

    const makeTableRows = (data : any): React.ReactNode => {
      return Object.entries(data).map(([mykey,value] : [string, any]): React.ReactNode => {
        if (list_fields.includes(mykey)) {
          if (typeof value !== 'object' && !Array.isArray(value)) {
              return (
                <TableRow key={mykey}>
                  <TableCell className="p-2">
                    <span className="font-bold capitalize">{mykey}</span>: <span className="first-letter:capitalize inline-block" style={{color: (mykey !== "status" ? "black" : StatusColors[value])}}>{value}</span>
                  </TableCell>
                </TableRow>
              )
          }
          else if (Array.isArray(value)) {
            const line = value.map((val, idx) => <span key={idx} className="capitalize">{val} {idx < value.length-1 ? <FaChevronRight className="inline"/> : <></>} </span>);
            return (
              <TableRow key={mykey}>
                <TableCell className="p-2">
                  <span className="font-bold capitalize">{mykey}</span>: {line}
                </TableCell>
              </TableRow>
            )
          }
          else {
            return (
              <TableRow key={mykey}>
                <TableCell className="p-2">
                  <span className="font-bold capitalize">{mykey}</span>: <span className="first-letter:capitalize inline-block">{value["value"]}</span>
                </TableCell>
              </TableRow>
            )
          }
        }
      })
    };

    return (
        <Popup
          anchor="top"
          longitude={Number(content.custom_data.longitude)}
          latitude={Number(content.custom_data.latitude)}
          onClose={() => setContent(null)}
          maxWidth={"500px"}
        >
          <Card className="border-none shadow-none">
            <CardHeader className="p-0">
              <CardTitle className="text-center m-1 p-0">{content.inspire_data.legacy_name}</CardTitle>
              <CardDescription className="text-center p-0 m-1">{content.inspire_data.long_name}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap flex-col md:flex-row p-1 ml-1 mt-1 mr-1 mb-0 justify-center items-center">
              <div className='w-full md:w-1/2 pr-2'>
              <Table>
                <TableBody>
                  {makeTableRows(content.custom_data)}
                  {makeTableRows(content.inspire_data)}
                </TableBody>
              </Table>
              </div>
              <div className='w-1/2 pl-2'>
              <Image className="w-full h-auto items-center max-h-25" width={0} height={0} sizes="100vw" alt={content.inspire_data.long_name} src={content.custom_data.image_path} />
              </div>
            </CardContent>
          </Card>
          {/* <div className="">
          <div className="text-xl items-center text-center font-bold pb-3.5">
            <a className="outline-none" target="_blank" href={content.inspire_data.urls[0].value}>{content.inspire_data.long_name} ({content.inspire_data.normalized_name_variants[0]})</a>
          </div>
          <div className="flex items-center">
          <div className="items-left w-1/2 h-full pr-2">
          <table className="w-full">
          <tbody>
            {Object.entries(content.inspire_data).map(([mykey,value] : [string, any]): React.ReactNode => {
              if (typeof value !== 'object' && typeof value !== 'array') {
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
            })}
          </tbody>
          </table>
          </div>
          <div className="items-center w-1/2 h-full relative pl-2">
          <a className="outline-none" target="_blank" href={content.inspire_data.urls[0].value}><Image className="w-full h-auto items-center max-h-25" width={0} height={0} sizes="100vw" alt={content.inspire_data.long_name} src={content.custom_data.image} /></a>
          </div>
          </div>
          </div> */}
        </Popup>
          );

}

export default memo(MyPopup);