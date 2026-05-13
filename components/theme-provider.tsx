"use client"

import * as React from "react"
import {
  useTheme,
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes"

function ThemePersistenceBridge() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    if (!resolvedTheme) return

    document.cookie = `irresistible-theme=${resolvedTheme}; path=/; max-age=31536000; samesite=lax`
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemePersistenceBridge />
      {children}
    </NextThemesProvider>
  )
}
