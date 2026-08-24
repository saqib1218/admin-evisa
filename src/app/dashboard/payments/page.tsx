"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  DollarSign,
  NotepadText,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/utils/api";
import NotificationBell from "@/components/NotificationBell/NotificationBell";

interface Transaction {
  id: string;
  reference_number: string;
  applicant_id: string;
  status: string;
  processing_type: string;
  created_at: string;
  customer_name: string;
  grand_total: string;
  payment_status: boolean;
}

interface PaymentStats {
  totalRevenue: number;
  successfulOrders: number;
  averageOrderValue: number;
}

const statusConfig: Record<string, { bg: string; label: string }> = {
  pending: { bg: "#D9D9D9", label: "Pending" },
  rejected: { bg: "#DF1C41", label: "Rejected" },
  accepted: { bg: "#28806F", label: "Accepted" },
  inprogress: { bg: "#2D76B5", label: "In Progress" },
};

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    successfulOrders: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPaymentTransactions({
        search: debouncedSearch || undefined,
        page: currentPage,
        limit,
      });
      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getPaymentStats();
      setStats({
        totalRevenue: data.totalRevenue || 0,
        successfulOrders: data.successfulOrders || 0,
        averageOrderValue: data.averageOrderValue || 0,
      });
    } catch (err) {
      console.error("Failed to fetch payment stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getCustomerName = (tx: Transaction) => {
    return tx.customer_name || tx.applicant_id || "Unknown";
  };

  const getTotal = (tx: Transaction) => {
    const total = parseFloat(tx.grand_total || "0");
    return `$${total.toFixed(2)}`;
  };

  const getStatusStyle = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
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
        {/* Header row: Payments title + Bell icon + divider + Admin profile */}
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
            Payments
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

        {/* 2 Stat cards row */}
        <div className="flex" style={{ gap: "12px", flexWrap: "wrap" }}>
          {/* Card 1: Total Revenue */}
          <div
            style={{
              flex: 1,
              minHeight: "140px",
              borderRadius: "12px",
              border: "1px solid #D9D9D9",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              background: "#FFFFFF",
            }}
          >
            <div className="flex items-center" style={{ gap: "8px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#EFF4F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <DollarSign style={{ width: "20px", height: "20px", color: "#2D76B5" }} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "160%",
                  letterSpacing: "0em",
                  color: "#575757",
                }}
              >
                Total Revenue
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "32px",
                lineHeight: "120%",
                letterSpacing: "-0.02em",
                color: "#0F0F0F",
              }}
            >
              {formatCurrency(stats.totalRevenue)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: "160%",
                letterSpacing: "0em",
                color: "#575757",
              }}
            >
              from {stats.successfulOrders} successful orders
            </span>
          </div>

          {/* Card 2: Average Order Value */}
          <div
            style={{
              flex: 1,
              minHeight: "140px",
              borderRadius: "12px",
              border: "1px solid #D9D9D9",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              background: "#FFFFFF",
            }}
          >
            <div className="flex items-center" style={{ gap: "8px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#EFF4F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <NotepadText style={{ width: "20px", height: "20px", color: "#2D76B5" }} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "160%",
                  letterSpacing: "0em",
                  color: "#575757",
                }}
              >
                Average Order Value
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "32px",
                lineHeight: "120%",
                letterSpacing: "-0.02em",
                color: "#0F0F0F",
              }}
            >
              {formatCurrency(stats.averageOrderValue)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: "160%",
                letterSpacing: "0em",
                color: "#575757",
              }}
            >
              Verified platform standard
            </span>
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
          {/* Table header section */}
          <div
            className="flex items-center justify-between"
            style={{
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "20px",
              paddingRight: "20px",
              background: "#FFFFFF",
              borderRadius: "12px 12px 0 0",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "140%",
                letterSpacing: "-0.02em",
                color: "#0F0F0F",
              }}
            >
              Latest Transactions
            </span>
            {/* Search input */}
            <div className="relative" style={{ width: "320px" }}>
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <Search style={{ width: "18px", height: "18px", color: "#575757" }} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, email, name, Applicant id"
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "999px",
                  border: "1px solid #D9D9D9",
                  paddingLeft: "42px",
                  paddingRight: "16px",
                  background: "#FFFFFF",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#0F0F0F",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFFFF", borderRadius: "0 0 12px 12px" }}>
            <thead>
              <tr>
                {["Reference", "Applicant Id", "Customer", "Status", "Payment", "Total", "Date"].map((header) => (
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
                  <td colSpan={7} style={{ padding: "48px", textAlign: "center" }}>
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
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      fontFamily: "var(--font-sans)",
                      fontSize: "16px",
                      fontWeight: 400,
                      color: "#575757",
                    }}
                  >
                    No Transactions Found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const statusInfo = getStatusStyle(tx.status);
                  return (
                    <tr key={tx.id} style={{ borderBottom: "1px solid #E5E5E5" }}>
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
                        {tx.reference_number || tx.applicant_id}
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
                        {tx.applicant_id}
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
                        {getCustomerName(tx)}
                      </td>
                      {/* Status */}
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
                            background: tx.payment_status ? "#28806F" : "#F97316",
                            fontFamily: "var(--font-sans)",
                            fontWeight: 500,
                            fontSize: "12px",
                            lineHeight: "160%",
                            letterSpacing: "0em",
                            color: "#FFFFFF",
                          }}
                        >
                          {tx.payment_status ? "Paid" : "Unpaid"}
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
                        {getTotal(tx)}
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
                        {formatDate(tx.created_at)}
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
    </div>
  );
}
