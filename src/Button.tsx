/// <reference types="@lynx-js/react" />
import { useState } from '@lynx-js/react'
import '@tamer4lynx/tamer-icons'
import type { IconSet } from '@tamer4lynx/tamer-icons'
import type { ViewProps } from '@lynx-js/types'
import { px } from './index.js'
import { useM3ThemeTokens, type M3ThemeTokens } from './theme.js'

/**
 * M3 common buttons per https://m3.material.io/components/buttons/specs
 * and https://raw.githubusercontent.com/material-components/material-components-android/refs/heads/master/docs/components/CommonButton.md
 *
 * - filled:   colorPrimary / colorOnPrimary, elevation 2dp
 * - tonal:    secondaryContainer / onSecondaryContainer, elevation 2dp
 * - elevated: surfaceContainerLow / onSurface, elevation 1dp, no stroke
 * - outlined: transparent, onSurface, 1dp stroke = onSurface @ 12% opacity
 * - text:     transparent, onSurface
 */
export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ButtonShape = 'round' | 'square'

export interface ButtonProps extends ViewProps {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  icon?: string
  iconSet?: IconSet
  disabled?: boolean
  selected?: boolean
  onTap?: () => void
  /** Override M3 colors */
  colors?: {
    container?: string
    label?: string
    outline?: string
    icon?: string
  }
}

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 96,
  xl: 136,
}

const SIZE_PADDING_X: Record<ButtonSize, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 48,
  xl: 64,
}

const SIZE_GAP: Record<ButtonSize, number> = {
  xs: 4,
  sm: 8,
  md: 8,
  lg: 12,
  xl: 16,
}

const SIZE_FONT: Record<ButtonSize, number> = {
  xs: 14,
  sm: 14,
  md: 16,
  lg: 24,
  xl: 32,
}

const SIZE_LINE_HEIGHT: Record<ButtonSize, number> = {
  xs: 20,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
}

const SIZE_ICON: Record<ButtonSize, number> = {
  xs: 18,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 40,
}

const SHAPE_RADIUS: Record<ButtonSize, { round: number; square: number; pressed: number }> = {
  xs: { round: 999, square: 12, pressed: 8 },
  sm: { round: 999, square: 12, pressed: 8 },
  md: { round: 999, square: 16, pressed: 12 },
  lg: { round: 999, square: 28, pressed: 16 },
  xl: { round: 999, square: 28, pressed: 16 },
}

const ELEVATION_2 = 'var(--m3-elevation-2)'

function hexToRgba(hex: string, alpha: number): string | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  return `rgba(${r},${g},${b},${alpha})`
}

/** M3 outlined stroke: colorOnSurface at 12% opacity (CommonButton.md). */
function outlinedStrokeColor(onSurface: string): string {
  return hexToRgba(onSurface, 0.12) ?? 'rgba(29, 27, 31, 0.12)'
}

function onSurfaceHex(theme: M3ThemeTokens): string {
  const o = theme.onSurface
  return typeof o === 'string' && /^#/.test(o) ? o : '#1d1b20'
}

function resolveButtonColors(
  theme: M3ThemeTokens,
  variant: ButtonVariant,
  selected: boolean,
  colors: ButtonProps['colors'],
): { bg: string; fg: string; boxShadow?: string } {
  const cBg = colors?.container
  const cFg = colors?.label ?? colors?.icon
  if (selected) {
    switch (variant) {
      case 'elevated':
      case 'filled':
        return {
          bg: cBg ?? theme.primary,
          fg: cFg ?? (variant === 'filled' ? theme.surface : theme.onPrimary),
          ...(variant === 'filled' ? { boxShadow: ELEVATION_2 } : {}),
        }
      case 'tonal':
        return {
          bg: cBg ?? 'var(--m3-secondary, #625b71)',
          fg: cFg ?? 'var(--m3-on-secondary, #ffffff)',
          boxShadow: ELEVATION_2,
        }
      case 'outlined':
        return { bg: cBg ?? theme.inverseSurface, fg: cFg ?? theme.inverseOnSurface }
      case 'text':
        return { bg: cBg ?? 'transparent', fg: cFg ?? theme.onSurface }
      default:
        break
    }
  }
  switch (variant) {
    case 'filled':
      return { bg: cBg ?? theme.primary, fg: cFg ?? theme.surface, boxShadow: ELEVATION_2 }
    case 'tonal':
      return {
        bg: cBg ?? theme.secondaryContainer,
        fg: cFg ?? theme.onSecondaryContainer,
        boxShadow: ELEVATION_2,
      }
    case 'elevated':
      return {
        bg: cBg ?? theme.surfaceContainerLow,
        fg: cFg ?? theme.onSurface,
      }
    case 'outlined':
      return { bg: cBg ?? 'transparent', fg: cFg ?? theme.onSurface }
    case 'text':
      return { bg: cBg ?? 'transparent', fg: cFg ?? theme.onSurface }
  }
}

