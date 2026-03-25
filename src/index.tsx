/// <reference types="@lynx-js/react" />
import './app-shell.css'
import { createContext, useCallback, useContext, useState } from '@lynx-js/react'
import { useLocation } from 'react-router'
import { useInsets, useKeyboard } from '@tamer4lynx/tamer-insets'
import { useSafeAreaContext } from '@tamer4lynx/tamer-screen'
import type { IconSet } from '@tamer4lynx/tamer-icons'
import '@tamer4lynx/tamer-icons'
import type { ReactNode } from '@lynx-js/react'
import type { ViewProps } from '@lynx-js/types'

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
export interface AppShellContextValue {
  showAppBar: boolean
  showTabBar: boolean
  barHeight: number
}

export const AppShellContext = createContext<AppShellContextValue | null>(null)

export function useAppShellContext() {
  return useContext(AppShellContext)
}

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
const ACTION_ICON_SIZE = 32

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
  return (
    <view
      style={{
        height: px(effectiveBarHeight),
        ...(isSafeAreaChild ? { marginTop: `-${Math.round(insets.top)}px`, paddingTop: px(insets.top) } : {}),
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        borderBottomWidth: '1px',
        borderBottomColor: '#e0e0e0',
        zIndex: 500,
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      <view style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: px(ACTION_SIZE) }}>
        {left}
      </view>
      {children ?? (title ? <text style={{ display: 'block', width: '100%', fontWeight: 'bold', fontSize: px(18), textAlign: 'center', color: resolvedTitleColor }}>{title}</text> : <view style={{ flex: 1 }} />)}
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
}

export interface TabBarProps extends ViewProps {
  tabs: TabItem[]
  iconColor?: TabBarIconColor
}

const DEFAULT_ICON_COLOR = { active: '#FFF', inactive: '#000' }

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
  const [pressed, setPressed] = useState(false)
  const iconC = isActive ? (iconColor.active ?? DEFAULT_ICON_COLOR.active) : (iconColor.inactive ?? DEFAULT_ICON_COLOR.inactive)
  return (
    <view
      className={`AppShellTabItem${pressed ? ' AppShellTabItem--pressed' : ''}`}
      style={{ opacity: isActive ? 1 : 0.6 }}
      bindtap={onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      <icon
        icon={item.icon}
        set={item.set ?? 'material'}
        size={24}
        iconColor={iconC}
        style={{ width: px(24), height: px(24) }}
      />
      {item.label ? (
        <text style={{ marginTop: px(4), color: iconC }}>{item.label}</text>
      ) : null}
    </view>
  )
}

export function TabBar({ tabs, iconColor, style, ...rest }: TabBarProps) {
  const insets = useInsets()
  const keyboard = useKeyboard()
  const safeArea = useSafeAreaContext()
  const isSafeAreaChild = safeArea?.hasBottom ?? false
  const router = useAppShellRouter()
  const replace = router?.replace ?? (() => {})
  const location = useLocation()

  const handleTap = useCallback(
    (item: TabItem) => {
      'background only'
      if (!item.path) {
        item.onTap?.()
        return
      }
      const pathname = location.pathname || '/'
      const isCurrent = (t: TabItem) => {
        const p = t.path || '/'
        if (p === '/') return pathname === '/' || pathname === ''
        return pathname === p || pathname.startsWith(p + '/')
      }
      if (isCurrent(item)) return
      replace(item.path, { tab: true })
    },
    [replace, tabs, location.pathname]
  )

  return (
    <view
      style={{
        ...(isSafeAreaChild ? { marginBottom: `-${Math.round(insets.bottom)}px` } : {}),
        flexDirection: 'row',
        paddingLeft: px(8),
        paddingRight: px(8),
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: '1px',
        borderTopColor: '#e0e0e0',
        zIndex: 500,
        ...keyboard.visible ? { position: 'absolute', display: 'block', overflow: 'hidden', maxHeight: '0px', height: '0px', paddingBottom: '0px', paddingTop: '0px', bottom: '-50px' } : { display: 'flex', paddingBottom: px(insets.bottom), paddingTop: px(12) },
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {tabs.map((item, i) => {
        const pathname = location.pathname || '/'
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
    height: '100%',
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
