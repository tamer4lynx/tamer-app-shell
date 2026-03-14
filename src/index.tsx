/// <reference types="@lynx-js/react" />
import './app-shell.css'
import { createContext, useCallback, useContext, useState } from '@lynx-js/react'
import { useLocation } from 'react-router'
import { useInsets, useKeyboard } from 'tamer-insets'
import { useSafeAreaContext } from 'tamer-screen'
import { Icon, type IconSet } from 'tamer-icons'
import { useTamerRouter } from 'tamer-router'
import type { ReactNode } from '@lynx-js/react'
import type { ViewProps } from '@lynx-js/types'

export { Screen, SafeArea, useSafeAreaContext } from 'tamer-screen'

const DEFAULT_BAR_HEIGHT = 144

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

const ACTION_SIZE = 128
const ACTION_ICON_SIZE = 72

function ActionButton({ action, color = '#fff' }: { action: AppBarAction; color?: string }) {
  const [pressed, setPressed] = useState(false)
  return (
    <view
      className={`AppShellActionButton${pressed ? ' AppShellActionButton--pressed' : ''}`}
      style={{
        width: ACTION_SIZE,
        height: ACTION_SIZE,
        borderRadius: ACTION_SIZE / 2,
        overflow: 'hidden',
      }}
      bindtap={action.onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      <Icon name={action.icon} set={action.set ?? 'material'} size={ACTION_ICON_SIZE} color={color} />
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
  const { back, canGoBack } = useTamerRouter()
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

  return (
    <view
      style={{
        height: barHeight + (isSafeAreaChild ? insets.top : 0),
        ...(isSafeAreaChild ? { marginTop: -insets.top, paddingTop: insets.top } : {}),
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      <view style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: ACTION_SIZE }}>
        {left}
      </view>
      {children ?? (title ? <text style={{ display: 'block', width: '100%', fontWeight: 'bold', fontSize: 48, textAlign: 'center', color: resolvedTitleColor }}>{title}</text> : <view style={{ flex: 1 }} />)}
      <view style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: ACTION_SIZE, justifyContent: 'flex-end' }}>
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
      <Icon name={item.icon} set={item.set ?? 'material'} size={64} color={iconC} />
      {item.label ? (
        <text style={{ marginTop: 4, color: iconC }}>{item.label}</text>
      ) : null}
    </view>
  )
}

export function TabBar({ tabs, iconColor, style, ...rest }: TabBarProps) {
  const insets = useInsets()
  const keyboard = useKeyboard()
  const safeArea = useSafeAreaContext()
  const isSafeAreaChild = safeArea?.hasBottom ?? false
  const { replace } = useTamerRouter()
  const location = useLocation()

  const handleTap = useCallback(
    (item: TabItem) => {
      'background only'
      if (!item.path) {
        item.onTap?.()
        return
      }
      const pathname = location.pathname || '/'
      const currentIdx = tabs.findIndex((t) => {
        const p = t.path || '/'
        if (p === '/') return pathname === '/' || pathname === ''
        return pathname === p || pathname.startsWith(p + '/')
      })
      const newIdx = tabs.findIndex((t) => (t.path || '/') === (item.path || '/'))
      if (currentIdx === newIdx || newIdx < 0) return
      const direction = currentIdx < 0 || newIdx > currentIdx ? 'right' : 'left'
      replace(item.path, { mode: 'scroll', direction })
    },
    [replace, tabs, location.pathname]
  )

  return (
    <view
      style={{
        ...(isSafeAreaChild ? { marginBottom: -insets.bottom } : {}),
        flexDirection: 'row',
        paddingLeft: 8,
        paddingRight: 8,
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        ...keyboard.visible ? { position: 'absolute', display: 'block', overflow: 'hidden', maxHeight: 0, height: 0, paddingBottom: 0, paddingTop: 0, bottom: -50 } : { display: 'flex', paddingBottom: insets.bottom, paddingTop: 12 },
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {tabs.map((item, i) => (
        <TabBarItem
          key={i}
          item={item}
          isActive={item.path ? location.pathname === item.path : false}
          onTap={() => handleTap(item)}
          iconColor={iconColor}
        />
      ))}
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
