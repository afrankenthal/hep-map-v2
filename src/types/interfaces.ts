

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

export const StatusCategories = ['proposed', 'planned', 'started', 'completed'];

export const StatusColors : {[key: string]: string} = {
    'proposed': 'fuchsia',
    'planned': 'blue',
    'started': 'red',
    'completed': 'green'
};