

export type VisibilityType = {
    [key: string]: boolean
}

export interface VisibilityProps {
    visibility : VisibilityType,
    setVisibility : (visibility : VisibilityType) => void
}

export interface MapStyleProps {
    toggleMapStyle : boolean,
    setToggleMapStyle : (toggleMapStyle : boolean) => void
}

export interface ControlPanelProps {
    visibility : VisibilityType,
    setVisibility : (visibility : VisibilityType) => void,
    isDark: boolean,
    setIsDark: (isDark : boolean) => void
  };

export interface MyMarkerProps {
    experiment: any,
    setContent: (experiment : any) => void,
    index: number
};

export const StatusCategories = ['proposed', 'planned', 'started', 'completed'];

export const StatusColors : {[key: string]: string} = {
    'proposed': 'fuchsia',
    'planned': 'blue',
    'started': 'red',
    'completed': 'green'
};