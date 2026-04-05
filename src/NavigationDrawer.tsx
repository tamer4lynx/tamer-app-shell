/// <reference types="@lynx-js/react" />
import { useState } from '@lynx-js/react'
import '@tamer4lynx/tamer-icons'
import type { IconSet } from '@tamer4lynx/tamer-icons'
import { useInsets } from '@tamer4lynx/tamer-insets'
import { useSafeAreaContext } from '@tamer4lynx/tamer-screen'
import type { ViewProps } from '@lynx-js/types'
import { px } from './index.js'
import { useM3ThemeTokens } from './theme.js'

/**
 * TS-only modal navigation drawer inspired by M3 proportions.
 *
 * We intentionally avoid the spec active indicator treatment here because
 * Lynx does not render it reliably enough without native support.
 */

export interface DrawerItem {
  icon: string
  iconSet?: IconSet
  label: string
  value: string
  badge?: string
}

export interface DrawerSection {
  title?: string
  items: DrawerItem[]
}

export interface NavigationDrawerProps extends ViewProps {
  open: boolean
  onClose: () => void
  sections: DrawerSection[]
  selected?: string
  onSelect?: (value: string) => void
  headline?: string
  colors?: {
    surface?: string
    onSurface?: string
    onSurfaceVariant?: string
    selectedContainer?: string
    selectedIcon?: string
    selectedLabel?: string
    scrim?: string
  }
}

const DRAWER_WIDTH = 360
const DRAWER_RADIUS = 16
const ITEM_HEIGHT = 56
const ITEM_ICON_SIZE = 24
const ITEM_PADDING_START = 16
const ITEM_PADDING_END = 12
const DRAWER_PADDING_H = 28
const DRAWER_HEADER_INSET = 28

export function NavigationDrawer({
  open,
  onClose,
  sections,
  selected,
  onSelect,
  headline,
  colors,
  style,
  ...rest
}: NavigationDrawerProps) {
  const theme = useM3ThemeTokens()
  const insets = useInsets()
  const safeArea = useSafeAreaContext()
  const topInset = Math.round(insets.top)
  const shouldApplyTopInset = (safeArea?.hasTop ?? false) || topInset > 0
  const surface = colors?.surface ?? theme.surfaceContainerLow
  const onSurface = colors?.onSurface ?? theme.onSurface
  const onSurfaceVariant = colors?.onSurfaceVariant ?? theme.onSurfaceVariant
  const selectedContainer = colors?.selectedContainer ?? theme.secondaryContainer
  const selectedIcon = colors?.selectedIcon ?? theme.onSecondaryContainer
  const selectedLabel = colors?.selectedLabel ?? theme.onSecondaryContainer
  const scrimColor = colors?.scrim ?? 'rgba(0,0,0,0.32)'

  if (!open) return null

  return (
    <view style={{ position: 'fixed', left: '0px', top: '0px', right: '0px', bottom: '0px', zIndex: 1000, display: 'flex', flexDirection: 'row' }} {...rest}>
      {/* Drawer panel */}
      <view
        className="M3Drawer-panel"
        style={{
          width: px(DRAWER_WIDTH),
          height: '100%',
          backgroundColor: surface,
          borderTopRightRadius: px(DRAWER_RADIUS),
          borderBottomRightRadius: px(DRAWER_RADIUS),
          display: 'flex',
          flexDirection: 'column',
          ...(shouldApplyTopInset ? { paddingTop: px(insets.top/2) } : {}),
          paddingBottom: px(12),
          overflow: 'hidden',
          ...(style as object ?? {}),
        }}
      >
        {/* Headline */}
        {headline ? (
          <view style={{ paddingLeft: px(DRAWER_HEADER_INSET), paddingRight: px(DRAWER_HEADER_INSET), paddingTop: px(16), paddingBottom: px(16) }}>
            <text style={{
              fontSize: px(14),
              fontWeight: '500',
              lineHeight: px(20),
              color: onSurface,
            }}>{headline}</text>
          </view>
        ) : null}

        {/* Scrollable sections */}
        <scroll-view scroll-y style={{ flex: 1 }}>
          {sections.map((section, si) => (
            <view key={si}>
              {section.title ? (
                <view style={{ paddingLeft: px(DRAWER_HEADER_INSET), paddingRight: px(DRAWER_HEADER_INSET), paddingTop: px(si > 0 ? 12 : 8), paddingBottom: px(8) }}>
                  <text style={{
                    fontSize: px(14),
                    fontWeight: '500',
                    lineHeight: px(20),
                    color: onSurface,
                  }}>{section.title}</text>
                </view>
              ) : null}
              {/* Divider between sections */}
              {si > 0 && !section.title ? (
                <view style={{ height: '1px', backgroundColor: theme.outlineVariant, marginLeft: px(DRAWER_PADDING_H), marginRight: px(DRAWER_PADDING_H), marginTop: px(16), marginBottom: px(8) }} />
              ) : null}
              {section.items.map((item) => {
                const isActive = selected === item.value
                return (
                  <DrawerItemRow
                    key={item.value}
                    item={item}
                    isActive={isActive}
                    selectedContainer={selectedContainer}
                    selectedIcon={selectedIcon}
                    selectedLabel={selectedLabel}
                    onSurface={onSurface}
                    onSurfaceVariant={onSurfaceVariant}
                    onTap={() => onSelect?.(item.value)}
                  />
                )
              })}
            </view>
          ))}
        </scroll-view>
      </view>

      {/* Scrim */}
      <view
        className="M3Drawer-scrim"
        style={{
          flex: 1,
          height: '100%',
          backgroundColor: scrimColor,
        }}
        bindtap={onClose}
      />
    </view>
  )
}

