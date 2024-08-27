// import {useControl} from 'react-map-gl';

// import type {MapRef, ControlPosition} from 'react-map-gl';

// export default function ResetMapControl(props) {
//     useControl(
//       () => new MapboxDraw(props),
//       ({map}: {map: MapRef}) => {
//         map.on('draw.create', props.onCreate);
//         map.on('draw.update', props.onUpdate);
//         map.on('draw.delete', props.onDelete);
//       },
//       ({map}: {map: MapRef}) => {
//         map.off('draw.create', props.onCreate);
//         map.off('draw.update', props.onUpdate);
//         map.off('draw.delete', props.onDelete);
//       },
//       {
//         position: props.position
//       }
//     );
  
//     return null;
//   }

//   ResetMapControl.defaultProps = {
//     onCreate: () => {},
//     onUpdate: () => {},
//     onDelete: () => {}
//   };
  

// export default function ResetMapControl(props) {
//     onAdd(map){
//         this.map = map;
//         this.container = document.createElement('div');
//         this.container.className = 'my-custom-control';
//         this.container.textContent = 'My custom control';
//         return this.container;
//       }
// }