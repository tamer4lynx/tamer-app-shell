/// <reference types="@lynx-js/react" />
import type { ReactNode } from '@lynx-js/react'
import type { ViewProps } from '@lynx-js/types'

export const SCREEN_OVERLAY_LEVEL_FLOATING = 10
export const SCREEN_OVERLAY_LEVEL_DRAWER = 20

export interface ScreenScopedOverlayProps {
  children?: ReactNode
  level?: number
}

type PageOverlayProps = ViewProps & {
  visible?: boolean
  mode?: string
  level?: number
  'events-pass-through'?: boolean
  'ignore-focus'?: boolean
  'allow-pan-gesture'?: boolean
  children?: ReactNode
}

/**
 * Routes app-shell floating UI through Lynx's standard overlay primitive.
 * In tamer-navigation, overlays inside a nav-screen are screen-scoped rather than app-global.
 */
export function ScreenScopedOverlay({
  children,
  level = SCREEN_OVERLAY_LEVEL_FLOATING,
}: ScreenScopedOverlayProps) {
  return (
    <overlay
      visible={true}
      mode="page"
      level={level}
      events-pass-through={true}
      ignore-focus={true}
      allow-pan-gesture={false}
    >
      {children}
    </overlay>
  )
}

declare module '@lynx-js/types' {
  interface IntrinsicElements {
    overlay: PageOverlayProps
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      overlay: PageOverlayProps
    }
  }
}
