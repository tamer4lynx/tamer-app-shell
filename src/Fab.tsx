/// <reference types="@lynx-js/react" />
import { useState } from '@lynx-js/react'
import '@tamer4lynx/tamer-icons'
import type { IconSet } from '@tamer4lynx/tamer-icons'
import type { ViewProps } from '@lynx-js/types'
import { px } from './index.js'
import { FloatingFabContainer, useFloatingFabOffsets } from './floatingFab.js'
import { useM3ThemeTokens } from './theme.js'

/**
 * M3 Floating Action Button per https://m3.material.io/components/floating-action-button/specs
 *
 * Sizes: small (40dp), regular (56dp), large (96dp)
 * Default color: primaryContainer / onPrimaryContainer
 */

export type FabSize = 'small' | 'regular' | 'large'

export interface FabProps extends ViewProps {
  icon: string
  iconSet?: IconSet
  size?: FabSize
  onTap?: () => void
  colors?: {
    container?: string
    icon?: string
  }
}

const FAB_DIMS: Record<FabSize, { size: number; icon: number; radius: number }> = {
  small:   { size: 40, icon: 24, radius: 12 },
  regular: { size: 56, icon: 24, radius: 16 },
  large:   { size: 96, icon: 36, radius: 28 },
}

export function Fab({
  icon,
  iconSet = 'material',
  size = 'regular',
  onTap,
  colors,
  style,
  ...rest
}: FabProps) {
  const [pressed, setPressed] = useState(false)
  const theme = useM3ThemeTokens()
  const d = FAB_DIMS[size]
  const bg = colors?.container ?? theme.primaryContainer
  const fg = colors?.icon ?? theme.onPrimaryContainer

  return (
    <view
      className={`M3Fab M3Fab--${size} M3ElevatedSurface${pressed ? ' M3Fab--pressed' : ''}`}
      style={{
        width: px(d.size),
        height: px(d.size),
        borderRadius: px(d.radius),
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...(style as object ?? {}),
      }}
      bindtap={onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
      {...rest}
    >
      <icon
        icon={icon}
        set={iconSet}
        size={d.icon}
        iconColor={fg}
        style={{ width: px(d.icon), height: px(d.icon) }}
      />
    </view>
  )
}

/**
 * M3 Extended FAB per https://m3.material.io/components/extended-fab/specs
 *
 * 56dp height, 16dp corner radius, optional leading icon
 * Default color: primaryContainer / onPrimaryContainer
 */

export interface ExtendedFabProps extends ViewProps {
  label: string
  icon?: string
  iconSet?: IconSet
  onTap?: () => void
  colors?: {
    container?: string
    label?: string
    icon?: string
  }
}

const EXT_FAB_HEIGHT = 56
const EXT_FAB_RADIUS = 16
const EXT_FAB_ICON = 24
const EXT_FAB_PADDING_H = 16

export function ExtendedFab({
  label,
  icon,
  iconSet = 'material',
  onTap,
  colors,
  style,
  ...rest
}: ExtendedFabProps) {
  const [pressed, setPressed] = useState(false)
  const theme = useM3ThemeTokens()
  const bg = colors?.container ?? theme.primaryContainer
  const fg = colors?.label ?? theme.onPrimaryContainer
  const iconC = colors?.icon ?? fg

  return (
    <view
      className={`M3ExtendedFab M3ElevatedSurface${pressed ? ' M3ExtendedFab--pressed' : ''}`}
      style={{
        height: px(EXT_FAB_HEIGHT),
        borderRadius: px(EXT_FAB_RADIUS),
        paddingLeft: px(EXT_FAB_PADDING_H),
        paddingRight: px(EXT_FAB_PADDING_H),
        backgroundColor: bg,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        alignSelf: 'flex-start',
        width: 'auto',
        flexGrow: 0,
        flexShrink: 0,
        overflow: 'hidden',
        ...(style as object ?? {}),
      }}
      bindtap={onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
      {...rest}
    >
      {icon ? (
        <icon
          icon={icon}
          set={iconSet}
          size={EXT_FAB_ICON}
          iconColor={iconC}
          style={{ width: px(EXT_FAB_ICON), height: px(EXT_FAB_ICON), marginRight: px(12) }}
        />
      ) : null}
      <text style={{
        fontSize: px(14),
        fontWeight: '500',
        lineHeight: px(20),
        color: fg,
        textAlign: 'center',
      }}>{label}</text>
    </view>
  )
}

/**
 * M3 FAB Menu per https://m3.material.io/components/fab-menu/specs
 *
 * A FAB that expands to show a vertical list of action items.
 */

export interface FabMenuItem {
  icon: string
  iconSet?: IconSet
  label: string
  onTap: () => void
}

export interface FabMenuProps extends ViewProps {
  icon: string
  iconSet?: IconSet
  /** When true, pins the FAB to the bottom-end of the screen with safe-area insets; menu stack sits above it. */
  floating?: boolean
  items: FabMenuItem[]
  colors?: {
    fabContainer?: string
    fabIcon?: string
    itemContainer?: string
    itemLabel?: string
    itemIcon?: string
    scrim?: string
  }
}

const MENU_ITEM_HEIGHT = 56
/** Half of height for a true pill shape (M3 speed-dial style). */
const MENU_ITEM_RADIUS = MENU_ITEM_HEIGHT / 2
const MENU_ITEM_ICON = 24
const FAB_MENU_TRIGGER_SIZE = 56
const FAB_MENU_EDGE = 16
const FAB_MENU_STACK_GAP = 8

/** Scrim + menu must beat page chrome; menu rows use `position: fixed` and may stack vs. scrim in viewport space (not inside the FAB container), so keep menu z-index above {@link FAB_MENU_SCRIM_Z}. */
const FAB_MENU_SCRIM_Z = 9999
const FAB_MENU_STACK_Z = 10050

export function FabMenu({
  icon,
  iconSet = 'material',
  floating = false,
  items,
  colors,
  style,
  ...rest
}: FabMenuProps) {
  const [open, setOpen] = useState(false)
  const [fabPressed, setFabPressed] = useState(false)
  const floatingOffsets = useFloatingFabOffsets()
  const theme = useM3ThemeTokens()
  const fabBg = colors?.fabContainer ?? theme.primaryContainer
  const fabFg = colors?.fabIcon ?? theme.onPrimaryContainer
  const itemBg = colors?.itemContainer ?? theme.secondaryContainer
  const itemFg = colors?.itemLabel ?? theme.onSecondaryContainer
  const itemIcon = colors?.itemIcon ?? theme.onSecondaryContainer
  const scrimColor = colors?.scrim ?? 'rgba(0,0,0,0.32)'

  const menuStackBottomPx = floating ? floatingOffsets.menuStackBottomPx : 80
  const menuRightPx = floating ? floatingOffsets.rightMargin : FAB_MENU_EDGE

  const shell = (
    <view style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
      {open ? (
        <view style={{
          position: 'fixed',
          right: px(menuRightPx),
          bottom: px(menuStackBottomPx),
          display: 'flex',
          flexDirection: 'column',
          gap: px(8),
          alignItems: 'flex-end',
          zIndex: FAB_MENU_STACK_Z,
        }}>
          {items.map((item, i) => (
            <FabMenuRow
              key={i}
              itemIndex={i}
              item={item}
              bg={itemBg}
              fg={itemFg}
              iconColor={itemIcon}
              onTap={() => { item.onTap(); setOpen(false) }}
            />
          ))}
        </view>
      ) : null}

      <view
        data-testid="fab-menu-trigger"
        className={`M3FabMenu-trigger M3ElevatedSurface${fabPressed ? ' M3Fab--pressed' : ''}`}
        style={{
          width: px(FAB_MENU_TRIGGER_SIZE),
          height: px(FAB_MENU_TRIGGER_SIZE),
          borderRadius: open ? px(FAB_MENU_TRIGGER_SIZE / 2) : px(16),
          backgroundColor: fabBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        bindtap={() => setOpen(!open)}
        bindtouchstart={() => setFabPressed(true)}
        bindtouchend={() => setFabPressed(false)}
        bindtouchcancel={() => setFabPressed(false)}
      >
        <icon
          icon={open ? 'close' : icon}
          set={iconSet}
          size={24}
          iconColor={fabFg}
          style={{ width: px(24), height: px(24) }}
        />
      </view>
    </view>
  )

  return (
    <>
      {open ? (
        <view
          className="M3FabMenu-scrim"
          style={{
            position: 'fixed',
            left: '0px',
            top: '0px',
            right: '0px',
            bottom: '0px',
            backgroundColor: scrimColor,
            zIndex: FAB_MENU_SCRIM_Z,
          }}
          bindtap={() => setOpen(false)}
        />
      ) : null}
      {floating ? (
        <FloatingFabContainer style={{ minWidth: px(FAB_MENU_TRIGGER_SIZE), minHeight: px(FAB_MENU_TRIGGER_SIZE), ...(style as object ?? {}) }} {...rest}>
          {shell}
        </FloatingFabContainer>
      ) : (
        <view
          style={{
            position: 'relative',
            flexShrink: 0,
            alignSelf: 'flex-end',
            zIndex: 1,
            minWidth: px(FAB_MENU_TRIGGER_SIZE),
            minHeight: px(FAB_MENU_TRIGGER_SIZE),
            ...(style as object ?? {}),
          }}
          {...rest}
        >
          {shell}
        </view>
      )}
    </>
  )
}

function FabMenuRow({
  item,
  itemIndex,
  bg,
  fg,
  iconColor,
  onTap,
}: {
  item: FabMenuItem
  itemIndex: number
  bg: string
  fg: string
  iconColor: string
  onTap: () => void
}) {
  const [pressed, setPressed] = useState(false)
  return (
    <view
      data-testid={`fab-menu-item-${itemIndex}`}
      className={`M3FabMenu-actionPill${pressed ? ' M3FabMenu-actionPill--pressed' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: px(MENU_ITEM_HEIGHT),
        minWidth: px(160),
        borderRadius: px(MENU_ITEM_RADIUS),
        backgroundColor: bg,
        paddingLeft: px(16),
        paddingRight: px(20),
        gap: px(12),
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
      }}
      bindtap={onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      <icon
        icon={item.icon}
        set={item.iconSet ?? 'material'}
        size={MENU_ITEM_ICON}
        iconColor={iconColor}
        style={{ width: px(MENU_ITEM_ICON), height: px(MENU_ITEM_ICON) }}
      />
      <text style={{
        fontSize: px(14),
        fontWeight: '500',
        lineHeight: px(20),
        color: fg,
      }}>{item.label}</text>
    </view>
  )
}
