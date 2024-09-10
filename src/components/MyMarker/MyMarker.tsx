import { Marker } from 'react-map-gl';
import MyPin from '../MyPin/MyPin';
import { memo } from 'react';
import { StatusColors } from '@/types/interfaces';

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
                <MyPin fill={StatusColors[experiment.custom_data.status]} />
        </Marker>
    );
}

export default memo(MyMarker);