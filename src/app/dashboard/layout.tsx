import Sidebar from "@/components/Sidebar/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex" style={{ minHeight: "100vh" }}>
        <Sidebar />
        <div className="flex-1" style={{ overflow: "auto" }}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
