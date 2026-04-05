/// <reference types="@lynx-js/react" />
import './app-shell.css'
import { createContext, useCallback, useContext, useState } from '@lynx-js/react'
import { useInsets, useKeyboard } from '@tamer4lynx/tamer-insets'
import { useSafeAreaContext } from '@tamer4lynx/tamer-screen'
import type { IconSet } from '@tamer4lynx/tamer-icons'
import '@tamer4lynx/tamer-icons'
import type { ReactNode } from '@lynx-js/react'
import type { ViewProps } from '@lynx-js/types'
import { useM3ThemeTokens } from './theme.js'
import { AppShellContext, type AppShellContextValue } from './appShellContext.js'

import { SafeArea, Screen } from '@tamer4lynx/tamer-screen'
export { Screen, SafeArea, useSafeAreaContext } from '@tamer4lynx/tamer-screen'

export interface AppShellRouterContextValue {
  back: () => void
  canGoBack: () => boolean
  replace: (route: string, options?: { mode?: string; direction?: string; tab?: boolean }) => void
}

export const AppShellRouterContext = createContext<AppShellRouterContextValue | null>(null)

export function useAppShellRouter(): AppShellRouterContextValue | null {
  return useContext(AppShellRouterContext)
}

const DEFAULT_BAR_HEIGHT = 56
export const px = (...values: number[]) => values.map(value => `${Math.round(value)}px`).join(' ')
export type { AppShellContextValue }
export { AppShellContext, useAppShellContext } from './appShellContext.js'

export interface AppBarAction {
  icon: string
  set?: IconSet
  onTap: () => void
}

export interface AppBarProps extends ViewProps {
  title?: string
  barHeight?: number
  leftAction?: AppBarAction | false
  rightActions?: AppBarAction[]
  foregroundColor?: string
  actionColor?: string
}

const ACTION_SIZE = 48
const ACTION_ICON_SIZE = 24

function ActionButton({ action, color = '#fff' }: { action: AppBarAction; color?: string }) {
  const [pressed, setPressed] = useState(false)
  return (
    <view
      className={`AppShellActionButton${pressed ? ' AppShellActionButton--pressed' : ''}`}
      style={{
        width: px(ACTION_SIZE),
        height: px(ACTION_SIZE),
        borderRadius: px(ACTION_SIZE / 2),
        overflow: 'hidden',
      }}
      bindtap={action.onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      <icon
        icon={action.icon}
        set={action.set ?? 'material'}
        size={ACTION_ICON_SIZE}
        iconColor={color}
        style={{ width: px(ACTION_ICON_SIZE), height: px(ACTION_ICON_SIZE) }}
      />
      <view className="AppShellActionButton-ripple" />
    </view>
  )
}

export function AppBar({
  title,
  barHeight = DEFAULT_BAR_HEIGHT,
  leftAction,
  rightActions = [],
  foregroundColor = '#fff',
  actionColor,
  style,
  children,
  ...rest
}: AppBarProps) {
  const insets = useInsets()
  const safeArea = useSafeAreaContext()
  const isSafeAreaChild = safeArea?.hasTop ?? false
  const router = useAppShellRouter()
  const back = router?.back ?? (() => {})
  const canGoBack = router?.canGoBack ?? (() => false)
  const resolvedTitleColor = foregroundColor
  const resolvedActionColor = actionColor ?? foregroundColor

  const showDefaultBack = leftAction === undefined && canGoBack()
  const left = leftAction === false ? null : leftAction ? (
    <ActionButton action={leftAction} color={resolvedActionColor} />
  ) : showDefaultBack ? (
    <ActionButton action={{ icon: 'arrow_back', onTap: back }} color={resolvedActionColor} />
  ) : null

  const right =
    rightActions.length > 0 ? (
      <view style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        {rightActions.map((action, i) => (
          <ActionButton key={i} action={action} color={resolvedActionColor} />
        ))}
      </view>
    ) : null

  const effectiveBarHeight = isSafeAreaChild ? DEFAULT_BAR_HEIGHT + insets.top : barHeight
  const hasLeft = left != null
  return (
    <view
      style={{
        height: px(effectiveBarHeight),
        // do not use string literal use px function
        ...(isSafeAreaChild ? { marginTop: px(-Math.round(insets.top)), paddingTop: px(insets.top) } : {}),
        paddingLeft: hasLeft ? px(4) : px(16),
        paddingRight: px(4),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        zIndex: 500,
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      <view style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: px(ACTION_SIZE) }}>
        {left}
      </view>
      {children ?? (title ? <text style={{ display: 'block', width: '100%', fontWeight: '400', fontSize: px(22), lineHeight: px(28), textAlign: 'center', color: resolvedTitleColor }}>{title}</text> : <view style={{ flex: 1 }} />)}
      <view style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: px(ACTION_SIZE), justifyContent: 'flex-end' }}>
        {right}
      </view>
    </view>
  )
}

