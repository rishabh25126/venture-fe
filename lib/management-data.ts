import api from "@/lib/api"

export type RequestStatus = "PENDING" | "REVIEWING" | "REJECTED" | "ACCEPTED"

export async function fetchManageableBusinesses() {
  const res = await api.get("/businesses/manage/list?limit=100")
  return res.data.data.businesses
}

export async function fetchManageableBusiness(id: string) {
  const res = await api.get(`/businesses/manage/${id}`)
  return res.data.data
}

export async function fetchAdminUsers(role: "all" | "investor" | "owner") {
  const res = await api.get(`/admin/users?role=${role}`)
  return res.data.data
}

export async function fetchAdminUserDetail(id: string) {
  const res = await api.get(`/admin/users/${id}`)
  return res.data.data
}

export async function fetchBusinessInvestors(id: string) {
  const res = await api.get(`/admin/businesses/${id}/investors`)
  return res.data.data.investors
}

export async function fetchBusinessOwners(id: string) {
  const res = await api.get(`/owners/business/${id}`)
  return res.data.data.owners
}

export async function fetchAdminRequests(params: {
  statuses: string
  sort: "oldest" | "newest"
  page: number
  pageSize: number
}) {
  const res = await api.get("/requests/admin", { params })
  return res.data.data
}
