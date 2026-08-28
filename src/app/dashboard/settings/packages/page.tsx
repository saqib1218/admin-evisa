"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { api } from "@/utils/api";
import NotificationBell from "@/components/NotificationBell/NotificationBell";

interface Package {
  id: number;
  key: string;
  label: string;
  fee: string;
  processing_fee: string;
  processing_time: string;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const badgeColors: Record<string, { bg: string; color: string }> = {
  Popular: { bg: "#EFFEFA", color: "#28806F" },
  Fastest: { bg: "#EFF4F9", color: "#2D76B5" },
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPackages();
      setPackages(data.packages || []);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleSave = async (formData: any, isEdit: boolean, id?: number) => {
    setSaving(true);
    setError("");
    try {
      if (isEdit && id) {
        await api.updatePackage(String(id), formData);
      } else {
        await api.createPackage(formData);
      }
      setShowAddModal(false);
      setEditTarget(null);
      fetchPackages();
    } catch (err: any) {
      setError(err?.message || "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deletePackage(String(deleteTarget.id));
      setDeleteTarget(null);
      fetchPackages();
    } catch (err: any) {
      setError(err?.message || "Failed to delete package");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ paddingTop: "24px", paddingBottom: "24px", paddingLeft: "36px", paddingRight: "36px" }}>
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
        {/* Header */}
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
            Packages
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
                  color: "#0F0F0F",
                }}
              >
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Add Package button */}
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "14px",
              color: "#575757",
            }}
          >
            Manage processing packages, prices and processing times
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center"
            style={{
              height: "40px",
              gap: "8px",
              paddingTop: "10px",
              paddingRight: "16px",
              paddingBottom: "10px",
              paddingLeft: "16px",
              borderRadius: "999px",
              border: "none",
              background: "var(--primary)",
              color: "#FFFFFF",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            Add Package
          </button>
        </div>

        {/* Table */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #D9D9D9",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFFFF" }}>
            <thead>
              <tr>
                {["Label", "Key", "Fee", "Processing Fee", "Processing Time", "Badge", "Status", "Actions"].map((header) => (
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
                    <div className="flex items-center justify-center">
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
              ) : packages.length === 0 ? (
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
                    No Packages Found
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} style={{ borderBottom: "1px solid #E5E5E5" }}>
                    <td style={{ padding: "12px 20px", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "14px", color: "#0F0F0F" }}>
                      {pkg.label}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "14px", color: "#575757" }}>
                      {pkg.key}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "14px", color: "#0F0F0F" }}>
                      ${parseFloat(pkg.fee).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "14px", color: "#0F0F0F" }}>
                      ${parseFloat(pkg.processing_fee).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "14px", color: "#0F0F0F" }}>
                      {pkg.processing_time}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      {pkg.badge ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            height: "26px",
                            borderRadius: "99px",
                            paddingTop: "3px",
                            paddingRight: "8px",
                            paddingBottom: "3px",
                            paddingLeft: "8px",
                            background: (badgeColors[pkg.badge] || { bg: "#EFF4F9" }).bg,
                            fontSize: "12px",
                            fontWeight: 400,
                            color: (badgeColors[pkg.badge] || { color: "#2D76B5" }).color,
                          }}
                        >
                          {pkg.badge}
                        </span>
                      ) : (
                        <span style={{ color: "#999", fontSize: "14px" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: "26px",
                          borderRadius: "99px",
                          paddingTop: "3px",
                          paddingRight: "8px",
                          paddingBottom: "3px",
                          paddingLeft: "8px",
                          background: pkg.is_active ? "#EFFEFA" : "#FEE2E2",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: pkg.is_active ? "#28806F" : "#DF1C41",
                        }}
                      >
                        {pkg.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <div className="flex items-center" style={{ gap: "8px" }}>
                        <button
                          onClick={() => setEditTarget(pkg)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Edit style={{ width: "18px", height: "18px", color: "#2D76B5" }} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(pkg)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 style={{ width: "18px", height: "18px", color: "#DF1C41" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editTarget) && (
        <PackageFormModal
          package={editTarget}
          saving={saving}
          error={error}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditTarget(null);
            setError("");
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
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
              padding: "32px",
              maxWidth: "420px",
              width: "90%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setDeleteTarget(null)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
            >
              <X style={{ width: "20px", height: "20px", color: "#73757C" }} />
            </button>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 style={{ width: "28px", height: "28px", color: "#DF1C41" }} />
            </div>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "20px", color: "#0F0F0F", textAlign: "center" }}>
              Delete Package
            </span>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "15px", color: "#575757", textAlign: "center" }}>
              Are you sure you want to delete &quot;{deleteTarget.label}&quot;? This action cannot be undone.
            </span>
            <div className="flex items-center" style={{ gap: "12px", marginTop: "4px" }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{
                  height: "40px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  borderRadius: "999px",
                  border: "1px solid #D9D9D9",
                  background: "#FFFFFF",
                  color: "#575757",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  height: "40px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  borderRadius: "999px",
                  border: "none",
                  background: "#DF1C41",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Package Form Modal (Add / Edit) ---
function PackageFormModal({
  package: pkg,
  saving,
  error,
  onSave,
  onClose,
}: {
  package: Package | null;
  saving: boolean;
  error: string;
  onSave: (data: any, isEdit: boolean, id?: number) => void;
  onClose: () => void;
}) {
  const isEdit = !!pkg;
  const [key, setKey] = useState(pkg?.key || "");
  const [label, setLabel] = useState(pkg?.label || "");
  const [fee, setFee] = useState(pkg?.fee || "");
  const [processingFee, setProcessingFee] = useState(pkg?.processing_fee || "");
  const [processingTime, setProcessingTime] = useState(pkg?.processing_time || "");
  const [badge, setBadge] = useState(pkg?.badge || "");
  const [sortOrder, setSortOrder] = useState(pkg?.sort_order?.toString() || "0");
  const [isActive, setIsActive] = useState(pkg?.is_active ?? true);

  const handleSubmit = () => {
    const data: any = {
      key: key.trim(),
      label: label.trim(),
      fee: parseFloat(fee),
      processingFee: parseFloat(processingFee),
      processingTime: processingTime.trim(),
      badge: badge.trim() || null,
      sortOrder: parseInt(sortOrder, 10) || 0,
    };
    if (isEdit) {
      data.isActive = isActive;
      onSave(data, true, pkg!.id);
    } else {
      onSave(data, false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    border: "1px solid #D9D9D9",
    padding: "12px 16px",
    background: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 400,
    color: "#0F0F0F",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 500,
    color: "#575757",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
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
          padding: "32px",
          maxWidth: "560px",
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
        >
          <X style={{ width: "20px", height: "20px", color: "#73757C" }} />
        </button>

        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "20px", color: "#0F0F0F" }}>
          {isEdit ? "Edit Package" : "Add Package"}
        </span>

        {error && (
          <div style={{ padding: "10px 16px", borderRadius: "8px", background: "#FEE2E2", color: "#DF1C41", fontSize: "13px", fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div className="flex flex-col" style={{ gap: "16px" }}>
          {/* Key */}
          <div>
            <label style={labelStyle}>Key (unique identifier)</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. standard, express, fastest"
              disabled={isEdit}
              style={{ ...inputStyle, opacity: isEdit ? 0.6 : 1 }}
            />
          </div>

          {/* Label */}
          <div>
            <label style={labelStyle}>Label (display name)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 2-5 Days processing"
              style={inputStyle}
            />
          </div>

          {/* Fee + Processing Fee */}
          <div className="flex" style={{ gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="59.00"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Processing Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={processingFee}
                onChange={(e) => setProcessingFee(e.target.value)}
                placeholder="30.90"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Processing Time + Badge */}
          <div className="flex" style={{ gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Processing Time</label>
              <input
                type="text"
                value={processingTime}
                onChange={(e) => setProcessingTime(e.target.value)}
                placeholder="e.g. 2-5 Days"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Badge (optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Popular, Fastest"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label style={labelStyle}>Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="1"
              style={inputStyle}
            />
          </div>

          {/* Active toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center" style={{ gap: "12px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Active</label>
              <button
                onClick={() => setIsActive(!isActive)}
                style={{
                  width: "44px",
                  height: "24px",
                  borderRadius: "999px",
                  border: "none",
                  background: isActive ? "#28806F" : "#D9D9D9",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: isActive ? "22px" : "2px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    transition: "left 0.2s",
                  }}
                />
              </button>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end" style={{ gap: "12px", marginTop: "4px" }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              height: "40px",
              paddingLeft: "24px",
              paddingRight: "24px",
              borderRadius: "999px",
              border: "1px solid #D9D9D9",
              background: "#FFFFFF",
              color: "#575757",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              height: "40px",
              paddingLeft: "24px",
              paddingRight: "24px",
              borderRadius: "999px",
              border: "none",
              background: "var(--primary)",
              color: "#FFFFFF",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              opacity: saving ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            {!saving && <Check style={{ width: "16px", height: "16px" }} />}
          </button>
        </div>
      </div>
    </div>
  );
}