export interface TabItem {
  icon: string
  set?: IconSet
  label?: string
  path?: string
  onTap?: () => void
}

export interface TabBarIconColor {
  active?: string
  inactive?: string
  labelActive?: string
  labelInactive?: string
  pill?: string
}

export interface ThemeColors {
  [key: string]: string | boolean | number | null | undefined
}

export interface TabBarProps extends ViewProps {
  tabs: TabItem[]
  currentPath?: string
  iconColor?: TabBarIconColor
  tabBarChromeHex?: string
  themeColors?: ThemeColors | null
}

const DEFAULT_ICON_COLOR: TabBarIconColor = {
  active: 'var(--m3-on-secondary-container, #1d192b)',
  inactive: 'var(--m3-on-surface-variant, #49454f)',
  labelActive: 'var(--m3-on-surface, #1d1b20)',
  labelInactive: 'var(--m3-on-surface-variant, #49454f)',
  pill: 'var(--m3-secondary-container, #e8def8)',
}

/** M3 Navigation Bar dimensions */
const NAV_BAR_HEIGHT = 80
const NAV_PILL_WIDTH = 64
const NAV_PILL_HEIGHT = 32
const NAV_PILL_RADIUS = 16
const NAV_ICON_SIZE = 24
const NAV_LABEL_SIZE = 12

