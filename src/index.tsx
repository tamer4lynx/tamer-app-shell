/// <reference types="@lynx-js/react" />
import "./app-shell.css";
import { createContext, useContext, useState } from "@lynx-js/react";
import { useInsets, useKeyboard } from "@tamer4lynx/tamer-insets";
import { ensureContrast } from "@tamer4lynx/tamer-system-ui";
import { useSafeAreaContext } from "@tamer4lynx/tamer-screen";
import type { IconSet } from "./tamer-icons.js";
import "./tamer-icons.js";
import type { ReactNode } from "@lynx-js/react";
import type { ViewProps } from "@lynx-js/types";
import { useM3ThemeTokens } from "./theme.js";
import {
  AppShellContext,
  type AppShellContextValue,
} from "./appShellContext.js";

import { SafeArea, Screen } from "@tamer4lynx/tamer-screen";
export { Screen, SafeArea, useSafeAreaContext } from "@tamer4lynx/tamer-screen";

export interface AppShellRouterContextValue {
  back: () => void;
  canGoBack: () => boolean;
  replace: (
    route: string,
    options?: {
      mode?: string;
      direction?: string;
      tab?: boolean;
      layoutInstanceKey?: string;
    },
  ) => void;
}

type LynxContextType = ReturnType<typeof createContext>;

export const AppShellRouterContext =
  createContext<AppShellRouterContextValue | null>(null) as LynxContextType;
const AppShellChromeInsetContext = createContext(false) as LynxContextType;

export function useAppShellRouter(): AppShellRouterContextValue | null {
  return useContext(AppShellRouterContext) as AppShellRouterContextValue | null;
}

const DEFAULT_BAR_HEIGHT = 56;
export const px = (...values: number[]) =>
  values.map((value) => `${Math.round(value)}px`).join(" ");
export type { AppShellContextValue };
export { AppShellContext, useAppShellContext } from "./appShellContext.js";

export interface AppBarAction {
  icon: string;
  set?: IconSet;
  onTap: () => void;
}

export interface AppBarProps extends ViewProps {
  title?: string;
  barHeight?: number;
  leftAction?: AppBarAction | false;
  rightActions?: AppBarAction[];
  foregroundColor?: string;
  actionColor?: string;
}

const ACTION_SIZE = 48;
const ACTION_ICON_SIZE = 24;

