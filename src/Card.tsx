/// <reference types="@lynx-js/react" />
import { useState } from '@lynx-js/react'
import type { ViewProps } from '@lynx-js/types'
import { px } from './index.js'
import { useM3ThemeTokens } from './theme.js'

export type CardVariant = 'elevated' | 'filled' | 'outlined'

export interface CardProps extends ViewProps {
  variant?: CardVariant
  type?: CardVariant
  mode?: CardVariant
  disabled?: boolean
  onTap?: () => void
  colors?: {
    container?: string
    outline?: string
  }
}

const CARD_RADIUS = 12
const CARD_PADDING = 16

const VARIANT_STYLES: Record<CardVariant, { bg: string; borderColor?: string }> = {
  elevated: {
    bg: 'var(--m3-surface-container-low, #f7f2fa)',
  },
  filled: {
    bg: 'var(--m3-surface-container-highest, #e6e0e9)',
  },
  outlined: {
    bg: 'var(--m3-surface, #fef7ff)',
    borderColor: 'var(--m3-outline-variant, #cac4d0)',
  },
}

export function Card({
  variant,
  type,
  mode,
  disabled = false,
  onTap,
  colors,
  style,
  children,
  ...rest
}: CardProps) {
  const [pressed, setPressed] = useState(false)
  const theme = useM3ThemeTokens()
  const resolvedVariant = variant ?? type ?? mode ?? 'filled'
  const variantStyle = VARIANT_STYLES[resolvedVariant]
  const backgroundColor = colors?.container ?? (
    resolvedVariant === 'elevated' ? theme.surfaceContainerLow :
    resolvedVariant === 'filled' ? theme.surfaceContainerHighest :
    theme.surface
  )
  const borderColor = colors?.outline ?? (resolvedVariant === 'outlined' ? theme.outlineVariant : variantStyle.borderColor)

  const hasInteraction = !!onTap
  return (
    <view
      className={`M3Card M3Card--${resolvedVariant}${resolvedVariant === 'elevated' ? ' M3ElevatedSurface' : ''}${hasInteraction && pressed && !disabled ? ' M3Card--pressed' : ''}${disabled ? ' M3Card--disabled' : ''}`}
      style={{
        borderRadius: px(CARD_RADIUS),
        padding: px(CARD_PADDING),
        backgroundColor,
        ...((resolvedVariant !== 'elevated' && borderColor) ? { borderWidth: '1px', borderColor } : {}),
        ...(style as object ?? {}),
      }}
      {...(hasInteraction && !disabled ? {
        bindtap: onTap,
        bindtouchstart: () => setPressed(true),
        bindtouchend: () => setPressed(false),
        bindtouchcancel: () => setPressed(false),
      } : {})}
      {...rest}
    >
      <view className="M3Card-stateLayer" />
      {children}
    </view>
  )
}

// Ensures Lynx registers the component snapshot for Card when this module loads.
export function __CardSnapshotSeed() {
  return (
    <Card variant="filled">
      <text>seed</text>
    </Card>
  )
}
