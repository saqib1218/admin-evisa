"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api, getAccessToken } from "@/utils/api";
import NotificationBell from "@/components/NotificationBell/NotificationBell";

interface Application {
  id: string;
  applicant_id: string;
  reference_number: string;
  status: string;
  processing_type: string;
  created_at: string;
  submit_date: string | null;
  customer_name: string;
  grand_total: string;
  payment_status: boolean;
}

const statusConfig: Record<string, { bg: string; label: string }> = {
  pending: { bg: "#D9D9D9", label: "Pending" },
  rejected: { bg: "#DF1C41", label: "Rejected" },
  accepted: { bg: "#28806F", label: "Accepted" },
  approved: { bg: "#28806F", label: "Approved" },
  inprogress: { bg: "#2D76B5", label: "In Progress" },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getApplications({
        search: debouncedSearch || undefined,
        page: currentPage,
        limit,
      });
      setApplications(data.applications || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // SSE: auto-refetch when new application notification arrives
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const streamUrl = api.getNotificationStreamUrl();
    const es = new EventSource(`${streamUrl}?token=${encodeURIComponent(token)}`);

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "notification" && payload.data?.type === "application_submitted") {
          fetchApplications();
        }
      } catch {
        // ignore
      }
    };

    return () => {
      es.close();
    };
  }, [fetchApplications]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteApplication(deleteTarget.id);
      setDeleteTarget(null);
      fetchApplications();
    } catch (err) {
      console.error("Failed to delete application:", err);
    } finally {
      setDeleting(false);
    }
  };

  const getCustomerName = (app: Application) => {
    return app.customer_name || app.applicant_id || "Unknown";
  };

  const getTotal = (app: Application) => {
    const total = parseFloat(app.grand_total || "0");
    return `$${total.toFixed(2)}`;
  };

  const getStatusStyle = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    return config;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ paddingTop: "24px", paddingBottom: "24px", paddingLeft: "36px", paddingRight: "36px" }}>
      {/* White card container */}
      <div
        style={{
          background: "#FFFFFF",
          paddingTop: "24px",
          paddingRight: "24px",
          paddingBottom: "24px",
          paddingLeft: "24px",
          gap: "20px",
          borderRadius: "16px",
          border: "1px solid #D9D9D9",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header row: Applications title + Bell icon + divider + Admin profile */}
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "140%",
              letterSpacing: "-0.02em",
              color: "#0F0F0F",
            }}
          >
            Applications
          </span>
          <div className="flex items-center" style={{ gap: "12px" }}>
            <NotificationBell />
            <div style={{ width: "1px", height: "24px", background: "#D9D9D9" }} />
            <div className="flex items-center" style={{ gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#EFF4F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User style={{ width: "18px", height: "18px", color: "#2D76B5" }} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "160%",
                  letterSpacing: "0em",
                  color: "#0F0F0F",
                }}
              >
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Search section */}
        <div
          style={{
            border: "1px solid #D9D9D9",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Search label */}
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "160%",
              letterSpacing: "0em",
              color: "#0F0F0F",
            }}
          >
            Search Reference / Contact
          </span>

          {/* Search input + Filter button row */}
          <div className="flex items-center" style={{ gap: "12px" }}>
            <div className="relative" style={{ flex: 1 }}>
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <Search style={{ width: "20px", height: "20px", color: "#575757" }} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, applicant id"
                style={{
                  width: "100%",
                  height: "56px",
                  gap: "10px",
                  borderRadius: "999px",
                  border: "1px solid #D9D9D9",
                  paddingLeft: "48px",
                  paddingRight: "16px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  background: "#FFFFFF",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#0F0F0F",
                  outline: "none",
                }}
              />
            </div>
            <button
              className="flex items-center justify-center"
              style={{
                height: "56px",
                paddingTop: "10px",
                paddingRight: "16px",
                paddingBottom: "10px",
                paddingLeft: "16px",
                gap: "8px",
                borderRadius: "999px",
                border: "none",
                background: "var(--primary)",
                color: "#FFFFFF",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "160%",
                letterSpacing: "0em",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Filter style={{ width: "16px", height: "16px", color: "#FFFFFF" }} />
              Filter
            </button>
          </div>
        </div>

        {/* 24px gap then Table */}
        <div style={{ height: "24px" }} />

        {/* Table container */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #D9D9D9",
            position: "relative",
          }}
        >
          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFFFF", borderRadius: "12px" }}>
            <thead>
              <tr>
                {["Reference", "Applicant Id", "Customer", "Payment", "Status", "Total", "Date", "Actions"].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "160%",
                      letterSpacing: "0em",
                      color: "#575757",
                      background: "#FAFAF9",
                      borderBottom: "1px solid #D9D9D9",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "48px", textAlign: "center" }}>
                    <div
                      className="flex items-center justify-center"
                      style={{ background: "#FFFFFF" }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          border: "3px solid #D9D9D9",
                          borderTopColor: "#2D76B5",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      fontFamily: "var(--font-sans)",
                      fontSize: "16px",
                      fontWeight: 400,
                      color: "#575757",
                    }}
                  >
                    No Application Found
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const statusInfo = getStatusStyle(app.status);
                  return (
                    <tr key={app.id} style={{ borderBottom: "1px solid #E5E5E5" }}>
                      {/* Reference */}
                      <td
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 500,
                          fontSize: "14px",
                          lineHeight: "160%",
                          letterSpacing: "0em",
                          color: "#2D76B5",
                        }}
                      >
                        {app.reference_number || app.applicant_id}
                      </td>
                      {/* Applicant Id */}
                      <td
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "160%",
                          letterSpacing: "0em",
                          color: "#0F0F0F",
                        }}
                      >
                        {app.applicant_id}
                      </td>
                      {/* Customer */}
                      <td
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "160%",
                          letterSpacing: "0em",
                          color: "#0F0F0F",
                        }}
                      >
                        {getCustomerName(app)}
                      </td>
                      {/* Payment */}
                      <td
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            paddingTop: "4px",
                            paddingBottom: "4px",
                            paddingLeft: "12px",
                            paddingRight: "12px",
                            borderRadius: "999px",
                            background: app.payment_status ? "#28806F" : "#F97316",
                            fontFamily: "var(--font-sans)",
                            fontWeight: 500,
                            fontSize: "12px",
                            lineHeight: "160%",
                            letterSpacing: "0em",
                            color: "#FFFFFF",
                          }}
                        >
                          {app.payment_status ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      {/* Status badge */}
                      <td
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            paddingTop: "4px",
                            paddingBottom: "4px",
                            paddingLeft: "12px",
                            paddingRight: "12px",
                            borderRadius: "999px",
                            background: statusInfo.bg,
                            fontFamily: "var(--font-sans)",
                            fontWeight: 500,
                            fontSize: "12px",
                            lineHeight: "160%",
                            letterSpacing: "0em",
                            color: "#0F0F0F",
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      {/* Total */}
                      <td
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "160%",
                          letterSpacing: "0em",
                          color: "#0F0F0F",
                        }}
                      >
                        {getTotal(app)}
                      </td>
                      {/* Date */}
                      <td
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "160%",
                          letterSpacing: "0em",
                          color: "#0F0F0F",
                        }}
                      >
                        {formatDate(app.created_at)}
                      </td>
                      {/* Actions */}
                      <td
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          position: "relative",
                        }}
                      >
                        <button
                          onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <MoreVertical style={{ width: "20px", height: "20px", color: "#575757" }} />
                        </button>
                        {openMenuId === app.id && (
                          <div
                            ref={menuRef}
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: "20px",
                              marginTop: "4px",
                              background: "#FFFFFF",
                              border: "1px solid #D9D9D9",
                              borderRadius: "12px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              zIndex: 1000,
                              minWidth: "160px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              className="flex items-center"
                              style={{
                                gap: "8px",
                                padding: "10px 16px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setOpenMenuId(null);
                                router.push(`/dashboard/applications/${app.id}`);
                              }}
                            >
                              <Edit style={{ width: "16px", height: "16px", color: "#2D76B5" }} />
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  color: "#0F0F0F",
                                }}
                              >
                                Edit
                              </span>
                            </div>
                            <div style={{ height: "1px", background: "#E5E5E5" }} />
                            <div
                              className="flex items-center"
                              style={{
                                gap: "8px",
                                padding: "10px 16px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setDeleteTarget(app);
                                setOpenMenuId(null);
                              }}
                            >
                              <Trash2 style={{ width: "16px", height: "16px", color: "#DF1C41" }} />
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  color: "#DF1C41",
                                }}
                              >
                                Delete
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between"
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #E5E5E5",
                background: "#FFFFFF",
                borderRadius: "0 0 12px 12px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "13px",
                  color: "#575757",
                }}
              >
                Page {currentPage} of {totalPages} ({total} total)
              </span>
              <div className="flex items-center" style={{ gap: "4px" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid #D9D9D9",
                    background: "#FFFFFF",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: currentPage === 1 ? 0.4 : 1,
                  }}
                >
                  <ChevronLeft style={{ width: "16px", height: "16px", color: "#575757" }} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== p - 1) {
                      return (
                        <span key={`ellipsis-${p}`} style={{ padding: "0 4px", color: "#575757", fontFamily: "var(--font-sans)", fontSize: "13px" }}>
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        style={{
                          minWidth: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          border: p === currentPage ? "1px solid var(--primary)" : "1px solid #D9D9D9",
                          background: p === currentPage ? "var(--primary)" : "#FFFFFF",
                          color: p === currentPage ? "#FFFFFF" : "#575757",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 500,
                          fontSize: "13px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 8px",
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid #D9D9D9",
                    background: "#FFFFFF",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: currentPage === totalPages ? 0.4 : 1,
                  }}
                >
                  <ChevronRight style={{ width: "16px", height: "16px", color: "#575757" }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              paddingTop: "24px",
              paddingRight: "24px",
              paddingBottom: "24px",
              paddingLeft: "24px",
              maxWidth: "440px",
              width: "90%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: "20px",
                  lineHeight: "140%",
                  letterSpacing: "-0.02em",
                  color: "#0F0F0F",
                }}
              >
                Delete Application
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "160%",
                  color: "#73757C",
                }}
              >
                This record will be permanently deleted. This action cannot be undone. All related data including applicants, payments, and status logs will be removed.
              </span>
            </div>
            <div className="flex" style={{ gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{
                  height: "40px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  borderRadius: "999px",
                  border: "1px solid #D9D9D9",
                  background: "#FFFFFF",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#0F0F0F",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  height: "40px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  borderRadius: "999px",
                  border: "none",
                  background: "#DF1C41",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {deleting ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#FFFFFF",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
