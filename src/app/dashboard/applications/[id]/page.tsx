"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  User,
  ArrowLeft,
  Link as LinkIcon,
  Upload,
  Check,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { api } from "@/utils/api";
import PopupModal from "@/components/PopupModal";

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  country_of_birth: string;
  nationality: string;
  passport_number: string;
  passport_issue_date: string;
  passport_expiry_date: string;
  passport_image_url: string;
  personal_photo_url: string;
}

interface Payment {
  id: string;
  grand_total: string;
  payment_status: boolean;
  transaction_id: string;
  processing_type: string;
  fee_per_applicant: string;
  processing_fee_per_applicant: string;
  fee_total: string;
  processing_total: string;
}

interface ApplicationDetails {
  id: string;
  applicant_id: string;
  reference_number: string;
  status: string;
  processing_type: string;
  created_at: string;
  applicants: Applicant[];
  payment: Payment | null;
}

const statusTabs = [
  { key: "pending", label: "Pending", color: "#F97316" },
  { key: "inprogress", label: "In Progress", color: "#2D76B5" },
  { key: "accepted", label: "Accepted", color: "#28806F" },
  { key: "rejected", label: "Rejected", color: "#DF1C41" },
];

const processingLabels: Record<string, string> = {
  standard: "Standard (2-4 days)",
  express: "Express (6-24 hrs)",
  urgent: "Urgent (1 hr)",
};

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const fromPage = searchParams.get("from") || "applications";

  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [outcomeStatus, setOutcomeStatus] = useState("");
  const [outcomeDropdownOpen, setOutcomeDropdownOpen] = useState(false);
  const [messageToApplicant, setMessageToApplicant] = useState("");
  const [visaDocument, setVisaDocument] = useState<string | null>(null);
  const [visaDocumentName, setVisaDocumentName] = useState<string>("");
  const [visaDocumentFile, setVisaDocumentFile] = useState<File | null>(null);
  const [sendEmail, setSendEmail] = useState(false);
  const [savingOutcome, setSavingOutcome] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const data = await api.getApplicationDetails(id);
      setDetails(data);
    } catch (err) {
      console.error("Failed to fetch application details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: string | number) => {
    const num = parseFloat(String(amount || "0"));
    return `$${num.toFixed(2)}`;
  };

  const getFullName = (applicant: Applicant) => {
    return `${applicant.first_name || ""} ${applicant.last_name || ""}`.trim() || "N/A";
  };

  const handleVisaUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setVisaDocument(e.target?.result as string);
      setVisaDocumentName(file.name);
      setVisaDocumentFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOutcome = async () => {
    if (!outcomeStatus) {
      setOutcomeMessage({ type: "error", text: "Please select an outcome status" });
      return;
    }
    setSavingOutcome(true);
    setOutcomeMessage(null);
    try {
      await api.updateOutcome(id, {
        status: outcomeStatus,
        notes: messageToApplicant || undefined,
        visaDocument: visaDocumentFile || null,
      });
      setOutcomeMessage({ type: "success", text: "Outcome saved successfully" });
      setVisaDocument(null);
      setVisaDocumentName("");
      setVisaDocumentFile(null);
      setMessageToApplicant("");
      setOutcomeStatus("");
      fetchDetails();
    } catch (err: any) {
      setOutcomeMessage({ type: "error", text: err?.message || "Failed to save outcome" });
    } finally {
      setSavingOutcome(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "48px", display: "flex", justifyContent: "center", alignItems: "center" }}>
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
    );
  }

  if (!details) {
    return (
      <div style={{ padding: "48px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "16px", color: "#575757" }}>
        Application not found
      </div>
    );
  }

  const applicant = details.applicants?.[0] || null;
  const payment = details.payment;
  const currentStatus = details.status || "pending";

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
        {/* Header row: Application Details title + Bell icon + divider + Admin profile */}
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
            Application Details
          </span>
          <div className="flex items-center" style={{ gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #D9D9D9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Bell style={{ width: "20px", height: "20px", color: "#575757" }} />
            </div>
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

        {/* Back button */}
        <button
          onClick={() => router.push(fromPage === "dashboard" ? "/dashboard" : "/dashboard/applications")}
          className="flex items-center"
          style={{
            gap: "8px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "150%",
            letterSpacing: "-0.01em",
            color: "var(--primary)",
            width: "fit-content",
          }}
        >
          <ArrowLeft style={{ width: "20px", height: "20px", color: "var(--primary)" }} />
          Back to {fromPage === "dashboard" ? "Dashboard" : "Applications"}
        </button>

        {/* Main details card */}
        <div
          style={{
            border: "1px solid #D9D9D9",
            borderRadius: "12px",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {/* Top header bar with Applicant ID */}
          <div
            style={{
              background: "#FAFAF9",
              borderRadius: "12px 12px 0 0",
              paddingTop: "16px",
              paddingRight: "16px",
              paddingBottom: "16px",
              paddingLeft: "16px",
            }}
          >
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
              {details.applicant_id}
            </span>
          </div>

          {/* White content area */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "0 0 12px 12px",
              paddingTop: "16px",
              paddingRight: "16px",
              paddingBottom: "16px",
              paddingLeft: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Row 1: Contact Name | Contact Email */}
            <div className="flex" style={{ gap: "24px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    color: "#73757C",
                  }}
                >
                  Contact Name:
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "140%",
                    letterSpacing: "-0.02em",
                    color: "#1B1B1B",
                  }}
                >
                  {applicant ? getFullName(applicant) : "N/A"}
                </span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    color: "#73757C",
                  }}
                >
                  Contact Email:
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "140%",
                    letterSpacing: "-0.02em",
                    color: "#1B1B1B",
                  }}
                >
                  {applicant?.email || "N/A"}
                </span>
              </div>
            </div>

            {/* Row 2: Contact Phone | Processing */}
            <div className="flex" style={{ gap: "24px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    color: "#73757C",
                  }}
                >
                  Contact Phone:
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "140%",
                    letterSpacing: "-0.02em",
                    color: "#1B1B1B",
                  }}
                >
                  {applicant?.phone || "N/A"}
                </span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    color: "#73757C",
                  }}
                >
                  Processing:
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "140%",
                    letterSpacing: "-0.02em",
                    color: "#1B1B1B",
                  }}
                >
                  {processingLabels[details.processing_type] || details.processing_type || "N/A"}
                </span>
              </div>
            </div>

            {/* Row 3: Order Total | Payment Status */}
            <div className="flex" style={{ gap: "24px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    color: "#73757C",
                  }}
                >
                  Order Total:
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "140%",
                    letterSpacing: "-0.02em",
                    color: "#1B1B1B",
                  }}
                >
                  {payment ? formatCurrency(payment.grand_total) : "N/A"}
                </span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    color: "#73757C",
                  }}
                >
                  Payment Status:
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    borderRadius: "999px",
                    background: payment?.payment_status ? "#28806F" : "#F97316",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "160%",
                    letterSpacing: "0em",
                    color: "#FFFFFF",
                    width: "fit-content",
                  }}
                >
                  {payment?.payment_status ? "Paid" : "Unpaid"}
                </span>
              </div>
            </div>

            {/* Row 4: Payment Reference | Payment Gateway */}
            <div className="flex" style={{ gap: "24px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    color: "#73757C",
                  }}
                >
                  Payment Reference:
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "140%",
                    letterSpacing: "-0.02em",
                    color: "#1B1B1B",
                  }}
                >
                  {payment?.transaction_id || details.reference_number || "N/A"}
                </span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    color: "#73757C",
                  }}
                >
                  Payment Gateway:
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "18px",
                    lineHeight: "140%",
                    letterSpacing: "-0.02em",
                    color: "#1B1B1B",
                  }}
                >
                  Stripe
                </span>
              </div>
            </div>

            {/* Row 5: Order Status tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "150%",
                  letterSpacing: "-0.01em",
                  color: "#73757C",
                }}
              >
                Order Status:
              </span>
              <div className="flex" style={{ gap: "8px" }}>
                {statusTabs.map((tab) => {
                  const isActive = currentStatus === tab.key;
                  return (
                    <div
                      key={tab.key}
                      style={{
                        paddingTop: "6px",
                        paddingRight: "16px",
                        paddingBottom: "6px",
                        paddingLeft: "16px",
                        borderRadius: "999px",
                        border: isActive ? `1px solid ${tab.color}` : "1px solid #D9D9D9",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                        fontSize: "13px",
                        lineHeight: "160%",
                        letterSpacing: "0em",
                        color: isActive ? tab.color : "#73757C",
                        opacity: isActive ? 1 : 0.5,
                        background: "transparent",
                      }}
                    >
                      {tab.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 24px gap */}
        <div style={{ height: "24px" }} />

        {/* Applicant info card */}
        <div
          style={{
            border: "1px solid #D9D9D9",
            borderRadius: "12px",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {/* Top header bar with applicant name */}
          <div
            style={{
              background: "#FAFAF9",
              borderRadius: "12px 12px 0 0",
              paddingTop: "16px",
              paddingRight: "16px",
              paddingBottom: "16px",
              paddingLeft: "16px",
            }}
          >
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
              {applicant ? getFullName(applicant) : "Applicant"}
            </span>
          </div>

          {/* White content area */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "0 0 12px 12px",
              paddingTop: "16px",
              paddingRight: "16px",
              paddingBottom: "16px",
              paddingLeft: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Row 1: Passport Number | Nationality */}
            <div className="flex" style={{ gap: "24px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "150%", letterSpacing: "-0.01em", color: "#73757C" }}>
                  Passport Number:
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "18px", lineHeight: "140%", letterSpacing: "-0.02em", color: "#1B1B1B" }}>
                  {applicant?.passport_number || "N/A"}
                </span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "150%", letterSpacing: "-0.01em", color: "#73757C" }}>
                  Nationality:
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "18px", lineHeight: "140%", letterSpacing: "-0.02em", color: "#1B1B1B" }}>
                  {applicant?.nationality || "N/A"}
                </span>
              </div>
            </div>

            {/* Row 2: Gender | Date of Birth */}
            <div className="flex" style={{ gap: "24px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "150%", letterSpacing: "-0.01em", color: "#73757C" }}>
                  Gender:
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "18px", lineHeight: "140%", letterSpacing: "-0.02em", color: "#1B1B1B" }}>
                  {applicant?.gender ? applicant.gender.charAt(0).toUpperCase() + applicant.gender.slice(1) : "N/A"}
                </span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "150%", letterSpacing: "-0.01em", color: "#73757C" }}>
                  Date of Birth:
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "18px", lineHeight: "140%", letterSpacing: "-0.02em", color: "#1B1B1B" }}>
                  {applicant ? formatDate(applicant.date_of_birth) : "N/A"}
                </span>
              </div>
            </div>

            {/* Row 3: Place of Birth | (empty or Passport Issued) */}
            <div className="flex" style={{ gap: "24px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "150%", letterSpacing: "-0.01em", color: "#73757C" }}>
                  Place of Birth:
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "18px", lineHeight: "140%", letterSpacing: "-0.02em", color: "#1B1B1B" }}>
                  {applicant?.country_of_birth || "N/A"}
                </span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "150%", letterSpacing: "-0.01em", color: "#73757C" }}>
                  Passport Issued:
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "18px", lineHeight: "140%", letterSpacing: "-0.02em", color: "#1B1B1B" }}>
                  {applicant ? formatDate(applicant.passport_issue_date) : "N/A"}
                </span>
              </div>
            </div>

            {/* Row 4: Passport Expires */}
            <div className="flex" style={{ gap: "24px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "150%", letterSpacing: "-0.01em", color: "#73757C" }}>
                  Passport Expires:
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "18px", lineHeight: "140%", letterSpacing: "-0.02em", color: "#1B1B1B" }}>
                  {applicant ? formatDate(applicant.passport_expiry_date) : "N/A"}
                </span>
              </div>
              <div style={{ flex: 1 }} />
            </div>

            {/* Uploaded Files section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "16px", lineHeight: "150%", letterSpacing: "-0.01em", color: "#73757C" }}>
                Uploaded Files:
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "13px", lineHeight: "150%", letterSpacing: "0em", color: "#73757C", marginTop: "-8px" }}>
                Submitted by the customer. Click preview to open full size in a new tab.
              </span>

              <div className="flex" style={{ gap: "12px" }}>
                {/* Applicant Photo */}
                <div
                  style={{
                    flex: 1,
                    maxWidth: "508px",
                    border: "1px solid #D9D9D9",
                    borderRadius: "12px",
                    padding: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      background: "#FAFAF9",
                      borderRadius: "12px 12px 0 0",
                      paddingTop: "10px",
                      paddingRight: "12px",
                      paddingBottom: "10px",
                      paddingLeft: "12px",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "14px", lineHeight: "160%", letterSpacing: "0em", color: "#0F0F0F" }}>
                      Applicant Photo
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "0 0 12px 12px",
                      paddingTop: "12px",
                      paddingRight: "12px",
                      paddingBottom: "12px",
                      paddingLeft: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {applicant?.personal_photo_url ? (
                      <img
                        src={applicant.personal_photo_url}
                        alt="Applicant Photo"
                        style={{ width: "180px", height: "180px", objectFit: "cover", borderRadius: "8px", border: "1px solid #D9D9D9" }}
                      />
                    ) : (
                      <div style={{ width: "180px", height: "180px", borderRadius: "8px", border: "1px solid #D9D9D9", background: "#FAFAF9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "#73757C" }}>No photo</span>
                      </div>
                    )}
                    {applicant?.personal_photo_url && (
                      <>
                        <div style={{ width: "100%", height: "1px", background: "#E5E5E5" }} />
                        <a
                          href={applicant.personal_photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                          style={{ gap: "6px", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "13px", color: "var(--primary)", textDecoration: "none", cursor: "pointer" }}
                        >
                          <LinkIcon style={{ width: "14px", height: "14px", color: "var(--primary)" }} />
                          Open in new tab
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Passport Document */}
                <div
                  style={{
                    flex: 1,
                    maxWidth: "508px",
                    border: "1px solid #D9D9D9",
                    borderRadius: "12px",
                    padding: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      background: "#FAFAF9",
                      borderRadius: "12px 12px 0 0",
                      paddingTop: "10px",
                      paddingRight: "12px",
                      paddingBottom: "10px",
                      paddingLeft: "12px",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "14px", lineHeight: "160%", letterSpacing: "0em", color: "#0F0F0F" }}>
                      Passport Document
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "0 0 12px 12px",
                      paddingTop: "12px",
                      paddingRight: "12px",
                      paddingBottom: "12px",
                      paddingLeft: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {applicant?.passport_image_url ? (
                      <img
                        src={applicant.passport_image_url}
                        alt="Passport Document"
                        style={{ width: "180px", height: "180px", objectFit: "cover", borderRadius: "8px", border: "1px solid #D9D9D9" }}
                      />
                    ) : (
                      <div style={{ width: "180px", height: "180px", borderRadius: "8px", border: "1px solid #D9D9D9", background: "#FAFAF9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "#73757C" }}>No document</span>
                      </div>
                    )}
                    {applicant?.passport_image_url && (
                      <>
                        <div style={{ width: "100%", height: "1px", background: "#E5E5E5" }} />
                        <a
                          href={applicant.passport_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                          style={{ gap: "6px", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "13px", color: "var(--primary)", textDecoration: "none", cursor: "pointer" }}
                        >
                          <LinkIcon style={{ width: "14px", height: "14px", color: "var(--primary)" }} />
                          Open in new tab
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 24px gap */}
        <div style={{ height: "24px" }} />

        {/* Traveler Outcome card */}
        <div
          style={{
            border: "1px solid #D9D9D9",
            borderRadius: "12px",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {/* Top header bar */}
          <div
            style={{
              background: "#FAFAF9",
              borderRadius: "12px 12px 0 0",
              paddingTop: "16px",
              paddingRight: "16px",
              paddingBottom: "16px",
              paddingLeft: "16px",
            }}
          >
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
              Traveler outcome — {applicant ? getFullName(applicant) : "Applicant"}
            </span>
          </div>

          {/* White content area */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "0 0 12px 12px",
              paddingTop: "16px",
              paddingRight: "16px",
              paddingBottom: "16px",
              paddingLeft: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Description text */}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "150%",
                letterSpacing: "-0.01em",
                color: "#73757C",
              }}
            >
              Decision for this person only. Approve or reject, optionally attach the visa document, and email the customer in one step. Order-wide status is above.
            </span>

            {/* Outcome Status label + dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                Outcome Status
              </span>
              <div style={{ position: "relative", width: "100%" }}>
                <button
                  onClick={() => setOutcomeDropdownOpen(!outcomeDropdownOpen)}
                  className="flex items-center justify-between"
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    borderRadius: "12px",
                    border: "1px solid #D9D9D9",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: outcomeStatus ? "#0F0F0F" : "#73757C",
                  }}
                >
                  {outcomeStatus
                    ? statusTabs.find((t) => t.key === outcomeStatus)?.label || outcomeStatus
                    : "Select status"}
                  <ChevronDown
                    style={{
                      width: "20px",
                      height: "20px",
                      color: "#575757",
                      transform: outcomeDropdownOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
                {outcomeDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: "4px",
                      background: "#FFFFFF",
                      border: "1px solid #D9D9D9",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 10,
                      overflow: "hidden",
                    }}
                  >
                    {statusTabs.map((tab) => (
                      <div
                        key={tab.key}
                        onClick={() => {
                          setOutcomeStatus(tab.key);
                          setOutcomeDropdownOpen(false);
                        }}
                        className="flex items-center"
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                          fontSize: "14px",
                          fontWeight: 400,
                          color: outcomeStatus === tab.key ? tab.color : "#0F0F0F",
                          background: outcomeStatus === tab.key ? "#FAFAF9" : "transparent",
                          borderBottom: "1px solid #F0F0F0",
                        }}
                      >
                        {tab.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Message to Applicant label + textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                Message to Applicant
              </span>
              <textarea
                value={messageToApplicant}
                onChange={(e) => setMessageToApplicant(e.target.value)}
                placeholder="Write a message to the applicant..."
                rows={5}
                style={{
                  width: "100%",
                  paddingTop: "12px",
                  paddingRight: "16px",
                  paddingBottom: "12px",
                  paddingLeft: "16px",
                  borderRadius: "12px",
                  border: "1px solid #D9D9D9",
                  background: "#FFFFFF",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#0F0F0F",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: "160%",
                }}
              />
            </div>

            {/* Visa or outcome document label + upload area */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                Visa or outcome document (PDF or Image)
              </span>

              {visaDocument ? (
                <div
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    border: "1px solid #D9D9D9",
                    background: "#FAFAF9",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  {visaDocument.match(/^data:image\//) ? (
                    <img
                      src={visaDocument}
                      alt="Document preview"
                      style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "120px",
                        height: "80px",
                        borderRadius: "8px",
                        border: "1px solid #D9D9D9",
                        background: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#73757C" }}>PDF</span>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", fontWeight: 500, color: "#0F0F0F", margin: 0 }}>
                      {visaDocumentName || "Document uploaded"}
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 400, color: "#73757C", marginTop: "4px", margin: 0 }}>
                      Click the trash icon to replace the document
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setVisaDocument(null);
                      setVisaDocumentName("");
                      setVisaDocumentFile(null);
                    }}
                    className="flex items-center justify-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "1px solid #D9D9D9",
                      background: "#FFFFFF",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 style={{ width: "18px", height: "18px", color: "#575757" }} />
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "192px",
                    border: "1px dashed #D9D9D9",
                    borderRadius: "16px",
                    padding: "24px",
                    background: "#FAFAF9",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <Upload style={{ width: "42px", height: "42px", color: "#575757" }} />
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "150%",
                      letterSpacing: "-0.01em",
                      color: "#0F0F0F",
                      textAlign: "center",
                      margin: 0,
                    }}
                  >
                    Drag your file(s) to start uploading
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                    <div style={{ width: "79px", height: "1px", background: "#D9D9D9" }} />
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 400, color: "#73757C" }}>OR</span>
                    <div style={{ width: "79px", height: "1px", background: "#D9D9D9" }} />
                  </div>
                  <label
                    className="flex items-center justify-center"
                    style={{
                      width: "160px",
                      height: "32px",
                      gap: "8px",
                      paddingTop: "6px",
                      paddingRight: "12px",
                      paddingBottom: "6px",
                      paddingLeft: "12px",
                      borderRadius: "999px",
                      background: "var(--primary)",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <Upload style={{ width: "16px", height: "16px" }} />
                    Upload File
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVisaUpload(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Send email checkbox */}
            <div className="flex items-start" style={{ gap: "12px" }}>
              <div
                onClick={() => setSendEmail(!sendEmail)}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  border: sendEmail ? "2px solid var(--primary)" : "1px solid #D9D9D9",
                  background: sendEmail ? "var(--primary)" : "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  cursor: "pointer",
                  marginTop: "2px",
                }}
              >
                {sendEmail && <Check style={{ width: "16px", height: "16px", color: "#FFFFFF" }} />}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "160%",
                  color: "#0F0F0F",
                }}
              >
                Send email to customer
              </span>
            </div>

            {/* Save Outcome button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveOutcome}
                disabled={savingOutcome}
                className="flex items-center justify-center"
                style={{
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  borderRadius: "999px",
                  border: "none",
                  background: savingOutcome ? "var(--form-border)" : "var(--primary)",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-sans)",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: savingOutcome ? "not-allowed" : "pointer",
                }}
              >
                {savingOutcome ? "Saving..." : "Save Outcome"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <PopupModal
        open={!!outcomeMessage}
        type={outcomeMessage?.type || "success"}
        message={outcomeMessage?.text || ""}
        onClose={() => setOutcomeMessage(null)}
      />
    </div>
  );
}
