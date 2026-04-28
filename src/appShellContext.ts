import { createContext, useContext } from '@lynx-js/react'

export interface AppShellContextValue {
  showAppBar: boolean
  showTabBar: boolean
  barHeight: number
}

type LynxContextType = ReturnType<typeof createContext>

export const AppShellContext = createContext<AppShellContextValue | null>(null) as LynxContextType

export function useAppShellContext() {
  return useContext(AppShellContext) as AppShellContextValue | null
}
