"use client"

import { useState } from "react"
import { X, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "@tanstack/react-query"
import api from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

interface RequestEquityDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function RequestEquityDialog({ isOpen, onClose }: RequestEquityDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState({
    startupId: "",
    type: "NEW_INVESTMENT",
    requestedAmount: "",
    requestedShares: "",
    requestedEquityPercentage: "",
    message: ""
  })

  // Fetch all published startups for the dropdown
  const { data: startups = [] } = useQuery({
    queryKey: ['all-startups'],
    queryFn: async () => {
      const res = await api.get('/startups?limit=50')
      return res.data.data.startups
    },
    enabled: isOpen
  })

  const submitRequest = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        requestedAmount: Number(data.requestedAmount) || 0,
        requestedShares: Number(data.requestedShares) || 0,
        requestedEquityPercentage: Number(data.requestedEquityPercentage) || 0,
      }
      const res = await api.post('/requests', payload)
      return res.data
    },
    onSuccess: () => {
      setStep(2)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.startupId) return
    submitRequest.mutate(formData)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep(1)
      setFormData({
        startupId: "",
        type: "NEW_INVESTMENT",
        requestedAmount: "",
        requestedShares: "",
        requestedEquityPercentage: "",
        message: ""
      })
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
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-4"
          >
            <div className="gradient-card overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Request Allocation</h2>
                  <p className="text-sm text-muted-foreground mt-1">Submit an equity or investment request</p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {step === 1 ? (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Form Content */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Target Company *</label>
                    <select
                      required
                      value={formData.startupId}
                      onChange={(e) => setFormData({ ...formData, startupId: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select a company...</option>
                      {startups.map((s: any) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Request Type *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={cn(
                        "flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all",
                        formData.type === "NEW_INVESTMENT"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                      )}>
                        <input
                          type="radio"
                          className="sr-only"
                          checked={formData.type === "NEW_INVESTMENT"}
                          onChange={() => setFormData({ ...formData, type: "NEW_INVESTMENT" })}
                        />
                        <span className="text-sm font-semibold">New Investment</span>
                      </label>
                      <label className={cn(
                        "flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all",
                        formData.type === "REVISION"
                          ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]"
                          : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                      )}>
                        <input
                          type="radio"
                          className="sr-only"
                          checked={formData.type === "REVISION"}
                          onChange={() => setFormData({ ...formData, type: "REVISION" })}
                        />
                        <span className="text-sm font-semibold">Equity Revision</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Amount (₹) *</label>
                      <Input
                        required
                        type="number"
                        placeholder="e.g. 1000000"
                        value={formData.requestedAmount}
                        onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Equity %</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 5.5"
                        value={formData.requestedEquityPercentage}
                        onChange={(e) => setFormData({ ...formData, requestedEquityPercentage: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Message / Note</label>
                    <textarea
                      rows={3}
                      placeholder="Add any context for the admin..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    />
                  </div>

                  {submitRequest.isError && (
                    <div className="flex items-center gap-2 text-sm text-[#EF4444] bg-[#EF4444]/10 p-3 rounded-lg border border-[#EF4444]/20">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{(submitRequest.error as any)?.response?.data?.error || "Failed to submit request"}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitRequest.isPending || !formData.startupId}
                    >
                      {submitRequest.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Request Submitted!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your allocation request has been securely sent to the administrators for review. You will be notified once it is processed.
                  </p>
                  <Button onClick={handleClose} className="w-full">
                    Done
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