function DrawerItemRow({
  item,
  isActive,
  selectedContainer,
  selectedIcon,
  selectedLabel,
  onSurface,
  onSurfaceVariant,
  onTap,
}: {
  item: DrawerItem
  isActive: boolean
  selectedContainer: string
  selectedIcon: string
  selectedLabel: string
  onSurface: string
  onSurfaceVariant: string
  onTap: () => void
}) {
  const [pressed, setPressed] = useState(false)
  const fg = isActive ? selectedLabel : onSurfaceVariant
  const iconC = isActive ? selectedIcon : onSurfaceVariant
  const badgeColor = isActive ? selectedLabel : onSurfaceVariant

  return (
    <view
      className={`M3NavDrawer-item${pressed ? ' M3NavDrawer-item--pressed' : ''}`}
      style={{
        height: px(ITEM_HEIGHT),
        marginLeft: px(DRAWER_PADDING_H),
        marginRight: px(DRAWER_PADDING_H),
        borderRadius: px(16),
        marginBottom: px(4),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      bindtap={onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      <view
        className="M3NavDrawer-indicator"
        style={{
          backgroundColor: isActive ? selectedContainer : 'transparent',
          paddingLeft: px(ITEM_PADDING_START),
          paddingRight: px(ITEM_PADDING_END),
          gap: px(12),
        }}
      >
        <icon
          icon={item.icon}
          set={item.iconSet ?? 'material'}
          size={ITEM_ICON_SIZE}
          iconColor={iconC}
          style={{ width: px(ITEM_ICON_SIZE), height: px(ITEM_ICON_SIZE) }}
        />
        <view style={{ flex: 1, minWidth: '0px', display: 'flex', justifyContent: 'center' }}>
          <text style={{
            width: px(188),
            fontSize: px(14),
            fontWeight: isActive ? '600' : '500',
            lineHeight: px(20),
            color: fg,
            whiteSpace: 'nowrap',
          }}>{item.label}</text>
        </view>
        {item.badge ? (
          <view style={{ minWidth: px(24), display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginLeft: px(12) }}>
            <text style={{
              fontSize: px(12),
              fontWeight: isActive ? '600' : '500',
              lineHeight: px(16),
              color: badgeColor,
              textAlign: 'right',
              whiteSpace: 'nowrap',
            }}>{item.badge}</text>
          </view>
        ) : null}
      </view>
    </view>
  )
}