function TabBarItem({
  item,
  isActive,
  onTap,
  iconColor = DEFAULT_ICON_COLOR,
}: {
  item: TabItem
  isActive: boolean
  onTap: () => void
  iconColor?: TabBarIconColor
}) {
  const theme = useM3ThemeTokens()
  const [pressed, setPressed] = useState(false)
  const iconC = isActive
    ? (iconColor.active ?? theme.onSecondaryContainer)
    : (iconColor.inactive ?? theme.onSurfaceVariant)
  const labelC = isActive
    ? ((iconColor as any).labelActive ?? theme.onSurface)
    : ((iconColor as any).labelInactive ?? theme.onSurfaceVariant)
  const pillBg = isActive ? ((iconColor as any).pill ?? theme.secondaryContainer) : 'transparent'
  return (
    <view
      className={`M3NavBarItem M3NavBarItem--column${pressed ? ' M3NavBarItem--pressed' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingTop: px(12),
        paddingBottom: px(16),
      }}
      bindtap={onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      {/* M3 active indicator: fixed-size container, pill background transitions behind the icon */}
      <view
        className="M3NavBarItem-columnPillTrack"
        style={{
          width: px(NAV_PILL_WIDTH),
          height: px(NAV_PILL_HEIGHT),
          borderRadius: px(NAV_PILL_RADIUS),
          backgroundColor: pillBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <icon
          icon={item.icon}
          set={item.set ?? 'material'}
          size={NAV_ICON_SIZE}
          iconColor={iconC}
          style={{ width: px(NAV_ICON_SIZE), height: px(NAV_ICON_SIZE) }}
        />
      </view>
      {item.label ? (
        <text className="M3NavBarItem-label" style={{
          marginTop: px(4),
          color: labelC,
          fontSize: px(NAV_LABEL_SIZE),
          fontWeight: '500',
          lineHeight: px(16),
          textAlign: 'center',
        }}>{item.label}</text>
      ) : null}
    </view>
  )
}

export function TabBar({ tabs, currentPath, iconColor, style, ...rest }: TabBarProps) {
  const insets = useInsets()
  const keyboard = useKeyboard()
  const safeArea = useSafeAreaContext()
  const isSafeAreaChild = safeArea?.hasBottom ?? false
  const router = useAppShellRouter()
  const replace = router?.replace ?? (() => {})

  const handleTap = useCallback(
    (item: TabItem) => {
      'background only'
      if (!item.path) {
        item.onTap?.()
        return
      }
      const pathname = currentPath || '/'
      const isCurrent = (t: TabItem) => {
        const p = t.path || '/'
        if (p === '/') return pathname === '/' || pathname === ''
        return pathname === p || pathname.startsWith(p + '/')
      }
      if (isCurrent(item)) return
      replace(item.path, { tab: true })
    },
    [currentPath, replace, tabs]
  )

  return (
    <view
      className="M3NavBar"
      style={{
        ...(isSafeAreaChild ? { marginBottom: `-${Math.round(insets.bottom)}px` } : {}),
        zIndex: 500,
        ...keyboard.visible ? { position: 'absolute', display: 'block', overflow: 'hidden', maxHeight: '0px', height: '0px', paddingBottom: '0px', paddingTop: '0px', bottom: '-50px' } : { display: 'flex', paddingBottom: px(insets.bottom) },
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {tabs.map((item, i) => {
        const pathname = currentPath || '/'
        const p = item.path || '/'
        const isActive = item.path
          ? p === '/' ? pathname === '/' || pathname === '' : pathname === p || pathname.startsWith(p + '/')
          : false
        return (
          <TabBarItem
            key={i}
            item={item}
            isActive={isActive}
            onTap={() => handleTap(item)}
            iconColor={iconColor}
          />
        )
      })}
    </view>
  )
}

export interface ContentProps extends ViewProps {}

export function Content({ children, style, ...rest }: ContentProps) {
  const scrollStyle: ViewProps['style'] = {
    display: 'flex',
    flex: '1 1 100%',
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: '100%',
    ...(style as object ?? {}),
  }
  return (
    <view style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <scroll-view scroll-y style={scrollStyle} {...rest}>
        {children}
      </scroll-view>
    </view>
  )
}

export interface AppShellProviderProps {
  children: ReactNode
  showAppBar?: boolean
  showTabBar?: boolean
  barHeight?: number
}

export function AppShellProvider({
  children,
  showAppBar = true,
  showTabBar = false,
  barHeight = DEFAULT_BAR_HEIGHT,
}: AppShellProviderProps) {
  const value: AppShellContextValue = { showAppBar, showTabBar, barHeight }
  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}

// ── M3 Component Exports ──
export { Button } from './Button.js'
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonShape } from './Button.js'
export { ButtonGroup } from './ButtonGroup.js'
export type { ButtonGroupProps, ButtonGroupItem } from './ButtonGroup.js'
export { Fab, ExtendedFab, FabMenu } from './Fab.js'
export type { FabProps, FabSize, ExtendedFabProps, FabMenuProps, FabMenuItem } from './Fab.js'
export { NavigationDrawer } from './NavigationDrawer.js'
export type { NavigationDrawerProps, DrawerItem, DrawerSection } from './NavigationDrawer.js'
export { NavigationRail } from './NavigationRail.js'
export type { NavigationRailProps, NavRailItem } from './NavigationRail.js'
export { Card } from './Card.js'
export type { CardProps, CardVariant } from './Card.js'
export {
  FAB_FLOAT_EDGE,
  FloatingFabContainer,
  TAB_BAR_VISUAL_HEIGHT,
  useFloatingFabOffsets,
} from './floatingFab.js'
export type { FloatingFabContainerProps, FloatingFabOffsets } from './floatingFab.js'
