import { useAuth } from "@/contexts/AuthContext";
import { HeatmapColorsProvider } from "@/contexts/HeatmapColorContext";
import { LabelsProvider } from "@/contexts/LabelContext";
import { PeriodProvider } from "@/contexts/PeriodContext";
import { Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Spinner } from "../spinner";

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen gap-x-4">
        <Spinner />
        Loading...
      </div>
    );
  }

  return user ? (
    <PeriodProvider>
      <LabelsProvider>
        <HeatmapColorsProvider>
          <MainLayout />
        </HeatmapColorsProvider>
      </LabelsProvider>
    </PeriodProvider>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default ProtectedLayout;
