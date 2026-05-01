import type { ViewProps } from '@lynx-js/types'

export type IconSet = 'material' | 'material_symbols' | 'fontawesome' | 'fa'

export type IconElementProps = {
  icon: string
  set?: IconSet
  iconColor?: string
  size?: number
  fill?: number
} & ViewProps

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      icon: IconElementProps
    }
  }
}

declare module '@lynx-js/react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      icon: IconElementProps
    }
  }
}

export {}
