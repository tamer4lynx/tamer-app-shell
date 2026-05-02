import { useMemo } from '@lynx-js/react'
import { useInsets, useKeyboard } from '@tamer4lynx/tamer-insets'
import { TAB_BAR_VISUAL_HEIGHT } from './floatingFab.js'

/** Toolbar row only (dp); status bar is `insets.top` and is added for total AppBar chrome. */
export const DEFAULT_APP_BAR_HEIGHT_PX = 56

export type AppShellChromeHeightsInput = {
  showAppBar: boolean
  showTabBar: boolean
  /** Toolbar height excluding status bar (default `DEFAULT_APP_BAR_HEIGHT_PX`). */
  appBarHeightPx?: number
  /** Tab strip visual height excluding nav-bar inset (default `TAB_BAR_VISUAL_HEIGHT`). */
  tabBarVisualHeightPx?: number
}

/**
 * Chrome heights for custom shells that cannot use linear layout: `AB` = AppBar + status bar,
 * `TB` = tab strip + home-indicator inset. `contentMinHeightCss` = `calc(100% - AB - TB)`.
 * `AppShell` uses `display: linear` + `linearWeight` on the content slot instead.
 */
export function useAppShellChromeHeights(input: AppShellChromeHeightsInput): {
  appBarTotalPx: number
  tabBarTotalPx: number
  contentMinHeightCss: string
} {
  const insets = useInsets()
  const keyboard = useKeyboard()
  const appRow = input.appBarHeightPx ?? DEFAULT_APP_BAR_HEIGHT_PX
  const tabVisual = input.tabBarVisualHeightPx ?? TAB_BAR_VISUAL_HEIGHT
  const top = Math.round(insets.top)
  const bottom = Math.round(insets.bottom)

  const appBarTotalPx = input.showAppBar ? appRow + top : 0
  const tabBarTotalPx =
    input.showTabBar && !keyboard.visible ? tabVisual + bottom : 0

  const contentMinHeightCss = useMemo(() => {
    const ab = appBarTotalPx
    const tb = tabBarTotalPx
    // Percent of the AppShell column (Lynx root / VC bounds), not 100vh — during native stack push
    // the spoke view animates within the window; vh stays full-screen and fights the transition.
    return `calc(100% - ${ab}px - ${tb}px)`
  }, [appBarTotalPx, tabBarTotalPx])

  return { appBarTotalPx, tabBarTotalPx, contentMinHeightCss }
}
