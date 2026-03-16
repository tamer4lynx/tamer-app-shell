# tamer-app-shell

App chrome: AppBar, TabBar, and Content layout for Lynx.

## Installation

```bash
npm install tamer-app-shell
```

Add to your app's dependencies and run `t4l link`. Depends on **tamer-icons**, **tamer-insets**, **tamer-router**, **tamer-screen**.

## Usage

```tsx
import {
  AppShellProvider,
  AppBar,
  TabBar,
  Content,
  Screen,
  SafeArea,
  useAppShellContext,
  useAppShellRouter,
} from 'tamer-app-shell'

// Wrap app with provider
<AppShellProvider showAppBar showTabBar barHeight={56}>
  <Screen>
    <SafeArea edges={['top', 'bottom']}>
      <AppBar
        title="My App"
        leftAction={{ icon: 'arrow_back', onTap: () => router.back() }}
        rightActions={[{ icon: 'settings', onTap: openSettings }]}
      />
      <Content>
        {children}
      </Content>
      <TabBar tabs={[{ path: '/', icon: 'home', label: 'Home' }, { path: '/about', icon: 'info', label: 'About' }]} />
    </SafeArea>
  </Screen>
</AppShellProvider>
```

Typically used via **tamer-router** `Stack` and `Tabs` layouts, which compose AppShellProvider, AppBar, TabBar, and Content internally.

## API

| Component | Props | Description |
|-----------|-------|-------------|
| `AppShellProvider` | `showAppBar?`, `showTabBar?`, `barHeight?` | Context for app chrome visibility |
| `AppBar` | `title?`, `barHeight?`, `leftAction?`, `rightActions?`, `foregroundColor?`, `actionColor?` | Top app bar |
| `TabBar` | `tabs`, `style?`, `iconColor?` | Bottom tab bar |
| `Content` | ViewProps | Main content area |
| `Screen` | ViewProps | Full-screen container (re-export from tamer-screen) |
| `SafeArea` | ViewProps, `edges?` | Safe area wrapper (re-export from tamer-screen) |

| Hook | Returns | Description |
|------|---------|-------------|
| `useAppShellContext()` | `{ showAppBar, showTabBar, barHeight } \| null` | App shell visibility |
| `useAppShellRouter()` | `{ back, canGoBack, replace } \| null` | Router integration for back/replace |

**AppBarAction:** `{ icon, set?, onTap }`

## Platform

Uses **lynx.ext.json**. Run `t4l link` after adding to your app.
