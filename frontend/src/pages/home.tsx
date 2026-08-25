import "../App.css";
import { MetaTitle } from "@/components/MetaTitle";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import CreateRiskButton from "@/components/CreateRiskButton";
import TopTenRisksTable from "@/components/TopTenRisksTable";
import { RiskHeatmap } from "@/components/RiskHeatmap";
import { getTopTenRisks } from "@/api/risks";
import { usePeriod } from "@/contexts/PeriodContext";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (user?.role === "approver") return <Navigate to="/risks" replace />;

  const { period } = usePeriod();

  const [topTenRisks, setTopTenRisks] = useState<
    {
      id: number;
      name: string;
      residualLikelihood: number;
      residualImpact: number;
      residualRisk: number;
    }[]
  >();

  const fetchTopTenRisks = async () => {
    const res = await getTopTenRisks();
    setTopTenRisks(res);
  };

  useEffect(() => {
    fetchTopTenRisks();
  }, []);

  const heatmapEntries = topTenRisks?.map((risk) => {
    return {
      impact: risk.residualImpact,
      likelihood: risk.residualLikelihood,
      label: risk.name,
    };
  });

  return (
    <>
      <MetaTitle title="Home" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight md:text-nowrap">
          Welcome back, {user?.first_name}!
        </h1>
        {["owner", "admin"].includes(user?.role as string) && (
          <>
            <div className="flex items-center md:justify-end">
              <div
                className={cn(
                  "text-muted-foreground text-sm self-center-safe pr-4",
                  "flex items-center gap-1.5"
                )}
              >
                Current period:{" "}
                <strong className="font-medium">{period?.name}</strong>
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    period?.name === "Closed"
                      ? "bg-rose-500 shadow-rose-400/70"
                      : "bg-lime-500 shadow-lime-400/70",
                    "shadow-sm animate-pulse"
                  )}
                />
              </div>
              <CreateRiskButton disabled={!period?.id} />
              <Button
                variant="link"
                className="cursor-pointer"
                onClick={() => navigate("/risks")}
              >
                <ArrowRight />
                View all risks
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Risks</CardTitle>
                <CardDescription>Sorted by residual score</CardDescription>
                <CardContent className="px-0">
                  <TopTenRisksTable />
                </CardContent>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Risk Heatmap</CardTitle>
                <CardDescription>based on top 10 risks</CardDescription>
                <CardContent>
                  <div className="flex justify-center">
                    <RiskHeatmap entries={heatmapEntries ?? []} />
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
          </>
        )}
      </div>
      {user?.role == "approver" && (
        <div>
          <Button
            variant="link"
            className="cursor-pointer"
            onClick={() => navigate("/risks")}
          >
            <ArrowRight />
            View all risks
          </Button>
        </div>
      )}
    </>
  );
}

export default Home;
