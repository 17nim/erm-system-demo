import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import capitalize from "@/utils/stringHelper";
import { useNavigate } from "react-router-dom";
import { useLabels } from "@/contexts/LabelContext";
import { usePeriod } from "@/contexts/PeriodContext";
import { useHeatmapColors } from "@/contexts/HeatmapColorContext";
import { cn } from "@/lib/utils";
import { cellColorClass } from "@/components/settings/HeatmapColorModal";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Risk = z.object({
  id: z.int(),
  name: z.string(),
  period: z.string(),
  category: z.object({
    id: z.int(),
    name: z.string(),
  }),
  division: z.string(),
  owner: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  inherentLikelihood: z.int().min(1).max(5),
  inherentImpact: z.int().min(1).max(5),
  residualLikelihood: z.int().min(1).max(5),
  residualImpact: z.int().min(1).max(5),
  effectiveness: z.int().min(1).max(25),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  approvedAt: z.iso.datetime(),
  status: z.enum(["draft", "completed", "approved"]),
});

export type Risk = z.infer<typeof Risk>;

export const statusStyles: Record<string, string> = {
  draft: "bg-slate-300/50 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  completed: "bg-cyan-300/50 text-cyan-700 dark:bg-cyan-700 dark:text-cyan-200",
  verified:
    "bg-amber-300/50 text-amber-700 dark:bg-amber-700 dark:text-amber-200",
  approved: "bg-lime-300/50 text-lime-700 dark:bg-lime-700 dark:text-lime-200",
};

