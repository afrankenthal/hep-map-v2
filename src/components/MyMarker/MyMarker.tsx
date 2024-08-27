import {Marker} from 'react-map-gl';
import MyPin from '../MyPin/MyPin';
import {memo} from 'react';

function MyMarker(props) {
    //{experiment, setContent, index} : {experiment: any, setContent: (data : any) => void, index: any}) {
    const {experiment, setContent, index} = props;

    return (
        <Marker
            key={`marker-${index}`}
            longitude={experiment.custom_data.longitude}
            latitude={experiment.custom_data.latitude}
            anchor="bottom"
            onClick={e => {
                // If we let the click event propagates to the map, it will immediately close the popup
                // with `closeOnClick: true`
                e.originalEvent.stopPropagation();
                setContent(experiment);
            }}
            >
            {(() => {
                switch (experiment.custom_data.status) {
                    case "active":   return <MyPin fill={"red"} />;
                    case "completed":   return <MyPin fill={"chartreuse"} />;
                    case "planned":   return <MyPin fill={"aqua"} />;
                    case "proposed":   return <MyPin fill={"fuchsia"} />;
                    default:      return <MyPin fill={"gray"} />;
                }
            })()}
            </Marker>
        );
}

export default memo(MyMarker);