function ActionButton({
  action,
  color = "#fff",
}: {
  action: AppBarAction;
  color?: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <view
      className={`AppShellActionButton${pressed ? " AppShellActionButton--pressed" : ""}`}
      style={{
        width: px(ACTION_SIZE),
        height: px(ACTION_SIZE),
        borderRadius: px(ACTION_SIZE / 2),
        overflow: "hidden",
      }}
      bindtap={action.onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      <icon
        icon={action.icon}
        set={action.set ?? "material"}
        size={ACTION_ICON_SIZE}
        iconColor={color}
        style={{ width: px(ACTION_ICON_SIZE), height: px(ACTION_ICON_SIZE) }}
      />
      <view className="AppShellActionButton-ripple" />
    </view>
  );
}

export function AppBar({
  title,
  barHeight = DEFAULT_BAR_HEIGHT,
  leftAction,
  rightActions = [],
  foregroundColor,
  actionColor,
  style,
  children,
  ...rest
}: AppBarProps) {
  const inAppShell = useContext(AppShellChromeInsetContext) === true;
  const insets = useInsets();
  const topInset = inAppShell ? Math.round(insets.top) : 0;
  const effectiveBarHeight = barHeight + topInset;
  const router = useAppShellRouter();
  const back = router?.back ?? (() => {});
  const canGoBack = router?.canGoBack ?? (() => false);
  const theme = useM3ThemeTokens();
  // Caller may pass an arbitrary backgroundColor via `style` that doesn't match
  // any theme token. In that case we still need a contrast safety net.
  // For pure-theme backgrounds, `theme.onSurface` is already validated by
  // `tamer-system-ui` against `theme.surface`.
  const styleBg =
    typeof style === "object" && style != null
      ? ((style as { backgroundColor?: string }).backgroundColor ?? null)
      : null;
  const barBg = styleBg ?? theme.surface ?? "#000";
  const autoForeground = ensureContrast(theme.onSurface ?? "#fff", barBg, {
    darkFallback: "#000",
    lightFallback: "#fff",
    minRatio: 4.5,
  });
  const resolvedTitleColor = foregroundColor ?? autoForeground;
  const resolvedActionColor = actionColor ?? foregroundColor ?? autoForeground;

  const showDefaultBack = leftAction === undefined && canGoBack();
  const left =
    leftAction === false ? null : leftAction ? (
      <ActionButton action={leftAction} color={resolvedActionColor} />
    ) : showDefaultBack ? (
      <ActionButton
        action={{ icon: "arrow_back", onTap: back }}
        color={resolvedActionColor}
      />
    ) : null;

  const right =
    rightActions.length > 0 ? (
      <view
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        {rightActions.map((action, i) => (
          <ActionButton key={i} action={action} color={resolvedActionColor} />
        ))}
      </view>
    ) : null;

  const hasLeft = left != null;

  let centerSlot: ReactNode;
  if (children != null) {
    centerSlot = children;
  } else if (title) {
    centerSlot = (
      <view
        style={{
          flex: 1,
          minWidth: "0px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <text
          style={{
            fontWeight: "400",
            fontSize: px(22),
            lineHeight: px(28),
            textAlign: "center",
            color: resolvedTitleColor,
          }}
        >
          {title}
        </text>
      </view>
    );
  } else {
    centerSlot = <view style={{ flex: 1 }} />;
  }

  return (
    <view
      style={{
        height: px(effectiveBarHeight),
        ...(topInset > 0 ? { paddingTop: px(topInset) } : {}),
        paddingLeft: hasLeft ? px(4) : px(16),
        paddingRight: px(4),
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        zIndex: 500,
        width: "100%",
        boxSizing: "border-box",
        ...((style as object) ?? {}),
      }}
      {...rest}
    >
      <view
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          minWidth: px(ACTION_SIZE),
        }}
      >
        {left}
      </view>
      {centerSlot}
      <view
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          minWidth: px(ACTION_SIZE),
          justifyContent: "flex-end",
        }}
      >
        {right}
      </view>
    </view>
  );
}

export interface TabItem {
  icon: string;
  set?: IconSet;
  label?: string;
  /** Controlled by the host (e.g. tamer-router): whether this tab appears selected */
  active?: boolean;
  onTap?: () => void;
}

export interface TabBarIconColor {
  active?: string;
  inactive?: string;
  labelActive?: string;
  labelInactive?: string;
  pill?: string;
}

export interface ThemeColors {
  [key: string]: string | boolean | number | null | undefined;
}

export interface TabBarProps extends ViewProps {
  tabs: TabItem[];
  iconColor?: TabBarIconColor;
  tabBarChromeHex?: string;
  themeColors?: ThemeColors | null;
}

const DEFAULT_ICON_COLOR: TabBarIconColor = {
  pill: "var(--m3-secondary-container, #e8def8)",
  active: "var(--m3-primary, #6750a4)",
  inactive: "var(--m3-on-surface-variant, #49454f)",
  labelActive: "var(--m3-primary, #6750a4)",
  labelInactive: "var(--m3-on-surface-variant, #49454f)",
};

/** M3 Navigation Bar dimensions */
const NAV_BAR_HEIGHT = 80;
const NAV_PILL_WIDTH = 64;
const NAV_PILL_HEIGHT = 32;
const NAV_PILL_RADIUS = 16;
const NAV_ICON_SIZE = 24;
const NAV_LABEL_SIZE = 12;

