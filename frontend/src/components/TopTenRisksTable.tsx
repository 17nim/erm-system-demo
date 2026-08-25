import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { getTopTenRisks } from "@/api/risks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "./spinner";

export default function TopTenRisksTable() {
  const [topTenRisks, setTopTenRisks] = useState<
    {
      id: number;
      name: string;
      residualLikelihood: number;
      residualImpact: number;
      residualRisk: number;
    }[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTopTenRisks();
        setTopTenRisks(data ?? []);
      } catch (e) {
        console.error(e);
      }
    }
    load().finally(() => setIsLoading(false));
  }, []);

  const navigate = useNavigate();

  return isLoading ? (
    <div className="flex items-center gap-x-4 justify-center py-12">
      <Spinner />
      <p className="text-muted-foreground animate-pulse">Loading...</p>
    </div>
  ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-center">Residual Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topTenRisks?.map((risk, i) => (
          <TableRow key={risk.id}>
            <TableCell className="font-medium text-center">{i + 1}</TableCell>
            <TableCell className="cursor-pointer hover:underline hover:underline-offset-4">
              <p
                className="line-clamp-1 whitespace-normal wrap-anywhere"
                onClick={() => navigate(`/risks/${risk.id}`)}
              >
                {risk.name}
              </p>
            </TableCell>
            <TableCell className="text-center">{risk.residualRisk}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
