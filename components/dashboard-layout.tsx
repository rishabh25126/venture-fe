"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  TrendingUp,
  LayoutDashboard,
  Briefcase,
  Users,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Clock3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import api, { setApiToken } from "@/lib/api"
import { logout } from "@/lib/features/auth/authSlice"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { getFirstName, getInitials } from "@/lib/auth/route-access"

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  adminOnly?: boolean
}

const investorNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
]

const managerNavItems: NavItem[] = [
  { label: "Home", href: "/admin", icon: LayoutDashboard },
  { label: "Businesses", href: "/admin/businesses", icon: Briefcase },
  { label: "Investors", href: "/admin/investors", icon: Users },
  { label: "Owners", href: "/admin/owners", icon: UserCog, adminOnly: true },
  { label: "Requests", href: "/admin/requests", icon: Clock3 },
  { label: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { label: "Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  type?: "investor" | "admin"
  userName?: string
  userRole?: string
  title?: string
  subtitle?: string
  breadcrumbItems?: Array<{ label: string; href?: string }>
  actions?: React.ReactNode
}

export function DashboardLayout({
  children,
  type = "investor",
  userName = "User",
  userRole = "Investor",
  title,
  subtitle,
  breadcrumbItems,
  actions,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdminUser =
    authUser?.baseRole === "admin" || authUser?.baseRole === "super_admin"
  const navItems =
    type === "admin"
      ? managerNavItems.filter((item) => !item.adminOnly || isAdminUser)
      : investorNavItems

  const resolvedName = authUser?.name || userName
  const resolvedRole = authUser?.role
    ? authUser.role
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : userRole
  const firstName = getFirstName(resolvedName)
  const initials = getInitials(resolvedName)

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // Server logout failure should not block local session cleanup.
    } finally {
      setApiToken(null)
      dispatch(logout())
      setSidebarOpen(false)
      router.replace("/login")
    }
  }

  const isItemActive = (href: string) => {
    if (href === "/admin" || href === "/dashboard") {
      return pathname === href
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Irresistible
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = isItemActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {isActive ? (
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                ) : null}
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {firstName}
              </p>
              <p className="text-xs text-muted-foreground">{resolvedRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            Irresistible
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {sidebarOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed right-0 top-16 bottom-0 z-50 flex w-72 flex-col border-l border-border bg-card lg:hidden">
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive = isItemActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {firstName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {resolvedRole}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </>
      ) : null}

      <main className="min-h-screen pt-16 lg:pl-60 lg:pt-0">
        {title || subtitle || breadcrumbItems?.length || actions ? (
          <div className="border-b border-border bg-background/70 backdrop-blur">
            <div className="px-6 py-5 lg:px-8">
              {breadcrumbItems?.length ? (
                <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {breadcrumbItems.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="flex items-center gap-2"
                    >
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="transition-colors hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-foreground">{item.label}</span>
                      )}
                      {index < breadcrumbItems.length - 1 ? <span>/</span> : null}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {title ? (
                    <h1 className="text-2xl font-bold text-foreground">
                      {title}
                    </h1>
                  ) : null}
                  {subtitle ? (
                    <p className="mt-1 text-muted-foreground">{subtitle}</p>
                  ) : null}
                </div>
                {actions ? (
                  <div className="flex flex-wrap gap-3">{actions}</div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {children}
      </main>
    </div>
  )
}
