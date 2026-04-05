/// <reference types="@lynx-js/react" />
import { useInsets } from '@tamer4lynx/tamer-insets'
import type { ReactNode } from '@lynx-js/react'
import type { ViewProps } from '@lynx-js/types'
import { useAppShellContext } from './appShellContext.js'

/**
 * M3 FAB horizontal inset from screen edge (spec).
 * @see https://m3.material.io/components/floating-action-button/specs
 */
export const FAB_FLOAT_EDGE = 16

/**
 * Matches `.M3NavBar { min-height: 80px }` — used when tab bar is visible so the FAB sits above it with FAB_FLOAT_EDGE gap.
 */
export const TAB_BAR_VISUAL_HEIGHT = 80

const FAB_MENU_TRIGGER_SIZE = 56
const FAB_MENU_STACK_GAP = 8

function px(n: number) {
  return `${Math.round(n)}px`
}

export interface FloatingFabOffsets {
  /** Distance from viewport bottom to the bottom edge of the FAB (M3: 16dp above nav / inset; + tab bar height when tab bar is shown). */
  fabBottomMargin: number
  rightMargin: number
  /** Viewport `bottom` for the menu stack column (above the FAB). */
  menuStackBottomPx: number
}

/**
 * Computes fixed positioning for a floating FAB: `FAB_FLOAT_EDGE` from the right,
 * and from the bottom: `FAB_FLOAT_EDGE` + safe-area inset, plus `TAB_BAR_VISUAL_HEIGHT` when `showTabBar` is true.
 */
export function useFloatingFabOffsets(): FloatingFabOffsets {
  const insets = useInsets()
  const shell = useAppShellContext()
  const bottomInset = Math.round(insets.bottom)
  const tabLift = shell?.showTabBar === true ? TAB_BAR_VISUAL_HEIGHT : 0
  const fabBottomMargin = FAB_FLOAT_EDGE + bottomInset + tabLift
  const rightMargin = FAB_FLOAT_EDGE
  const menuStackBottomPx = fabBottomMargin + FAB_MENU_TRIGGER_SIZE + FAB_MENU_STACK_GAP
  return { fabBottomMargin, rightMargin, menuStackBottomPx }
}

export interface FloatingFabContainerProps extends ViewProps {
  children?: ReactNode
}

/**
 * Pins children to the bottom-end of the screen with M3 spacing: 16dp from the trailing edge,
 * and 16dp + bottom safe-area above system nav when there is no tab bar; when the app shell tab bar is present,
 * adds {@link TAB_BAR_VISUAL_HEIGHT} so the FAB clears the bar (plus the same 16dp + inset rule relative to that chrome).
 */
export function FloatingFabContainer({ children, style, ...rest }: FloatingFabContainerProps) {
  const { fabBottomMargin, rightMargin } = useFloatingFabOffsets()
  return (
    <view
      className="FloatingFabContainer"
      style={{
        position: 'fixed',
        right: px(rightMargin),
        bottom: px(fabBottomMargin),
        zIndex: 10000,
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {children}
    </view>
  )
}
