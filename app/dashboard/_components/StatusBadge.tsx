import Badge from "@/app/_components/Badge";

// Thin wrapper kept for existing call sites; the shared Badge owns the styling.
export default function StatusBadge({ status }: { status: string }) {
  return <Badge status={status} />;
}
