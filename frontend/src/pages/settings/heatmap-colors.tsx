import { updateHeatmapColor } from "@/api/heatmapColors";
import { RiskHeatmap } from "@/components/RiskHeatmap";
import { HeatmapColorModal } from "@/components/settings/HeatmapColorModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  heatmapColorFormSchema,
  heatmapColorSchema,
} from "@/schemas/heatmapColor.schema";
import { useState } from "react";
import { toast } from "sonner";
import type z from "zod";

export default function HeatmapColors() {
  const [editCellOpen, setEditCellOpen] = useState(false);
  const [selectedCell, setSelectedCell] =
    useState<z.infer<typeof heatmapColorSchema>>();

  function onEditClick(cell: z.infer<typeof heatmapColorSchema>) {
    setSelectedCell(cell);
    setEditCellOpen(true);
  }

  async function onEditSubmit(cell: z.infer<typeof heatmapColorFormSchema>) {
    const res = await updateHeatmapColor(selectedCell?.id as number, cell);
    if (res?.success) {
      toast.success("Update heatmap color completed!", {
        description: `Likelihood: ${selectedCell?.likelihood}, Impact: ${selectedCell?.impact}`,
      });
    } else {
      toast.error("Invalid information.", {
        description: "Please try again.",
      });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Heatmap Colors</CardTitle>
          <CardDescription>
            Click on a cell to customize its color.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <RiskHeatmap onChange={(cell) => cell && onEditClick(cell)} />
          </div>
        </CardContent>
      </Card>
      <HeatmapColorModal
        open={editCellOpen}
        onOpenChange={setEditCellOpen}
        onSubmitForm={onEditSubmit}
        existingValues={{
          id: selectedCell?.id,
          likelihood: selectedCell?.likelihood,
          impact: selectedCell?.impact,
          color: selectedCell?.color,
        }}
      />
    </>
  );
}
