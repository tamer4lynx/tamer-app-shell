/// <reference types="@lynx-js/react" />
import { useState } from '@lynx-js/react'
import type { IconSet } from './tamer-icons.js'
import type { ViewProps } from '@lynx-js/types'
import { px } from './index.js'
import { useM3ThemeTokens } from './theme.js'

/**
 * M3 Button Group (segmented button) per https://m3.material.io/components/button-groups/specs
 *
 * A row of connected buttons that act as a single-select or multi-select group.
 * Outlined style with shared borders, 40px height, first/last get rounded ends.
 */

export interface ButtonGroupItem {
  label?: string
  icon?: string
  iconSet?: IconSet
  value: string
}

export interface ButtonGroupProps extends ViewProps {
  items: ButtonGroupItem[]
  selected: string | string[]
  onSelect?: (value: string) => void
  /** Colors override */
  colors?: {
    outline?: string
    selectedContainer?: string
    selectedLabel?: string
    unselectedLabel?: string
  }
}

const SEG_HEIGHT = 40
const SEG_RADIUS = 20
const SEG_ICON_SIZE = 18
const SEG_PADDING_H = 12
const SEG_GAP = 8

export function ButtonGroup({
  items,
  selected,
  onSelect,
  colors,
  style,
  ...rest
}: ButtonGroupProps) {
  const theme = useM3ThemeTokens()
  const selectedSet = Array.isArray(selected) ? new Set(selected) : new Set([selected])
  const outline = colors?.outline ?? theme.outline
  const selectedBg = colors?.selectedContainer ?? theme.secondaryContainer
  const selectedFg = colors?.selectedLabel ?? theme.onSecondaryContainer
  const unselectedFg = colors?.unselectedLabel ?? theme.onSurface

  return (
    <view
      className="M3ButtonGroup"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
        borderRadius: px(SEG_RADIUS),
        borderWidth: '1px',
        borderColor: outline,
        overflow: 'hidden',
        height: px(SEG_HEIGHT),
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {items.map((item, i) => {
        const isSelected = selectedSet.has(item.value)
        return (
          <ButtonGroupSegment
            key={item.value}
            segmentWidth={`${100 / Math.max(items.length, 1)}%`}
            item={item}
            isSelected={isSelected}
            isFirst={i === 0}
            isLast={i === items.length - 1}
            selectedBg={selectedBg}
            selectedFg={selectedFg}
            unselectedFg={unselectedFg}
            outline={outline}
            onTap={() => onSelect?.(item.value)}
          />
        )
      })}
    </view>
  )
}

function ButtonGroupSegment({
  item,
  isSelected,
  isFirst,
  isLast,
  segmentWidth,
  selectedBg,
  selectedFg,
  unselectedFg,
  outline,
  onTap,
}: {
  item: ButtonGroupItem
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  segmentWidth: string
  selectedBg: string
  selectedFg: string
  unselectedFg: string
  outline: string
  onTap: () => void
}) {
  const [pressed, setPressed] = useState(false)
  const fg = isSelected ? selectedFg : unselectedFg

  return (
    <view
      className={`M3SegmentedButton${pressed ? ' M3SegmentedButton--pressed' : ''}`}
      style={{
        width: segmentWidth,
        minWidth: '0px',
        height: px(SEG_HEIGHT),
        backgroundColor: isSelected ? selectedBg : 'transparent',
        paddingLeft: px(SEG_PADDING_H),
        paddingRight: px(SEG_PADDING_H),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: px(SEG_GAP),
        ...(isFirst ? {} : { borderLeftWidth: '1px', borderLeftColor: outline }),
      }}
      bindtap={onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      {isSelected ? (
        <icon
          icon="check"
          set="material"
          size={SEG_ICON_SIZE}
          iconColor={fg}
          style={{ width: px(SEG_ICON_SIZE), height: px(SEG_ICON_SIZE) }}
        />
      ) : item.icon ? (
        <icon
          icon={item.icon}
          set={item.iconSet ?? 'material'}
          size={SEG_ICON_SIZE}
          iconColor={fg}
          style={{ width: px(SEG_ICON_SIZE), height: px(SEG_ICON_SIZE) }}
        />
      ) : null}
      {item.label ? (
        <text className="M3SegmentedButton-label" style={{
          fontSize: px(14),
          fontWeight: '500',
          lineHeight: px(20),
          color: fg,
          textAlign: 'center',
        }}>{item.label}</text>
      ) : null}
      <view className="M3SegmentedButton-stateLayer" style={{ backgroundColor: 'var(--m3-state-primary)' }} />
    </view>
  )
}
