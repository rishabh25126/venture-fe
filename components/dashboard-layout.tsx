"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  TrendingUp, 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Clock3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import api, { setApiToken } from "@/lib/api"
import { logout } from "@/lib/features/auth/authSlice"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { getFirstName, getInitials } from "@/lib/auth/route-access"

const investorNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: Briefcase },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
]

const adminNavItems = [
  { label: "Overview", href: "/admin?tab=overview", icon: LayoutDashboard, tab: "overview" },
  { label: "Businesses", href: "/admin?tab=businesses", icon: Briefcase, tab: "businesses" },
  { label: "Investors", href: "/admin?tab=investors", icon: TrendingUp, tab: "investors" },
  { label: "Requests", href: "/admin?tab=requests", icon: Clock3, tab: "requests" },
  { label: "Analytics", href: "/admin?tab=analytics", icon: TrendingUp, tab: "analytics" },
  { label: "Settings", href: "/admin?tab=settings", icon: Settings, tab: "settings" },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  type?: "investor" | "admin"
  userName?: string
  userRole?: string
}

export function DashboardLayout({ 
  children, 
  type = "investor",
  userName = "Aditya Sharma",
  userRole = "Investor"
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)
  const [currentAdminTab, setCurrentAdminTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const navItems = type === "admin" ? adminNavItems : investorNavItems

  const resolvedName = authUser?.name || userName
  const resolvedRole = authUser?.role
    ? authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)
    : userRole
  const firstName = getFirstName(resolvedName)
  const initials = getInitials(resolvedName)

  useEffect(() => {
    if (type !== "admin") return

    const params = new URLSearchParams(window.location.search)
    setCurrentAdminTab(params.get("tab") || "overview")
  }, [pathname, type])

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // Local state still needs to be cleared when the server session is already gone.
    } finally {
      setApiToken(null)
      dispatch(logout())
      setSidebarOpen(false)
      router.replace("/login")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-card border-r border-border hidden lg:flex flex-col z-40">
        {/* Logo */}
        <div className="h-16 px-5 flex items-center border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Irresistible</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = type === "admin"
              ? pathname === "/admin" && currentAdminTab === item.tab
              : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{firstName}</p>
              <p className="text-xs text-muted-foreground">{resolvedRole}</p>
                </div>
            <button 
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border z-40 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Irresistible</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed right-0 top-16 bottom-0 w-72 bg-card border-l border-border z-50 flex flex-col">
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = type === "admin"
                  ? pathname === "/admin" && currentAdminTab === item.tab
                  : pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{firstName}</p>
                  <p className="text-xs text-muted-foreground">{resolvedRole}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="lg:pl-60 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
