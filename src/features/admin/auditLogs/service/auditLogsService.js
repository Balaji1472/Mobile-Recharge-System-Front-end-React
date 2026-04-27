import api from "../../../../api/axios";

/**
 * Fetches a single page of audit logs from the backend.
 * Spring's @PageableDefault size=10, sort=timestamp is overridden here.
 *
 * @param {number} page  - 0-based page index (Spring convention)
 * @param {number} size  - records per page (default 10)
 */
export const fetchAuditLogs = async (page = 0, size = 10) => {
  const r = await api.get("/audit-logs", {
    params: {
      page,
      size,
      sort: "timestamp,desc",   // ← latest first, always
    },
  });
  return r.data;                // full Spring Page object: { content, totalElements, totalPages, number, ... }
};