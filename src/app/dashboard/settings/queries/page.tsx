"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/utils/api";
import NotificationBell from "@/components/NotificationBell/NotificationBell";

interface Query {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  created_at: string;
}

export default function QueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getQueries({
        search: debouncedSearch || undefined,
        page: currentPage,
        limit,
      });
      setQueries(data.queries || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch queries:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const handleViewDetail = async (query: Query) => {
    setSelectedQuery(query);
    setDetailLoading(true);
    try {
      const detail = await api.getQueryById(query.id);
      setSelectedQuery(detail);
    } catch (err) {
      console.error("Failed to fetch query detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        {/* Header row: Queries title + Bell icon + divider + Admin profile */}
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
            Queries
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
            Search Queries
          </span>

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
                placeholder="Search name, email, phone, city"
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
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFFFF", borderRadius: "12px" }}>
            <thead>
              <tr>
                {["Name", "Email", "Phone Number", "City", "Action"].map((header) => (
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
                  <td colSpan={5} style={{ padding: "48px", textAlign: "center" }}>
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
              ) : queries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      fontFamily: "var(--font-sans)",
                      fontSize: "16px",
                      fontWeight: 400,
                      color: "#575757",
                    }}
                  >
                    No Queries Found
                  </td>
                </tr>
              ) : (
                queries.map((query) => (
                  <tr key={query.id} style={{ borderBottom: "1px solid #E5E5E5" }}>
                    {/* Name */}
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
                        color: "#0F0F0F",
                      }}
                    >
                      {query.full_name}
                    </td>
                    {/* Email */}
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
                      {query.email}
                    </td>
                    {/* Phone */}
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
                      {query.phone}
                    </td>
                    {/* City */}
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
                      {query.city}
                    </td>
                    {/* Action */}
                    <td
                      style={{
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                      }}
                    >
                      <button
                        onClick={() => handleViewDetail(query)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Eye style={{ width: "20px", height: "20px", color: "#2D76B5" }} />
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div
          onClick={() => !detailLoading && setSelectedQuery(null)}
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
              maxWidth: "560px",
              width: "90%",
              maxHeight: "85vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedQuery(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X style={{ width: "20px", height: "20px", color: "#73757C" }} />
            </button>

            {/* Title */}
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
              Query Details
            </span>

            {detailLoading ? (
              <div className="flex items-center justify-center" style={{ padding: "32px" }}>
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
            ) : (
              <div className="flex flex-col" style={{ gap: "16px" }}>
                {/* Name */}
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "13px", color: "#575757" }}>Name</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "15px", color: "#0F0F0F" }}>{selectedQuery.full_name}</span>
                </div>
                {/* Email */}
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "13px", color: "#575757" }}>Email</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "15px", color: "#0F0F0F" }}>{selectedQuery.email}</span>
                </div>
                {/* Phone */}
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "13px", color: "#575757" }}>Phone Number</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "15px", color: "#0F0F0F" }}>{selectedQuery.phone}</span>
                </div>
                {/* City */}
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "13px", color: "#575757" }}>City</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "15px", color: "#0F0F0F" }}>{selectedQuery.city}</span>
                </div>
                {/* Message */}
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "13px", color: "#575757" }}>Message</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "15px", color: "#0F0F0F", lineHeight: "160%", whiteSpace: "pre-wrap" }}>{selectedQuery.message}</span>
                </div>
                {/* Date */}
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "13px", color: "#575757" }}>Submitted At</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "15px", color: "#0F0F0F" }}>{formatDateTime(selectedQuery.created_at)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
