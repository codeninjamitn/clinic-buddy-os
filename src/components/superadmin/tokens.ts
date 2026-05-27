import type { CSSProperties } from "react";

export const saCard: CSSProperties = {
  background: "#102F40",
  border: "1px solid #1A4055",
  borderRadius: 12,
  color: "#FFFFFF",
};

export const saChip: CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  background: "#0A2535",
  border: "1px solid #1A4055",
  color: "#7FBBC5",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "capitalize",
};

export const saInput: CSSProperties = {
  width: "100%",
  background: "#0A2535",
  border: "1px solid #1A4055",
  color: "#FFFFFF",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13,
  outline: "none",
};

export const saLabel: CSSProperties = {
  display: "block",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 4,
  color: "#7FBBC5",
  fontWeight: 600,
};

export function saBadge(status: string): CSSProperties {
  if (status === "active") return { background: "rgba(2,195,154,0.15)", color: "#02C39A" };
  if (status === "suspended") return { background: "rgba(224,92,92,0.15)", color: "#E05C5C" };
  return { background: "rgba(245,158,11,0.15)", color: "#F59E0B" };
}

export function saActionBadge(action: string): CSSProperties {
  if (action === "clinic_created") return { background: "rgba(2,195,154,0.15)", color: "#02C39A" };
  if (action === "clinic_suspended" || action === "clinic_deleted") return { background: "rgba(224,92,92,0.15)", color: "#E05C5C" };
  if (action === "clinic_activated") return { background: "rgba(16,185,129,0.15)", color: "#10B981" };
  return { background: "rgba(59,130,246,0.15)", color: "#60A5FA" };
}
