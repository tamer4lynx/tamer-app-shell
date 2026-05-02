/// <reference types="@lynx-js/react" />
import { useState } from '@lynx-js/react'
import type { IconSet } from './tamer-icons.js'
import type { ViewProps } from '@lynx-js/types'
import type { ReactNode } from '@lynx-js/react'
import { px } from './index.js'
import { useM3ThemeTokens } from './theme.js'

/**
 * TS-only navigation rail inspired by M3 proportions.
 *
 * We intentionally omit the spec active indicator pill and rely on simpler
 * icon/label emphasis so the component remains reliable without native code.
 */

export interface NavRailItem {
  icon: string
  iconSet?: IconSet
  label?: string
  value: string
  badge?: string
  dot?: boolean
  onTap?: () => void
}

export interface NavigationRailProps extends ViewProps {
  items: NavRailItem[]
  selected?: string
  /** Used only when an item has no `onTap` (legacy). Prefer `onTap` on each item. */
  onSelect?: (value: string) => void
  /** Optional FAB or menu button rendered at the top */
  top?: ReactNode
  /** Alignment of items: top, center, bottom */
  align?: 'top' | 'center' | 'bottom'
  expanded?: boolean
  colors?: {
    surface?: string
    indicator?: string
    selectedIcon?: string
    selectedLabel?: string
    inactiveIcon?: string
    inactiveLabel?: string
    badge?: string
    badgeLabel?: string
  }
}

const COLLAPSED_RAIL_WIDTH = 96
const EXPANDED_RAIL_WIDTH = 256
const RAIL_ICON_SIZE = 24
const RAIL_LABEL_SIZE = 12
const RAIL_ITEM_SPACING = 12
const COLLAPSED_LABEL_WIDTH = 80
const EXPANDED_ITEM_WIDTH = 200
const EXPANDED_LABEL_WIDTH = 120
const RAIL_INDICATOR_WIDTH = 56
const RAIL_INDICATOR_HEIGHT = 32

