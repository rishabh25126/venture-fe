"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import api from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotFoundContent } from "@/components/not-found-content"
import { useAppSelector } from "@/lib/store/hooks"

type PermissionEntry = {
  key: string
  label: string
  description: string
  category: string
}

type RoleEntry = {
  id: string
  key: string
  name: string
  description: string
  baseRole: string | null
  isSystem: boolean
  isEditable: boolean
  permissions: string[]
}

type UserEntry = {
  id: string
  name: string
  email: string
  role: string
  baseRole: "super_admin" | "admin" | "owner" | "investor"
  permissions: string[]
  isActive: boolean
}

type UserAccessResponse = {
  user: UserEntry
  overrides: Array<{ permissionKey: string; effect: "allow" | "deny" }>
}

const ROLE_BASE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
  { value: "investor", label: "Investor" },
]

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<
    "roles" | "users" | "audit"
  >("roles")
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState("")
  const [roleForm, setRoleForm] = useState({
    name: "",
    key: "",
    description: "",
    baseRole: "owner",
    permissions: [] as string[],
  })
  const [userRoleDraft, setUserRoleDraft] = useState("")
  const [overrideDraft, setOverrideDraft] = useState<Record<string, string>>({})

  const canManageRbac = Boolean(
    user?.permissions?.includes("settings.manage_rbac")
  )
  const isSuperAdmin = user?.baseRole === "super_admin"
  const canCreateRoles = Boolean(user?.permissions?.includes("role.create"))
  const canUpdateRoles = Boolean(user?.permissions?.includes("role.update"))
  const canAssignPermissions = Boolean(
    user?.permissions?.includes("permission.assign")
  )
  const canUpdateUserRoles = canUpdateRoles
  const canPromoteSuperAdmin = Boolean(
    isSuperAdmin && user?.permissions?.includes("admin.promote")
  )

  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: async () => {
      const res = await api.get("/admin/permissions")
      return res.data.data.permissions as PermissionEntry[]
    },
    enabled: !authLoading && canManageRbac,
  })

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: async () => {
      const res = await api.get("/admin/roles")
      return res.data.data.roles as RoleEntry[]
    },
    enabled: !authLoading && canManageRbac,
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["rbac-users"],
    queryFn: async () => {
      const res = await api.get("/admin/users?role=all&limit=200")
      return res.data.data.users as UserEntry[]
    },
    enabled: !authLoading && canManageRbac,
  })

  const { data: auditData } = useQuery({
    queryKey: ["rbac-audit"],
    queryFn: async () => {
      const res = await api.get("/admin/audit-logs?limit=25")
      return res.data.data.logs || []
    },
    enabled: !authLoading && canManageRbac && activeSection === "audit",
  })

  const { data: selectedUserAccess } = useQuery({
    queryKey: ["rbac-user-access", selectedUserId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${selectedUserId}/access`)
      return res.data.data as UserAccessResponse
    },
    enabled: !authLoading && canManageRbac && Boolean(selectedUserId),
  })

  const roleMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: roleForm.name,
        key: roleForm.key,
        description: roleForm.description,
        baseRole: roleForm.baseRole,
        permissions: roleForm.permissions,
      }

      if (selectedRoleId) {
        await api.patch(`/admin/roles/${selectedRoleId}`, payload)
      } else {
        await api.post("/admin/roles", payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-roles"] })
      setSelectedRoleId(null)
      setRoleForm({
        name: "",
        key: "",
        description: "",
        baseRole: "owner",
        permissions: [],
      })
    },
  })

  const userRoleMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/admin/users/${selectedUserId}/role`, {
        role: userRoleDraft,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-users"] })
      queryClient.invalidateQueries({ queryKey: ["rbac-user-access", selectedUserId] })
    },
  })

  const userPermissionMutation = useMutation({
    mutationFn: async () => {
      const overrides = Object.entries(overrideDraft)
        .filter(([, value]) => value === "allow" || value === "deny")
        .map(([permissionKey, effect]) => ({
          permissionKey,
          effect,
        }))

      await api.patch(`/admin/users/${selectedUserId}/permissions`, {
        overrides,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-user-access", selectedUserId] })
      queryClient.invalidateQueries({ queryKey: ["rbac-users"] })
    },
  })

  const promoteMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/users/${selectedUserId}/promote-super-admin`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-users"] })
      queryClient.invalidateQueries({ queryKey: ["rbac-user-access", selectedUserId] })
    },
  })

  useEffect(() => {
    if (!selectedRoleId || !rolesData) {
      return
    }

    const role = rolesData.find((entry) => entry.id === selectedRoleId)
    if (!role) return

    setRoleForm({
      name: role.name,
      key: role.key,
      description: role.description || "",
      baseRole: role.baseRole || "owner",
      permissions: role.permissions,
    })
  }, [rolesData, selectedRoleId])

  useEffect(() => {
    if (!selectedUserAccess) return

    setUserRoleDraft(selectedUserAccess.user.role)
    setOverrideDraft(
      selectedUserAccess.overrides.reduce<Record<string, string>>(
        (accumulator, override) => {
          accumulator[override.permissionKey] = override.effect
          return accumulator
        },
        {}
      )
    )
  }, [selectedUserAccess])

  const groupedPermissions = useMemo(() => {
    const permissions = permissionsData || []
    const groups = new Map<string, PermissionEntry[]>()

    for (const permission of permissions) {
      if (!groups.has(permission.category)) {
        groups.set(permission.category, [])
      }
      groups.get(permission.category)?.push(permission)
    }

    return Array.from(groups.entries())
  }, [permissionsData])

  const availableRoles = useMemo(() => rolesData || [], [rolesData])
  const availableUsers = useMemo(() => usersData || [], [usersData])
  const selectedRole = availableRoles.find((role) => role.id === selectedRoleId)
  const isRoleLocked = (role?: RoleEntry | null) => {
    if (!role) return false
    if (role.key === "super_admin" || !role.isEditable) return true
    if (role.key === "admin" && !isSuperAdmin) return true
    return false
  }
  const selectedRoleLocked = isRoleLocked(selectedRole)
  const canEditSelectedRole = selectedRole
    ? canUpdateRoles && !selectedRoleLocked
    : canCreateRoles
  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()
    if (!query) return availableUsers

    return availableUsers.filter((account) => {
      return (
        account.name.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query) ||
        account.role.toLowerCase().includes(query)
      )
    })
  }, [availableUsers, userSearch])
  const roleSummary = useMemo(() => {
    return {
      total: availableRoles.length,
      custom: availableRoles.filter((role) => !role.isSystem).length,
      locked: availableRoles.filter(
        (role) => role.key === "super_admin" || !role.isEditable
      ).length,
    }
  }, [availableRoles])
  const overrideSummary = useMemo(() => {
    const values = Object.values(overrideDraft)
    return {
      allow: values.filter((value) => value === "allow").length,
      deny: values.filter((value) => value === "deny").length,
    }
  }, [overrideDraft])

  if (authLoading) {
    return (
      <DashboardLayout type="admin">
        <ScreenLoader
          title="Restoring session"
          description="Loading your management workspace."
          className="min-h-[70vh] bg-transparent"
        />
      </DashboardLayout>
    )
  }

  if (!canManageRbac) {
    return <NotFoundContent />
  }

  const isLoading = permissionsLoading || rolesLoading || usersLoading

  return (
    <DashboardLayout
      type="admin"
      title="Settings"
      subtitle="Manage role definitions, direct permission overrides, and access history."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Settings" },
      ]}
    >
      <div className="space-y-6 p-6 lg:p-8">
        {isLoading ? (
          <ScreenLoader
            title="Loading RBAC settings"
            description="Preparing roles, permissions, and access controls."
            compact
            className="bg-transparent"
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-background/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Roles
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {roleSummary.total}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {roleSummary.custom} custom, {roleSummary.locked} locked
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Managed Users
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {availableUsers.length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Role changes and direct overrides live here
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Access Overrides
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {overrideSummary.allow + overrideSummary.deny}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {overrideSummary.allow} allow, {overrideSummary.deny} deny
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeSection === "roles" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("roles")}
              >
                Roles
              </Button>
              <Button
                variant={activeSection === "users" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("users")}
              >
                User Access
              </Button>
              <Button
                variant={activeSection === "audit" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("audit")}
              >
                Audit
              </Button>
            </div>

            {activeSection === "roles" ? (
              <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                <div className="gradient-card rounded-xl border border-border p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Roles</h2>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!canCreateRoles}
                      size="sm"
                      onClick={() => {
                        setSelectedRoleId(null)
                        setRoleForm({
                          name: "",
                          key: "",
                          description: "",
                          baseRole: "owner",
                          permissions: [],
                        })
                      }}
                    >
                      New Role
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {availableRoles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          selectedRoleId === role.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{role.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="uppercase tracking-wide">
                                {role.key}
                              </span>
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase">
                                {role.baseRole || role.key}
                              </span>
                              {role.isSystem ? (
                                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase">
                                  System
                                </span>
                              ) : (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase text-primary">
                                  Custom
                                </span>
                              )}
                              {role.key === "super_admin" || !role.isEditable ? (
                                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase">
                                  Locked
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <span className="rounded-full bg-background/40 px-2 py-0.5 text-[11px] uppercase text-muted-foreground">
                            {role.permissions.length} perms
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {role.description || "No description provided."}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gradient-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedRole ? `Edit ${selectedRole.name}` : "Create Custom Role"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep the role definition short and obvious. Permission changes should explain themselves without extra training.
                  </p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Role Name
                      </label>
                      <Input
                        value={roleForm.name}
                        disabled={!canEditSelectedRole}
                        onChange={(event) =>
                          setRoleForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Role Key
                      </label>
                      <Input
                        value={roleForm.key}
                        disabled={Boolean(selectedRole) || !canEditSelectedRole}
                        onChange={(event) =>
                          setRoleForm((current) => ({
                            ...current,
                            key: event.target.value,
                          }))
                        }
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Description
                      </label>
                      <Input
                        value={roleForm.description}
                        disabled={!canEditSelectedRole}
                        onChange={(event) =>
                          setRoleForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Base Role
                      </label>
                      <select
                        value={roleForm.baseRole}
                        disabled={Boolean(selectedRole?.isSystem) || !canEditSelectedRole}
                        onChange={(event) =>
                          setRoleForm((current) => ({
                            ...current,
                            baseRole: event.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm text-foreground"
                      >
                        {ROLE_BASE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    {groupedPermissions.map(([category, entries]) => (
                      <div key={category}>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {category}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {
                              entries.filter((permission) =>
                                roleForm.permissions.includes(permission.key)
                              ).length
                            }
                            /{entries.length}
                          </span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {entries.map((permission) => (
                            <label
                              key={permission.key}
                              className="flex items-start gap-3 rounded-xl border border-border bg-background/30 p-3 transition-colors hover:bg-background/50"
                            >
                              <input
                                type="checkbox"
                                checked={roleForm.permissions.includes(permission.key)}
                                disabled={!canEditSelectedRole}
                                onChange={() =>
                                  setRoleForm((current) => {
                                    const exists = current.permissions.includes(
                                      permission.key
                                    )
                                    return {
                                      ...current,
                                      permissions: exists
                                        ? current.permissions.filter(
                                            (entry) => entry !== permission.key
                                          )
                                        : [...current.permissions, permission.key],
                                    }
                                  })
                                }
                              />
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {permission.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={() => roleMutation.mutate()}
                      disabled={!canEditSelectedRole}
                      loading={roleMutation.isPending}
                      loaderLabel="Saving role"
                    >
                      {selectedRole ? "Save Role" : "Create Role"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {activeSection === "users" ? (
              <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                <div className="gradient-card rounded-xl border border-border p-5">
                  <div className="mb-4 space-y-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        User Access
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Pick a user, then adjust their primary role or direct overrides.
                      </p>
                    </div>
                    <Input
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                      placeholder="Search users by name, email, or role"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-3">
                    {filteredUsers.map((account) => (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setSelectedUserId(account.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          selectedUserId === account.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {account.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {account.email}
                            </p>
                          </div>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] uppercase text-muted-foreground">
                            {account.role}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Base role: {account.baseRole}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gradient-card rounded-xl border border-border p-6">
                  {!selectedUserAccess ? (
                    <div className="rounded-xl border border-border bg-background/30 p-8 text-sm text-muted-foreground">
                      Select a user to manage their primary role and direct permission overrides.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          {selectedUserAccess.user.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedUserAccess.user.email}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            Primary Role
                          </label>
                          <select
                            value={userRoleDraft}
                            disabled={!canUpdateUserRoles}
                            onChange={(event) => setUserRoleDraft(event.target.value)}
                            className="h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm text-foreground"
                          >
                            {availableRoles.map((role) => (
                              <option key={role.id} value={role.key}>
                                {role.name} ({role.key})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => userRoleMutation.mutate()}
                            disabled={!canUpdateUserRoles}
                            loading={userRoleMutation.isPending}
                            loaderLabel="Saving role"
                          >
                            Save Role
                          </Button>
                          {canPromoteSuperAdmin &&
                          selectedUserAccess.user.baseRole !== "super_admin" ? (
                            <Button
                              type="button"
                              onClick={() => promoteMutation.mutate()}
                              loading={promoteMutation.isPending}
                              loaderLabel="Promoting"
                            >
                              Promote Super Admin
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-border bg-background/30 p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Role Key
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {selectedUserAccess.user.role}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-background/30 p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Base Role
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {selectedUserAccess.user.baseRole}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-background/30 p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Effective Permissions
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {selectedUserAccess.user.permissions.length}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {groupedPermissions.map(([category, entries]) => (
                          <div key={category}>
                            <div className="mb-3 flex items-center justify-between">
                              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                {category}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {entries.filter((permission) => overrideDraft[permission.key] && overrideDraft[permission.key] !== "inherit").length}
                                /{entries.length} overridden
                              </span>
                            </div>
                            <div className="space-y-3">
                              {entries.map((permission) => (
                                <div
                                  key={permission.key}
                                  className="grid gap-3 rounded-xl border border-border bg-background/30 p-3 md:grid-cols-[minmax(0,1fr)_180px]"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {permission.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </p>
                                  </div>
                                  <select
                                    value={overrideDraft[permission.key] || "inherit"}
                                    disabled={!canAssignPermissions}
                                    onChange={(event) =>
                                      setOverrideDraft((current) => ({
                                        ...current,
                                        [permission.key]: event.target.value,
                                      }))
                                    }
                                    className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                                  >
                                    <option value="inherit">Inherit</option>
                                    <option value="allow">Allow</option>
                                    <option value="deny">Deny</option>
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        onClick={() => userPermissionMutation.mutate()}
                        disabled={!canAssignPermissions}
                        loading={userPermissionMutation.isPending}
                        loaderLabel="Saving permissions"
                      >
                        Save Permission Overrides
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {activeSection === "audit" ? (
              <div className="gradient-card overflow-hidden rounded-xl border border-border">
                <div className="border-b border-border px-6 py-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Access Audit
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Recent role, permission, and administrative actions.
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {(auditData || []).map((entry: any) => (
                    <div key={entry._id} className="px-6 py-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {entry.action}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.userId?.name || "System"} · {entry.resource}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
