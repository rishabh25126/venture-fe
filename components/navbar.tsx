"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  TrendingUp,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import {
  getDashboardHref,
  getFirstName,
  getInitials,
} from "@/lib/auth/route-access"
import api, { setApiToken } from "@/lib/api"
import { logout } from "@/lib/features/auth/authSlice"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const isDark = resolvedTheme === "dark"
  const dashboardHref = user ? getDashboardHref(user.role) : "/dashboard"
  const firstName = getFirstName(user?.name)
  const initials = getInitials(user?.name)

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // Server logout failure should not block local session cleanup.
    } finally {
      setApiToken(null)
      dispatch(logout())
      setIsUserMenuOpen(false)
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
        "backdrop-blur-xl border-b",
        isScrolled
          ? "bg-background/80 border-border shadow-lg shadow-black/5"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            Irresistible
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/businesses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Businesses
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {!isMounted ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : isDark ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {isLoading ? (
            <div
              className="hidden h-10 w-36 rounded-lg border border-border md:block"
              aria-hidden="true"
            />
          ) : user ? (
            <>
              <Button
                variant="outline"
                className="hidden md:flex border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                asChild
              >
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="flex h-10 items-center gap-3 rounded-lg border border-border bg-card px-3 text-left transition-colors hover:bg-secondary"
                  aria-label="Open user menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {firstName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    <Link
                      href={dashboardHref}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button
              variant="outline"
              className="hidden md:flex border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              asChild
            >
              <Link href="/login">Investor Login</Link>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-4 flex flex-col gap-2">
            <Link
              href="/"
              className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/businesses"
              className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Businesses
            </Link>
            <Link
              href="#about"
              className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-2 border-t border-border space-y-2">
              {isLoading ? null : user ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials}
                    </div>
                    <span>{firstName}</span>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button className="w-full" asChild>
                  <Link href="/login">Investor Login</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
