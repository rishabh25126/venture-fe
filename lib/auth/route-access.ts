import type { User } from "@/lib/features/auth/authSlice";

export type AppRole = User["role"];

export function getDashboardHref(role?: AppRole | null) {
  if (role === "admin" || role === "owner") {
    return "/admin";
  }

  return "/dashboard";
}

export function getFirstName(name?: string | null) {
  if (!name) return "User";

  const trimmed = name.trim();
  if (!trimmed) return "User";

  return trimmed.split(/\s+/)[0];
}

export function getInitials(name?: string | null) {
  if (!name) return "U";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "U";

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

type RouteKind = "public" | "login" | "investor" | "manager" | "unknown";

function getRouteKind(pathname: string): RouteKind {
  if (pathname === "/" || pathname === "/businesses" || /^\/businesses\/[^/]+$/.test(pathname)) {
    return "public";
  }

  if (pathname === "/login") {
    return "login";
  }

  if (pathname === "/dashboard" || /^\/dashboard\/businesses\/[^/]+$/.test(pathname)) {
    return "investor";
  }

  if (pathname === "/admin") {
    return "manager";
  }

  return "unknown";
}

export function isRouteAllowed(pathname: string, user: User | null) {
  const routeKind = getRouteKind(pathname);

  if (routeKind === "public" || routeKind === "login" || routeKind === "unknown") {
    return { allowed: true, routeKind };
  }

  if (!user) {
    return { allowed: false, routeKind };
  }

  if (routeKind === "investor") {
    return { allowed: user.role === "investor", routeKind };
  }

  if (routeKind === "manager") {
    return { allowed: user.role === "admin" || user.role === "owner", routeKind };
  }

  return { allowed: true, routeKind };
}
