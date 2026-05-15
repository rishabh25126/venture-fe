"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, X } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import api from "@/lib/api"
import { getUserFacingErrorMessage } from "@/lib/errors/user-facing-errors"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Input } from "@/components/ui/input"

type ConvertibleRequest = {
  id: string
  type: "PUBLIC_INTEREST" | "NEW_INVESTMENT" | "REVISION"
  businessId: string
  businessName: string
  investorId?: string
  requestedBy: string
  requestedByEmail: string
  requestedAmount?: number
  requestedShares?: number
  requestedEquityPercentage?: number
}

interface RequestConversionDialogProps {
  isOpen: boolean
  onClose: () => void
  request: ConvertibleRequest | null
}

type ResolutionMode = "existing" | "create"

const DEFAULT_FORM = {
  investorId: "",
  name: "",
  email: "",
  password: "",
  investedAmount: "",
  shares: "",
  equityPercentage: "",
}

export function RequestConversionDialog({
  isOpen,
  onClose,
  request,
}: RequestConversionDialogProps) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<ResolutionMode>("existing")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_FORM)

  const { data: investors = [] } = useQuery({
    queryKey: ["admin-investors"],
    queryFn: async () => {
      const res = await api.get("/admin/users?role=investor")
      return res.data.data.investors || []
    },
    enabled: isOpen,
  })

  useEffect(() => {
    if (!request) {
      setFormData(DEFAULT_FORM)
      setMode("existing")
      return
    }

    const nextMode: ResolutionMode =
      request.type === "PUBLIC_INTEREST" && !request.investorId
        ? "create"
        : request.investorId
          ? "existing"
          : "create"

    setMode(nextMode)
    setFormData({
      investorId: request.investorId || "",
      name: request.requestedBy || "",
      email: request.requestedByEmail || "",
      password: "",
      investedAmount:
        request.requestedAmount && request.requestedAmount > 0
          ? String(request.requestedAmount)
          : "",
      shares:
        request.requestedShares && request.requestedShares > 0
          ? String(request.requestedShares)
          : "",
      equityPercentage:
        request.requestedEquityPercentage && request.requestedEquityPercentage > 0
          ? String(request.requestedEquityPercentage)
          : "",
    })
  }, [request])

  const resolutionLabel = useMemo(() => {
    if (!request) return "Resolve Request"
    if (request.type === "REVISION") return "Edit Equity"
    if (mode === "create") return "Create Investor & Assign Equity"
    return "Assign Equity"
  }, [mode, request])

  const resolutionMutation = useMutation({
    mutationFn: async () => {
      if (!request) return null
      await api.post(`/requests/admin/${request.id}/convert`, {
        mode,
        investorId: formData.investorId || undefined,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        investedAmount: Number(formData.investedAmount) || 0,
        shares: Number(formData.shares) || 0,
        equityPercentage: Number(formData.equityPercentage) || 0,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-investors"] })
      queryClient.invalidateQueries({ queryKey: ["business-investors"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user"] })
      queryClient.invalidateQueries({ queryKey: ["my-businesses"] })
      setIsConfirmOpen(false)
      onClose()
    },
  })

  const canSubmit =
    request &&
    request.businessId &&
    Number(formData.investedAmount) > 0 &&
    (mode === "existing"
      ? Boolean(formData.investorId)
      : Boolean(formData.name && formData.email && formData.password))

  return (
    <AnimatePresence>
      {isOpen && request ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 p-4 sm:max-w-2xl"
          >
            <div className="gradient-card max-h-[88vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {resolutionLabel}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.businessName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-6">
                {request.type !== "REVISION" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={mode === "existing" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMode("existing")}
                    >
                      Existing Investor
                    </Button>
                    <Button
                      type="button"
                      variant={mode === "create" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMode("create")}
                    >
                      Create Investor
                    </Button>
                  </div>
                ) : null}

                {mode === "existing" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Investor
                    </label>
                    <select
                      value={formData.investorId}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          investorId: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm text-foreground"
                    >
                      <option value="">Select investor...</option>
                      {investors.map((investor: any) => (
                        <option key={investor.id || investor._id} value={investor.id || investor._id}>
                          {investor.name} ({investor.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Investor Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Investor Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Temporary Password
                      </label>
                      <Input
                        type="text"
                        value={formData.password}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Invested Amount
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.investedAmount}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          investedAmount: event.target.value,
                        }))
                      }
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Shares
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.shares}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          shares: event.target.value,
                        }))
                      }
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Equity %
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.equityPercentage}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          equityPercentage: event.target.value,
                        }))
                      }
                      className="bg-secondary/50"
                    />
                  </div>
                </div>

                {resolutionMutation.isError ? (
                  <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>
                      {getUserFacingErrorMessage(
                        resolutionMutation.error,
                        "mutation",
                        "We couldn't complete this request workflow right now."
                      )}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:flex-1"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="w-full sm:flex-1"
                    onClick={() => setIsConfirmOpen(true)}
                    disabled={!canSubmit}
                  >
                    {resolutionLabel}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <ConfirmationDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => resolutionMutation.mutate()}
            title={resolutionLabel}
            description="This will apply the investor assignment workflow and mark the request as accepted."
            confirmLabel={resolutionLabel}
            isPending={resolutionMutation.isPending}
          />
        </>
      ) : null}
    </AnimatePresence>
  )
}
