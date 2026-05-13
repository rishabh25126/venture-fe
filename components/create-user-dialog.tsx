"use client"

import { useState } from "react"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
  currentUserRole?: "admin" | "owner"
}

export function CreateUserDialog({ isOpen, onClose, currentUserRole = "admin" }: CreateUserDialogProps) {
  const queryClient = useQueryClient()
  const defaultRole = currentUserRole === "owner" ? "investor" : "investor"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole
  })

  const createUser = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post('/admin/users', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investors'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-owners'] })
      handleClose()
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createUser.mutate(formData)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: defaultRole,
      })
      createUser.reset()
    }, 300)
  }

  const isCreatingOwner = formData.role === "owner"

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
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-4"
          >
            <div className="gradient-card overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{isCreatingOwner ? "Create Owner" : "Create Investor"}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isCreatingOwner ? "Add a new owner who can manage assigned businesses" : "Add a new investor to the platform"}
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
                {currentUserRole === "admin" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Account Type</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="investor">Investor</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                  <Input
                    required
                    type="text"
                    placeholder="e.g. Aditya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. aditya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Temporary Password</label>
                  <Input
                    required
                    type="password"
                    placeholder="e.g. welcome123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>

                {createUser.isError && (
                  <div className="flex items-center gap-2 text-sm text-[#EF4444] bg-[#EF4444]/10 p-3 rounded-lg border border-[#EF4444]/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{(createUser.error as any)?.response?.data?.error || "Failed to create user"}</p>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={handleClose} className="w-full">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createUser.isPending}
                  >
                    {createUser.isPending ? "Creating..." : isCreatingOwner ? "Create Owner" : "Create Investor"}
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