export function NavigationRail({
  items,
  selected,
  onSelect,
  top,
  align = 'top',
  expanded = false,
  colors,
  style,
  ...rest
}: NavigationRailProps) {
  const theme = useM3ThemeTokens()
  const surface = colors?.surface ?? theme.surface
  const justifyMap = { top: 'flex-start', center: 'center', bottom: 'flex-end' } as const
  const railWidth = expanded ? EXPANDED_RAIL_WIDTH : COLLAPSED_RAIL_WIDTH

  return (
    <view
      className={`M3NavRail${expanded ? ' M3NavRail--expanded' : ' M3NavRail--collapsed'}`}
      style={{
        width: px(railWidth),
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: expanded ? 'stretch' : 'center',
        backgroundColor: surface,
        paddingTop: px(44),
        paddingBottom: px(24),
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {/* Optional top element (FAB or menu) */}
      {top ? (
        <view
          style={{
            marginBottom: px(28),
            display: 'flex',
            alignItems: expanded ? 'flex-start' : 'center',
            justifyContent: 'center',
            paddingLeft: expanded ? px(16) : '0px',
            paddingRight: expanded ? px(16) : '0px',
            width: '100%',
          }}
        >
          {top}
        </view>
      ) : null}

      <view
        style={{
          flex: 1,
          minHeight: '0px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: expanded ? 'stretch' : 'center',
          justifyContent: justifyMap[align],
          gap: px(RAIL_ITEM_SPACING),
        }}
      >
        {items.map((item) => {
          const isActive = selected === item.value
          return (
            <NavRailItemView
              key={item.value}
              item={item}
              isActive={isActive}
              expanded={expanded}
              colors={colors}
              onTap={() => {
                if (item.onTap) {
                  item.onTap()
                  return
                }
                onSelect?.(item.value)
              }}
            />
          )
        })}
      </view>
    </view>
  )
}

function NavRailItemView({
  item,
  isActive,
  expanded,
  colors,
  onTap,
}: {
  item: NavRailItem
  isActive: boolean
  expanded: boolean
  colors?: NavigationRailProps['colors']
  onTap: () => void
}) {
  const [pressed, setPressed] = useState(false)
  const theme = useM3ThemeTokens()
  const indicator = colors?.indicator ?? theme.secondaryContainer
  const iconC = isActive
    ? (colors?.selectedIcon ?? theme.onSecondaryContainer)
    : (colors?.inactiveIcon ?? theme.onSurfaceVariant)
  const labelC = isActive
    ? (colors?.selectedLabel ?? theme.onSurface)
    : (colors?.inactiveLabel ?? theme.onSurfaceVariant)
  const badgeBg = colors?.badge ?? theme.error
  const badgeFg = colors?.badgeLabel ?? theme.onError
  const iconWithBadge = (
    <view className="M3NavRail-iconStack" style={{ width: px(RAIL_ICON_SIZE), height: px(RAIL_ICON_SIZE) }}>
      <icon
        icon={item.icon}
        set={item.iconSet ?? 'material'}
        size={RAIL_ICON_SIZE}
        iconColor={iconC}
        style={{ width: px(RAIL_ICON_SIZE), height: px(RAIL_ICON_SIZE) }}
      />
      {item.badge ? (
        <view
          className="M3NavRail-badge"
          style={{ backgroundColor: badgeBg }}
        >
          <text
            style={{
              color: badgeFg,
              fontSize: px(11),
              fontWeight: '600',
              lineHeight: px(16),
              textAlign: 'center',
              minWidth: px(16),
            }}
          >
            {item.badge}
          </text>
        </view>
      ) : item.dot ? (
        <view
          className="M3NavRail-dot"
          style={{ backgroundColor: badgeBg }}
        />
      ) : null}
    </view>
  )

  return (
    <view
      className={`M3NavRail-item${expanded ? ' M3NavRail-item--expanded' : ' M3NavRail-item--collapsed'}${pressed ? ' M3NavRail-item--pressed' : ''}`}
      style={{
        display: 'flex',
        flexDirection: expanded ? 'row' : 'column',
        alignItems: expanded ? 'flex-start' : 'center',
        justifyContent: 'center',
        width: expanded ? '100%' : px(COLLAPSED_RAIL_WIDTH),
        minHeight: expanded ? px(56) : px(56),
        paddingLeft: expanded ? px(12) : '0px',
        paddingRight: expanded ? px(12) : '0px',
        paddingTop: expanded ? '0px' : px(2),
        paddingBottom: expanded ? '0px' : px(2),
      }}
      bindtap={onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      {expanded ? (
        <view
          className={`M3NavRail-row${isActive ? ' M3NavRail-row--active' : ''}`}
          style={{
            width: px(EXPANDED_ITEM_WIDTH),
            minWidth: px(EXPANDED_ITEM_WIDTH),
            height: px(56),
            borderRadius: px(28),
            backgroundColor: isActive ? indicator : 'transparent',
            paddingLeft: px(16),
            paddingRight: px(24),
            gap: px(12),
          }}
        >
          {iconWithBadge}
          {item.label ? (
            <view
              style={{
                width: px(EXPANDED_LABEL_WIDTH),
                minWidth: px(EXPANDED_LABEL_WIDTH),
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <text
                className="M3NavRail-label"
                style={{
                  width: px(EXPANDED_LABEL_WIDTH),
                  fontSize: px(16),
                  fontWeight: isActive ? '600' : '500',
                  lineHeight: px(24),
                  color: labelC,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </text>
            </view>
          ) : null}
        </view>
      ) : (
        <>
          <view
            className="M3NavRail-indicator"
            style={{
              width: px(RAIL_INDICATOR_WIDTH),
              height: px(RAIL_INDICATOR_HEIGHT),
              backgroundColor: isActive ? indicator : 'transparent',
            }}
          >
            {iconWithBadge}
          </view>
          {item.label ? (
            <view
              style={{
                width: px(COLLAPSED_LABEL_WIDTH),
                minWidth: px(COLLAPSED_LABEL_WIDTH),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <text className="M3NavRail-label" style={{
                marginTop: px(4),
                width: px(COLLAPSED_LABEL_WIDTH),
                minWidth: px(COLLAPSED_LABEL_WIDTH),
                fontSize: px(RAIL_LABEL_SIZE),
                fontWeight: isActive ? '600' : '500',
                lineHeight: px(16),
                color: labelC,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>{item.label}</text>
            </view>
          ) : null}
        </>
      )}
    </view>
  )
}
