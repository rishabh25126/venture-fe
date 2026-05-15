"use client"

import { useEffect, useState } from "react"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { getUserFacingErrorMessage } from "@/lib/errors/user-facing-errors"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface AssignEquityDialogProps {
  isOpen: boolean
  onClose: () => void
  preselectedInvestorId?: string
  preselectedBusinessId?: string
  initialValues?: {
    investedAmount?: number
    shares?: number
    equityPercentage?: number
  }
  lockInvestor?: boolean
  lockBusiness?: boolean
  title?: string
  description?: string
  submitLabel?: string
  onSuccess?: () => void
}

export function AssignEquityDialog({
  isOpen,
  onClose,
  preselectedInvestorId,
  preselectedBusinessId,
  initialValues,
  lockInvestor = false,
  lockBusiness = false,
  title = "Assign Equity",
  description = "Grant an investor access and equity in a business",
  submitLabel = "Assign Equity",
  onSuccess,
}: AssignEquityDialogProps) {
  const queryClient = useQueryClient()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [formData, setFormData] = useState({
    investorId: preselectedInvestorId || "",
    businessId: preselectedBusinessId || "",
    investedAmount: initialValues?.investedAmount?.toString() || "",
    shares: initialValues?.shares?.toString() || "",
    equityPercentage: initialValues?.equityPercentage?.toString() || "",
  })

  const isEditing =
    Boolean(initialValues?.investedAmount) ||
    Boolean(initialValues?.shares) ||
    Boolean(initialValues?.equityPercentage)

  useEffect(() => {
    if (!isOpen) return

    setFormData({
      investorId: preselectedInvestorId || "",
      businessId: preselectedBusinessId || "",
      investedAmount: initialValues?.investedAmount?.toString() || "",
      shares: initialValues?.shares?.toString() || "",
      equityPercentage: initialValues?.equityPercentage?.toString() || "",
    })
  }, [initialValues, isOpen, preselectedBusinessId, preselectedInvestorId])

  const { data: businesses = [] } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const res = await api.get("/businesses/manage/list?limit=100")
      return res.data.data.businesses
    },
    enabled: isOpen,
  })

  const { data: investors = [] } = useQuery({
    queryKey: ["admin-investors"],
    queryFn: async () => {
      const res = await api.get("/admin/users?role=investor")
      return res.data.data.investors
    },
    enabled: isOpen,
  })

  const assignEquity = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        investorId: data.investorId,
        businessId: data.businessId,
        investedAmount: Number(data.investedAmount) || 0,
        shares: Number(data.shares) || 0,
        equityPercentage: Number(data.equityPercentage) || 0,
      }
      const res = await api.post("/access/assign", payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-investors"] })
      queryClient.invalidateQueries({ queryKey: ["business-investors"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user"] })
      queryClient.invalidateQueries({ queryKey: ["my-businesses"] })
      onSuccess?.()
      setIsConfirmOpen(false)
      handleClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsConfirmOpen(true)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setFormData({
        investorId: preselectedInvestorId || "",
        businessId: preselectedBusinessId || "",
        investedAmount: initialValues?.investedAmount?.toString() || "",
        shares: initialValues?.shares?.toString() || "",
        equityPercentage: initialValues?.equityPercentage?.toString() || "",
      })
      assignEquity.reset()
      setIsConfirmOpen(false)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100vw-2rem)] sm:max-w-lg translate-x-[-50%] translate-y-[-50%] p-4"
          >
            <div className="gradient-card overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Investor *
                    </label>
                    <select
                      required
                      value={formData.investorId}
                      disabled={lockInvestor}
                      onChange={(e) =>
                        setFormData({ ...formData, investorId: e.target.value })
                      }
                      className="w-full h-11 px-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select investor...</option>
                      {investors.map((i: any) => (
                        <option key={i._id} value={i._id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Business *
                    </label>
                    <select
                      required
                      value={formData.businessId}
                      disabled={lockBusiness}
                      onChange={(e) =>
                        setFormData({ ...formData, businessId: e.target.value })
                      }
                      className="w-full h-11 px-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select business...</option>
                      {businesses.map((s: any) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Invested (₹) *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 1000000"
                      value={formData.investedAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          investedAmount: e.target.value,
                        })
                      }
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Shares
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 10000"
                      value={formData.shares}
                      onChange={(e) =>
                        setFormData({ ...formData, shares: e.target.value })
                      }
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Equity %
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 5.5"
                      value={formData.equityPercentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          equityPercentage: e.target.value,
                        })
                      }
                      className="bg-secondary/50"
                    />
                  </div>
                </div>

                {assignEquity.isError && (
                  <div className="flex items-center gap-2 text-sm text-[#EF4444] bg-[#EF4444]/10 p-3 rounded-lg border border-[#EF4444]/20 mt-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>
                      {getUserFacingErrorMessage(
                        assignEquity.error,
                        "mutation",
                        "We couldn't assign equity right now."
                      )}
                    </p>
                  </div>
                )}

                <div className="pt-4 flex flex-col-reverse gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:flex-1"
                    loading={assignEquity.isPending}
                    loaderLabel={isEditing ? "Saving equity" : "Assigning equity"}
                    disabled={
                      assignEquity.isPending ||
                      !formData.investorId ||
                      !formData.businessId ||
                      Number(formData.investedAmount) <= 0
                    }
                  >
                    {submitLabel}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          <ConfirmationDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => assignEquity.mutate(formData)}
            title={isEditing ? "Confirm equity update" : "Confirm equity assignment"}
            description={
              isEditing
                ? "This will update the investor's equity allocation for this business."
                : "This will assign the investor to this business and grant equity access."
            }
            confirmLabel={submitLabel}
            isPending={assignEquity.isPending}
          />
        </>
      )}
    </AnimatePresence>
  )
}
