import { createContext, useContext } from '@lynx-js/react'

export interface AppShellContextValue {
  showAppBar: boolean
  showTabBar: boolean
  barHeight: number
}

export const AppShellContext = createContext<AppShellContextValue | null>(null)

export function useAppShellContext() {
  return useContext(AppShellContext)
}
