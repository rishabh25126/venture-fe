"use client"

import { useEffect, useMemo, useState } from "react"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { getUserFacingErrorMessage } from "@/lib/errors/user-facing-errors"

interface BusinessDialogProps {
  isOpen: boolean
  onClose: () => void
  businessId?: string | null
  currentUserRole: "admin" | "owner"
}

const DEFAULT_FORM = {
  name: "",
  slug: "",
  tagline: "",
  sector: "",
  stage: "Seed",
  fundingAsk: "",
  description: "",
  problem: "",
  solution: "",
  useOfFunds: "",
  ownerIds: [] as string[],
}

export function CreateEditBusinessDialog({ isOpen, onClose, businessId, currentUserRole }: BusinessDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState(DEFAULT_FORM)

  const isEditing = Boolean(businessId)
  const canManageOwners = currentUserRole === "admin"

  const { data: owners = [] } = useQuery({
    queryKey: ["admin-owners"],
    queryFn: async () => {
      const res = await api.get("/admin/users?role=owner")
      return res.data.data.owners
    },
    enabled: isOpen && canManageOwners,
  })

  const { data: editableBusiness } = useQuery({
    queryKey: ["editable-business", businessId],
    queryFn: async () => {
      const res = await api.get(`/businesses/manage/${businessId}`)
      return res.data.data
    },
    enabled: isOpen && !!businessId,
  })

  useEffect(() => {
    if (!editableBusiness) return

    const business = editableBusiness.business
    const assignedOwnerIds = (editableBusiness.owners || []).map((record: any) => record.ownerId?._id).filter(Boolean)
    setFormData({
      name: business.name || "",
      slug: business.slug || "",
      tagline: business.tagline || "",
      sector: business.sector || "",
      stage: business.stage || "Seed",
      fundingAsk: business.fundingAsk?.toString() || "",
      description: business.description || "",
      problem: business.problem || "",
      solution: business.solution || "",
      useOfFunds: business.useOfFunds || "",
      ownerIds: assignedOwnerIds,
    })
  }, [editableBusiness])

  const dialogTitle = useMemo(() => {
    if (isEditing) return "Edit Business"
    return "Create Business"
  }, [isEditing])

  const businessMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        fundingAsk: Number(formData.fundingAsk),
        ownerIds: canManageOwners ? formData.ownerIds : undefined,
      }

      if (isEditing) {
        const res = await api.put(`/businesses/${businessId}`, payload)
        return res.data
      }

      const res = await api.post("/businesses", payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] })
      queryClient.invalidateQueries({ queryKey: ["editable-business", businessId] })
      handleClose()
    },
  })

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setFormData(DEFAULT_FORM)
      businessMutation.reset()
    }, 300)
  }

  const toggleOwner = (ownerId: string) => {
    setFormData((current) => {
      const exists = current.ownerIds.includes(ownerId)
      return {
        ...current,
        ownerIds: exists ? current.ownerIds.filter((id) => id !== ownerId) : [...current.ownerIds, ownerId],
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    businessMutation.mutate()
  }

  const isOwnerSelectionInvalid = canManageOwners && formData.ownerIds.length === 0

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
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100vw-2rem)] sm:max-w-3xl translate-x-[-50%] translate-y-[-50%] p-4"
          >
            <div className="gradient-card max-h-[88vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{dialogTitle}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isEditing ? "Update business details for the assigned business" : "Create a business and assign at least one owner"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Business Name *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Slug *</label>
                    <Input
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      className="bg-secondary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Business Group *</label>
                    <Input
                      required
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Stage *</label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm"
                    >
                      <option value="Pre-seed">Pre-seed</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Series B">Series B</option>
                      <option value="Series C+">Series C+</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Tagline</label>
                    <Input
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Funding Ask (₹) *</label>
                    <Input
                      required
                      type="number"
                      min="1"
                      value={formData.fundingAsk}
                      onChange={(e) => setFormData({ ...formData, fundingAsk: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[96px] rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Problem</label>
                    <textarea
                      value={formData.problem}
                      onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                      className="w-full min-h-[96px] rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Solution</label>
                    <textarea
                      value={formData.solution}
                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                      className="w-full min-h-[96px] rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Use of Funds</label>
                  <textarea
                    value={formData.useOfFunds}
                    onChange={(e) => setFormData({ ...formData, useOfFunds: e.target.value })}
                    className="w-full min-h-[96px] rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
                  />
                </div>

                {canManageOwners && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Owners *</label>
                    <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-secondary/30 p-3 sm:grid-cols-2">
                      {owners.map((owner: any) => {
                        const checked = formData.ownerIds.includes(owner._id)
                        return (
                          <label key={owner._id} className="flex items-center gap-2 text-sm text-foreground">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleOwner(owner._id)}
                            />
                            <span>{owner.name}</span>
                          </label>
                        )
                      })}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">A business must always have at least one owner.</p>
                  </div>
                )}

                {businessMutation.isError && (
                  <div className="flex items-center gap-2 text-sm text-[#EF4444] bg-[#EF4444]/10 p-3 rounded-lg border border-[#EF4444]/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{getUserFacingErrorMessage(businessMutation.error, "mutation", "We couldn't save this business right now.")}</p>
                  </div>
                )}

                <div className="pt-4 flex flex-col-reverse gap-3 sm:flex-row">
                  <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:flex-1"
                    disabled={businessMutation.isPending || isOwnerSelectionInvalid}
                  >
                    {businessMutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Business"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
