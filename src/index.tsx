/// <reference types="@lynx-js/react" />
import { createContext, useCallback, useContext } from '@lynx-js/react'
import { useLocation } from 'react-router'
import { useInsets, useKeyboard } from 'tamer-insets'
import { useSafeAreaContext } from 'tamer-screen'
import { Icon, type IconSet } from 'tamer-icons'
import { useTamerRouter } from 'tamer-router'
import type { ReactNode } from '@lynx-js/react'
import type { ViewProps } from '@lynx-js/types'

export { Screen, SafeArea, useSafeAreaContext } from 'tamer-screen'

const DEFAULT_BAR_HEIGHT = 56
const TAB_BAR_BASE_HEIGHT = 48

export interface AppShellContextValue {
  showAppBar: boolean
  showTabBar: boolean
  barHeight: number
}

export const AppShellContext = createContext<AppShellContextValue | null>(null)

export function useAppShellContext() {
  return useContext(AppShellContext)
}

export interface AppBarProps extends ViewProps {
  title?: string
  barHeight?: number
}

export function AppBar({ title, barHeight = DEFAULT_BAR_HEIGHT, style, children, ...rest }: AppBarProps) {
  const insets = useInsets()
  const safeArea = useSafeAreaContext()
  const isSafeAreaChild = safeArea?.hasTop ?? false
  return (
    <view
      style={{
        ...(isSafeAreaChild ? { marginTop: -insets.top } : {}),
        paddingTop: insets.top,
        minHeight: barHeight,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '16px',
        paddingRight: '16px',
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {children ?? (title ? <text style={{ fontWeight: 'bold', fontSize: 64 }}>{title}</text> : null)}
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

export interface TabBarProps extends ViewProps {
  tabs: TabItem[]
}

export function TabBar({ tabs, style, ...rest }: TabBarProps) {
  const insets = useInsets()
  const keyboard = useKeyboard()
  const safeArea = useSafeAreaContext()
  const isSafeAreaChild = safeArea?.hasBottom ?? false
  const { replace } = useTamerRouter()
  const location = useLocation()

  const handleTap = useCallback(
    (item: TabItem) => {
      'background only'
      if (item.path) replace(item.path)
      else item.onTap?.()
    },
    [replace]
  )

  if (keyboard.visible) return null

  return (
    <view
      style={{
        ...(isSafeAreaChild ? { marginBottom: -insets.bottom } : {}),
        flexDirection: 'row',
        paddingBottom: insets.bottom,
        paddingTop: 12,
        paddingLeft: 8,
        paddingRight: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {tabs.map((item, i) => {
        const isActive = item.path ? location.pathname === item.path : false
        return (
          <view
            key={i}
            bindtap={() => handleTap(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: isActive ? 1 : 0.6
            }}
          >
            <Icon name={item.icon} set={item.set ?? 'material'} size={64} color={isActive ? '#FFF' : '#000'} />
            {item.label ? (
              <text style={{ marginTop: 4, color: isActive ? '#FFF' : '#000' }}>{item.label}</text>
            ) : null}
          </view>
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
