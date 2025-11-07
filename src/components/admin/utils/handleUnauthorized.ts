export const handleAdminUnauthorized = (response: Response) => {
  if (response.status === 401) {
    window.location.href = '/admin/login?redirect=/admin'
    return true
  }
  return false
}
