

export type VisibilityType = {
    [key: string]: boolean
}

export interface VisibilityProps {
    visibility : VisibilityType,
    setVisibility : (visibility : VisibilityType) => void
}