export const columns = (
  onUpdateEffectivenessClick: (risk: Risk) => void
): ColumnDef<Risk>[] => [
  {
    id: "select",
    size: 30,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    accessorFn: (_, index) => index,
    header: () => <p className="text-center">#</p>,
    size: 40,
    cell: ({ row }) => (
      <p className="text-muted-foreground text-xs">{row.index + 1}</p>
    ),
    meta: { className: "text-center" },
  },
  {
    accessorKey: "name",
    header: "Name",
    minSize: 200,
    cell: ({ row }) => {
      const name = row.original.name;
      const navigate = useNavigate();
      return (
        <div
          className="cursor-pointer hover:underline hover:underline-offset-4"
          onClick={() => navigate(`/risks/${row.original.id}`)}
        >
          <p className="line-clamp-2 whitespace-normal wrap-anywhere">{name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      const classes = statusStyles[status] ?? "hidden";
      return (
        <span
          className={`${classes} px-2 py-1 rounded-md text-xs font-medium select-none`}
        >
          {status !== "verified" ? capitalize(status) : "CRM Verified"}
        </span>
      );
    },
  },
  {
    accessorKey: "period",
    header: "Period",
    size: 80,
    cell: ({ row }) => {
      const { period } = usePeriod();
      return (
        <div className="flex items-center gap-1.5">
          <p>{row.original.period}</p>
          {row.original.period === period?.name && (
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                "bg-lime-500 shadow-lime-400/70",
                "shadow-sm animate-pulse"
              )}
            />
          )}
        </div>
      );
    },
  },
  {
    id: "category",
    accessorKey: "category.name",
    header: "Category",
    minSize: 100,
    cell: ({ row }) => {
      const risk = row.original;
      return risk.category.name ? (
        <p className="line-clamp-2 whitespace-normal wrap-anywhere">
          {risk.category.name}
        </p>
      ) : (
        <p className="text-muted-foreground">Not selected</p>
      );
    },
  },
  {
    accessorKey: "division",
    header: "Division",
    size: 90,
  },
  {
    accessorKey: "inherentLikelihood",
    header: "Inherent Likelihood",
    size: 160,
    cell: ({ row }) => {
      const { labels } = useLabels();
      return row.original.inherentLikelihood ? (
        <p className="line-clamp-2 whitespace-normal wrap-anywhere">
          {row.original.inherentLikelihood}
          {" – "}
          {
            labels?.find(
              (label) =>
                label.type === "likelihood" &&
                label.score == row.original.inherentLikelihood
            )?.label
          }
        </p>
      ) : (
        <p className="text-muted-foreground">Not selected</p>
      );
    },
  },
  {
    accessorKey: "inherentImpact",
    header: "Inherent Impact",
    cell: ({ row }) => {
      const { labels } = useLabels();
      return row.original.inherentImpact ? (
        <p className="line-clamp-2 whitespace-normal wrap-anywhere">
          {row.original.inherentImpact}
          {" – "}
          {
            labels?.find(
              (label) =>
                label.type === "impact" &&
                label.score == row.original.inherentImpact
            )?.label
          }
        </p>
      ) : (
        <p className="text-muted-foreground">Not selected</p>
      );
    },
  },
  {
    id: "inherentScore",
    accessorFn: (row) => row.inherentLikelihood * row.inherentImpact,
    header: () => (
      <Tooltip delayDuration={500}>
        <TooltipTrigger>Inherent Score</TooltipTrigger>
        <TooltipContent>
          <p>= Inherent Likelihood × Inherent Impact</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      const { heatmapColors } = useHeatmapColors();
      const heatmapCell = heatmapColors?.find(
        (cell) =>
          cell.likelihood === row.original.inherentLikelihood &&
          cell.impact === row.original.inherentImpact
      );
      const inherentScore =
        row.original.inherentLikelihood * row.original.inherentImpact;
      return inherentScore === 0 ? (
        <p className="text-muted-foreground">-</p>
      ) : (
        <Tooltip delayDuration={500}>
          <TooltipTrigger className="flex items-center gap-2">
            <div
              className={cn(
                "w-4 h-4 rounded-full inline-block",
                cellColorClass[heatmapCell?.color as string]
              )}
            />
            {inherentScore}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>= Inherent Likelihood × Inherent Impact</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "residualLikelihood",
    header: "Residual Likelihood",
    size: 160,
    cell: ({ row }) => {
      const { labels } = useLabels();
      return row.original.residualLikelihood ? (
        <p className="line-clamp-2 whitespace-normal wrap-anywhere">
          {row.original.residualLikelihood}
          {" – "}
          {
            labels?.find(
              (label) =>
                label.type === "likelihood" &&
                label.score == row.original.residualLikelihood
            )?.label
          }
        </p>
      ) : (
        <p className="text-muted-foreground">Not selected</p>
      );
    },
  },
  {
    accessorKey: "residualImpact",
    header: "Residual Impact",
    cell: ({ row }) => {
      const { labels } = useLabels();
      return row.original.residualImpact ? (
        <p className="line-clamp-2 whitespace-normal wrap-anywhere">
          {row.original.residualImpact}
          {" – "}
          {
            labels?.find(
              (label) =>
                label.type === "impact" &&
                label.score == row.original.residualImpact
            )?.label
          }
        </p>
      ) : (
        <p className="text-muted-foreground">Not selected</p>
      );
    },
  },
  {
    id: "residualScore",
    accessorFn: (row) => row.residualLikelihood * row.residualImpact,
    header: () => (
      <Tooltip delayDuration={500}>
        <TooltipTrigger>Residual Score</TooltipTrigger>
        <TooltipContent>
          <p>= Residual Likelihood × Residual Impact</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      const { heatmapColors } = useHeatmapColors();
      const heatmapCell = heatmapColors?.find(
        (cell) =>
          cell.likelihood === row.original.residualLikelihood &&
          cell.impact === row.original.residualImpact
      );
      const residualScore =
        row.original.residualLikelihood * row.original.residualImpact;
      return residualScore === 0 ? (
        <p className="text-muted-foreground">-</p>
      ) : (
        <Tooltip delayDuration={500}>
          <TooltipTrigger className="flex items-center gap-2">
            <div
              className={cn(
                "w-4 h-4 rounded-full inline-block",
                cellColorClass[heatmapCell?.color as string]
              )}
            />
            {residualScore}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>= Residual Likelihood × Residual Impact</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "effectiveness",
    accessorFn: (row) => row.effectiveness,
    header: "Effectiveness",
    cell: ({ row }) => {
      const risk = row.original;
      const { period } = usePeriod();
      return (
        <div className="flex items-center gap-3">
          <p
            className={cn(
              !risk.effectiveness && "text-muted-foreground",
              "w-[1rem]"
            )}
          >
            {risk.effectiveness || "-"}
          </p>
          {risk.period === period?.name && risk.status === "approved" && (
            <Badge
              variant="outline"
              className="select-none cursor-pointer shadow-sm bg-white dark:bg-accent active:opacity-80 hover:shadow-md hover:scale-105 transition-all"
              onClick={() => onUpdateEffectivenessClick(risk)}
            >
              Edit
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorFn: (row) => `${row.owner.firstName} ${row.owner.lastName}`,
    id: "ownerFullName",
    header: "Owner",
    cell: ({ row }) => (
      <p className="line-clamp-2 whitespace-normal wrap-anywhere">
        {row.original.owner.firstName + " " + row.original.owner.lastName}
      </p>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created at",

    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const formatted = date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated at",
    cell: ({ row }) => {
      const risk = row.original;
      if (risk.updatedAt) {
        const date = new Date(risk.updatedAt);
        const formatted = date.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return <span>{formatted}</span>;
      } else return <p className="text-muted-foreground">-</p>;
    },
  },
  {
    accessorKey: "approvedAt",
    header: "Approved at",
    cell: ({ row }) => {
      const risk = row.original;
      if (risk.approvedAt) {
        const date = new Date(row.original.approvedAt);
        const formatted = date.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return <span>{formatted}</span>;
      } else return <p className="text-muted-foreground">-</p>;
    },
  },
];