const STATE_LAYER_COLORS: Record<ButtonVariant, string> = {
  filled: 'rgba(255,255,255,0.16)',
  outlined: 'rgba(29,27,31,0.12)',
  text: 'rgba(29,27,31,0.12)',
  elevated: 'rgba(29,27,31,0.16)',
  tonal: 'rgba(29,25,43,0.12)',
}

export function Button({
  label,
  variant = 'filled',
  size = 'sm',
  shape = 'round',
  icon,
  iconSet = 'material',
  disabled = false,
  selected = false,
  onTap,
  colors,
  style,
  ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false)
  const theme = useM3ThemeTokens()
  const resolved = resolveButtonColors(theme, variant, selected, colors)
  const { bg, fg, boxShadow } = resolved
  const height = SIZE_HEIGHT[size]
  const iconSize = SIZE_ICON[size]
  const paddingX = SIZE_PADDING_X[size]
  const gap = SIZE_GAP[size]
  const radius = SHAPE_RADIUS[size][shape]
  const disabledContainer = variant === 'text' ? 'transparent' : 'rgba(28,27,31,0.12)'
  const outlineColor = colors?.outline ?? (
    selected && variant === 'outlined'
      ? 'rgba(245, 239, 247, 0.5)'
      : outlinedStrokeColor(onSurfaceHex(theme))
  )
  const hasOutlinedBorder = variant === 'outlined'

  return (
    <view
      className={`M3Button M3Button--${variant} M3Button--${size} M3Button--${shape}${variant === 'elevated' ? ' M3ElevatedSurface' : ''}${icon ? ' M3Button--icon' : ''}${selected ? ' M3Button--selected' : ''}${pressed && !disabled ? ' M3Button--pressed' : ''}${disabled ? ' M3Button--disabled' : ''}`}
      style={{
        height: px(height),
        minWidth: px(80),
        borderRadius: px(radius),
        paddingLeft: px(paddingX),
        paddingRight: px(paddingX),
        backgroundColor: disabled ? disabledContainer : bg,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: px(gap),
        ...(boxShadow && !disabled && variant !== 'elevated' ? { boxShadow } : {}),
        ...(hasOutlinedBorder ? {
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: disabled ? 'rgba(28,27,31,0.12)' : outlineColor,
        } : {}),
        ...(style as object ?? {}),
      }}
      flatten={false}
      native-interaction-enabled={true}
      user-interaction-enabled={true}
      bindtap={disabled ? undefined : onTap}
      bindtouchstart={() => !disabled && setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
      {...rest}
    >
      {icon ? (
        <view className="M3Button-leadingIcon">
          <icon
            icon={icon}
            set={iconSet}
            size={iconSize}
            iconColor={disabled ? 'rgba(28,27,31,0.38)' : fg}
            style={{ width: px(iconSize), height: px(iconSize) }}
          />
        </view>
      ) : null}
      <text className="M3Button-label" style={{
        fontSize: px(SIZE_FONT[size]),
        fontWeight: '500',
        lineHeight: px(SIZE_LINE_HEIGHT[size]),
        color: disabled ? 'rgba(28,27,31,0.38)' : fg,
        textAlign: 'center',
      }}>{label}</text>
      <view className="M3Button-stateLayer" style={{
        backgroundColor: STATE_LAYER_COLORS[variant],
      }} />
    </view>
  )
}

// Ensures Lynx registers the component snapshot for Button when this module loads.
export function __ButtonSnapshotSeed() {
  return <Button label="seed" />
}