function TabBarItem({
  item,
  isActive,
  onTap,
  iconColor = DEFAULT_ICON_COLOR,
}: {
  item: TabItem;
  isActive: boolean;
  onTap: () => void;
  iconColor?: TabBarIconColor;
}) {
  const theme = useM3ThemeTokens();
  const [pressed, setPressed] = useState(false);
  // Active icon/label sit inside the pill so they pair with `secondaryContainer`,
  // not the bar bg. The theme tokens are pre-validated by tamer-system-ui's
  // `validateContrastPairs`, so `onSecondaryContainer` is guaranteed to contrast
  // `secondaryContainer` even when the host injects mismatched colors.
  const iconC = isActive
    ? (iconColor.active ?? theme.onSecondaryContainer ?? "#000")
    : (iconColor.inactive ?? theme.onSurfaceVariant);
  const labelC = isActive
    ? ((iconColor as any).labelActive ?? theme.onSecondaryContainer ?? "#000")
    : ((iconColor as any).labelInactive ?? theme.onSurfaceVariant);
  const pillBg = isActive
    ? ((iconColor as any).pill ?? theme.secondaryContainer)
    : "transparent";
  return (
    <view
      className={`M3NavBarItem M3NavBarItem--column${pressed ? " M3NavBarItem--pressed" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingTop: px(12),
        paddingBottom: px(16),
      }}
      bindtap={onTap}
      bindtouchstart={() => setPressed(true)}
      bindtouchend={() => setPressed(false)}
      bindtouchcancel={() => setPressed(false)}
    >
      {/* M3 active indicator: fixed-size container, pill background transitions behind the icon */}
      <view
        className="M3NavBarItem-columnPillTrack"
        style={{
          width: px(NAV_PILL_WIDTH),
          height: px(NAV_PILL_HEIGHT),
          borderRadius: px(NAV_PILL_RADIUS),
          backgroundColor: pillBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <icon
          icon={item.icon}
          set={item.set ?? "material"}
          size={NAV_ICON_SIZE}
          iconColor={iconC}
          style={{ width: px(NAV_ICON_SIZE), height: px(NAV_ICON_SIZE) }}
        />
      </view>
      {item.label ? (
        <text
          className="M3NavBarItem-label"
          style={{
            marginTop: px(4),
            color: labelC,
            fontSize: px(NAV_LABEL_SIZE),
            fontWeight: "500",
            lineHeight: px(16),
            textAlign: "center",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {item.label}
        </text>
      ) : null}
    </view>
  );
}

export function TabBar({
  tabs,
  iconColor,
  style,
  ...rest
}: TabBarProps) {
  const inAppShell = useContext(AppShellChromeInsetContext) === true;
  const insets = useInsets();
  const keyboard = useKeyboard();
  const bottomInset = inAppShell ? Math.round(insets.bottom) : 0;

  const userStyle =
    (style as Record<string, string | number> | null | undefined) ?? {};
  const { backgroundColor: userBarBackground, ...restUserStyle } = userStyle;
  const solidBarBackground =
    typeof userBarBackground === "string" && userBarBackground
      ? { backgroundColor: userBarBackground }
      : ({} as Record<string, string>);

  const hiddenStyle: ViewProps["style"] = {
    position: "absolute" as const,
    display: "block" as const,
    overflow: "hidden" as const,
    maxHeight: "0px",
    height: "0px",
    paddingBottom: "0px",
    paddingTop: "0px",
    bottom: "-50px",
    width: "100%",
    boxSizing: "border-box",
    zIndex: 500,
  };

  return (
    <view
      className="M3NavBar"
      style={{
        ...(keyboard.visible
          ? hiddenStyle
          : {
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              width: "100%",
            }),
        ...solidBarBackground,
        ...(bottomInset > 0 ? { paddingBottom: px(bottomInset) } : {}),
        ...restUserStyle,
      }}
      {...rest}
    >
      <list
        scroll-orientation="horizontal"
        list-type="single"
        span-count={1}
        preload-buffer-count={0}
        enable-scroll={tabs.length > 5}
        style={{
          width: "100%",
          height: px(NAV_BAR_HEIGHT),
          listMainAxisGap: "0px",
        }}
      >
        {tabs.map((item, i) => {
          const share = 100 / Math.max(tabs.length, 1)
          const estMain = Math.max(
            72,
            Math.floor(400 / Math.max(tabs.length, 1)),
          )
          return (
            <list-item
              key={`tab-${i}-${item.icon}-${item.label ?? ""}`}
              item-key={`tab-${i}-${item.icon}-${item.label ?? ""}`}
              estimated-main-axis-size-px={estMain}
              style={{
                width: `${share.toFixed(6)}%`,
              }}
            >
              <TabBarItem
                item={item}
                isActive={item.active === true}
                onTap={() => item.onTap?.()}
                iconColor={iconColor}
              />
            </list-item>
          )
        })}
      </list>
    </view>
  );
}

export interface ContentProps extends ViewProps {
  /**
   * When `true` (default), wraps children in a vertical `scroll-view`.
   * When `false`, children fill the flex column (use when the screen provides its own `scroll-view`).
   */
  scrollable?: boolean;
}

const CONTENT_FILL_STYLE = {
  flex: 1,
  minHeight: "0px",
  display: "flex" as const,
  flexDirection: "column" as const,
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0px",
  width: "100%",
};

export function Content({
  children,
  style,
  scrollable = true,
  ...rest
}: ContentProps) {
  if (!scrollable) {
    return (
      <view
        style={{ ...((style as object) ?? {}), ...CONTENT_FILL_STYLE }}
        native-interaction-enabled={true}
        {...rest}
      >
        {children}
      </view>
    );
  }

  const scrollStyle: ViewProps["style"] = {
    ...((style as object) ?? {}),
    width: "100%",
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0px",
    flexDirection: "column",
    justifyContent: "flex-start",
    minHeight: "0px",
  };
  return (
    <view
      style={{ ...((style as object) ?? {}), ...CONTENT_FILL_STYLE }}
      native-interaction-enabled={true}
    >
      <scroll-view
        scroll-y
        style={scrollStyle}
        native-interaction-enabled={true}
        user-interaction-enabled={true}
        {...rest}
      >
        {children}
      </scroll-view>
    </view>
  );
}

export interface TabShellProps extends ViewProps {
  /** Renders below the main area (typically `<TabBar />`). */
  tabBar: ReactNode;
}

/**
 * Column between AppBar (or top chrome) and the bottom of `SafeArea`: main area fills
 * remaining height; `tabBar` stays in layout flow at the bottom (no overlap with `zIndex`).
 */
export function TabShell({ children, tabBar, style, ...rest }: TabShellProps) {
  return (
    <view
      style={{
        ...((style as object) ?? {}),
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "0px",
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "0px",
        width: "100%",
      }}
      {...rest}
    >
      {children}
      {tabBar}
    </view>
  );
}

export interface AppShellProviderProps {
  children: ReactNode;
  showAppBar?: boolean;
  showTabBar?: boolean;
  barHeight?: number;
}

export function AppShellProvider({
  children,
  showAppBar = true,
  showTabBar = false,
  barHeight = DEFAULT_BAR_HEIGHT,
}: AppShellProviderProps) {
  const value: AppShellContextValue = { showAppBar, showTabBar, barHeight };
  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  );
}

export interface AppShellProps extends ViewProps {
  children: ReactNode;
  appBar?: ReactNode;
  tabBar?: ReactNode;
  router?: AppShellRouterContextValue | null;
  /**
   * Which edges `SafeArea` pads. Omitted: all four, then `top` is dropped when `appBar` is set and
   * `bottom` when `tabBar` is set (chrome applies system insets; avoids double top/bottom padding).
   * Pass a custom list to override; chrome stripping still applies when `appBar` / `tabBar` present.
   */
  safeAreaEdges?: Array<"top" | "right" | "bottom" | "left">;
  backgroundColor?: string;
}

const ALL_SAFE_EDGES: Array<"top" | "right" | "bottom" | "left"> = [
  "top",
  "bottom",
  "left",
  "right",
];

export function resolveAppShellSafeAreaEdges(
  userEdges: AppShellProps["safeAreaEdges"] | undefined,
  appBar: ReactNode,
  tabBar: ReactNode,
): Array<"top" | "right" | "bottom" | "left"> {
  const base = userEdges ?? ALL_SAFE_EDGES;
  let next = base;
  if (appBar) {
    next = next.filter((e) => e !== "top");
  }
  if (tabBar) {
    next = next.filter((e) => e !== "bottom");
  }
  return next;
}

/**
 * Full-screen app chrome composition: edge-to-edge `Screen`, inset-aware `SafeArea`,
 * optional top app bar, flexible content area, and optional bottom tab bar.
 */
export function AppShell({
  children,
  appBar,
  tabBar,
  router,
  safeAreaEdges,
  backgroundColor,
  style,
  ...rest
}: AppShellProps) {
  const resolvedSafeAreaEdges = resolveAppShellSafeAreaEdges(
    safeAreaEdges,
    appBar,
    tabBar,
  );
  const content = (
    <Screen>
      <SafeArea
        edges={resolvedSafeAreaEdges}
        style={{
          ...((style as object) ?? {}),
          ...(backgroundColor ? { backgroundColor } : {}),
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        {...rest}
      >
        <AppShellChromeInsetContext.Provider value={true}>
          <view
            style={{
              flex: 1,
              minHeight: "0px",
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            {appBar}
            <view
              style={{
                flex: 1,
                minHeight: "0px",
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              {children}
            </view>
            {tabBar}
          </view>
        </AppShellChromeInsetContext.Provider>
      </SafeArea>
    </Screen>
  );

  if (router == null) return content;

  const RouterProvider = AppShellRouterContext.Provider as any;
  return <RouterProvider value={router}>{content}</RouterProvider>;
}

// ── M3 Component Exports ──
export { Button } from "./Button.js";
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonShape,
} from "./Button.js";
export { ButtonGroup } from "./ButtonGroup.js";
export type { ButtonGroupProps, ButtonGroupItem } from "./ButtonGroup.js";
export { Fab, ExtendedFab, FabMenu } from "./Fab.js";
export type {
  FabProps,
  FabSize,
  ExtendedFabProps,
  FabMenuProps,
  FabMenuItem,
} from "./Fab.js";
export { NavigationDrawer } from "./NavigationDrawer.js";
export type {
  NavigationDrawerProps,
  DrawerItem,
  DrawerSection,
} from "./NavigationDrawer.js";
export { NavigationRail } from "./NavigationRail.js";
export type { NavigationRailProps, NavRailItem } from "./NavigationRail.js";
export { Card } from "./Card.js";
export type { CardProps, CardVariant } from "./Card.js";

// Ensures Lynx registers snapshots for app-shell components that often render
// inside overlay/main-thread paths before the user navigates to them.
export function __AppShellSnapshotSeed() {
  return (
    <>
      <AppBar title="seed" />
      <TabBar
        tabs={[{ icon: "home", label: "Home", active: true, onTap: () => {} }]}
      />
    </>
  );
}
export {
  FAB_FLOAT_EDGE,
  FloatingFabContainer,
  FloatingFabMenuHost,
  TAB_BAR_VISUAL_HEIGHT,
  useFloatingFabOffsets,
} from "./floatingFab.js";
export type {
  FloatingFabContainerProps,
  FloatingFabMenuHostProps,
  FloatingFabOffsets,
} from "./floatingFab.js";
