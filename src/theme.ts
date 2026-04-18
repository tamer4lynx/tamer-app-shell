import { useThemeColors } from '@tamer4lynx/tamer-system-ui'

export interface M3ThemeTokens {
  primary: string
  onPrimary: string
  primaryContainer: string
  onPrimaryContainer: string
  secondaryContainer: string
  onSecondaryContainer: string
  surface: string
  surfaceContainer: string
  surfaceContainerLow: string
  surfaceContainerHigh: string
  surfaceContainerHighest: string
  onSurface: string
  onSurfaceVariant: string
  outline: string
  outlineVariant: string
  inverseSurface: string
  inverseOnSurface: string
  error: string
  onError: string
}

/** Hex fallbacks: Lynx `<text>` often does not resolve `var()` for `color`, so inherited white can hide labels on light FAB surfaces. */
const M3_PRIMARY_CONTAINER_LIGHT = '#eaddff'
const M3_ON_PRIMARY_CONTAINER_LIGHT = '#21005d'
const M3_PRIMARY_CONTAINER_DARK = '#4f378b'
const M3_ON_PRIMARY_CONTAINER_DARK = '#eaddff'

/** Default M3 surface roles (light / dark) — use hex here so inline `backgroundColor` on `<view>` resolves; `var()` often fails on Lynx. */
const M3_SURFACE_LIGHT = '#fef7ff'
const M3_SURFACE_DARK = '#141218'
const M3_SURFACE_CONTAINER_LIGHT = '#f3edf7'
const M3_SURFACE_CONTAINER_DARK = '#211f26'
const M3_SURFACE_CONTAINER_LOW_LIGHT = '#f7f2fa'
const M3_SURFACE_CONTAINER_LOW_DARK = '#1d1b20'
const M3_SURFACE_CONTAINER_HIGH_LIGHT = '#ece6f0'
const M3_SURFACE_CONTAINER_HIGH_DARK = '#2b2930'
const M3_SURFACE_CONTAINER_HIGHEST_LIGHT = '#e6e0e9'
const M3_SURFACE_CONTAINER_HIGHEST_DARK = '#36343b'

/** Match `resolveLayoutTheme` fallbacks in tamer-router `layoutTheme.ts` — hex so Lynx applies `backgroundColor` on `<view>`. */
const M3_SECONDARY_CONTAINER_LIGHT = '#cce8e5'
const M3_ON_SECONDARY_CONTAINER_LIGHT = '#005f5a'
const M3_SECONDARY_CONTAINER_DARK = '#1a3538'
const M3_ON_SECONDARY_CONTAINER_DARK = '#80cbc4'

function isDarkFromHex(hex: string): boolean {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
  if (!m) return false
  const n = parseInt(m[1], 16)
  const r = ((n >> 16) & 0xff) / 255
  const g = ((n >> 8) & 0xff) / 255
  const b = (n & 0xff) / 255
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return L < 0.45
}

export function useM3ThemeTokens(): M3ThemeTokens {
  const theme = useThemeColors()
  const surfaceStr = theme?.surface
  const inferredDark =
    typeof surfaceStr === 'string' && surfaceStr.startsWith('#') && isDarkFromHex(surfaceStr)
  const isDark = theme?.isDark === true || inferredDark
  const defaultPrimaryContainer = isDark ? M3_PRIMARY_CONTAINER_DARK : M3_PRIMARY_CONTAINER_LIGHT
  const defaultOnPrimaryContainer = isDark ? M3_ON_PRIMARY_CONTAINER_DARK : M3_ON_PRIMARY_CONTAINER_LIGHT
  const surface = theme?.surface ?? (isDark ? M3_SURFACE_DARK : M3_SURFACE_LIGHT)
  const onSurface = theme?.onSurface ?? 'var(--m3-on-surface, #1d1b20)'
  const surfaceContainerResolved =
    theme?.surfaceContainer ?? (isDark ? M3_SURFACE_CONTAINER_DARK : M3_SURFACE_CONTAINER_LIGHT)
  const defaultSecondaryContainer = isDark ? M3_SECONDARY_CONTAINER_DARK : M3_SECONDARY_CONTAINER_LIGHT
  const defaultOnSecondaryContainer = isDark ? M3_ON_SECONDARY_CONTAINER_DARK : M3_ON_SECONDARY_CONTAINER_LIGHT
  return {
    primary: theme?.primary ?? 'var(--m3-primary, #6750a4)',
    onPrimary: theme?.onPrimary ?? 'var(--m3-on-primary, #ffffff)',
    primaryContainer: theme?.primaryContainer ?? theme?.primaryDark ?? defaultPrimaryContainer,
    onPrimaryContainer: theme?.onPrimaryContainer ?? defaultOnPrimaryContainer,
    secondaryContainer: theme?.secondaryContainer ?? defaultSecondaryContainer,
    onSecondaryContainer: theme?.onSecondaryContainer ?? defaultOnSecondaryContainer,
    surface,
    surfaceContainer: surfaceContainerResolved,
    surfaceContainerLow:
      theme?.surfaceContainerLow ??
      theme?.surfaceContainer ??
      (isDark ? M3_SURFACE_CONTAINER_LOW_DARK : M3_SURFACE_CONTAINER_LOW_LIGHT),
    surfaceContainerHigh:
      theme?.surfaceContainerHigh ??
      (isDark ? M3_SURFACE_CONTAINER_HIGH_DARK : M3_SURFACE_CONTAINER_HIGH_LIGHT),
    surfaceContainerHighest:
      theme?.surfaceContainerHighest ??
      (isDark ? M3_SURFACE_CONTAINER_HIGHEST_DARK : M3_SURFACE_CONTAINER_HIGHEST_LIGHT),
    onSurface,
    onSurfaceVariant: theme?.onSurfaceVariant ?? 'var(--m3-on-surface-variant, #49454f)',
    outline: theme?.outline ?? 'var(--m3-outline, #79747e)',
    outlineVariant: theme?.outlineVariant ?? 'var(--m3-outline-variant, #cac4d0)',
    inverseSurface: 'var(--m3-inverse-surface, #322f35)',
    inverseOnSurface: 'var(--m3-inverse-on-surface, #f5eff7)',
    error: theme?.error ?? 'var(--m3-error, #b3261e)',
    onError: theme?.onError ?? 'var(--m3-on-error, #ffffff)',
  }
}
