import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import type z from "zod";
import type { heatmapColorSchema } from "@/schemas/heatmapColor.schema";
import { getHeatmapColors } from "@/api/heatmapColors";
import { MoreHorizontalIcon, PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "./spinner";

type RiskPoint = z.infer<typeof heatmapColorSchema>;

interface RiskHeatmapProps {
  /** Current selected point (1–5), or null for none */
  value?: RiskPoint | null;
  /** Called when user clicks a cell */
  onChange?: (val: RiskPoint | undefined) => void;
  /** Make it read-only (no click) */
  readOnly?: boolean;
  /** Display risk(s) inside a cell base on the scores */
  entries?: { impact: number; likelihood: number; label: string }[];
  /** Pixel size per cell (default 80) */
  cellSize?: number;
  /** Show axes labels 1..5 (default true) */
  showAxes?: boolean;
  riskPage?: boolean;
}

const colorClass: Record<string, string> = {
  sky: "bg-sky-500/40 border-sky-500/60",
  emerald: "bg-emerald-500/40 border-emerald-500/60",
  lime: "bg-lime-500/40 border-lime-500/60",
  yellow: "bg-yellow-500/40 border-yellow-500/60",
  orange: "bg-orange-500/40 border-orange-500/60",
  rose: "bg-rose-500/40 border-rose-500/60",
};

export function RiskHeatmap({
  entries,
  value = null,
  onChange,
  readOnly = false,
  cellSize = 80,
  showAxes = true,
  riskPage = false,
}: RiskHeatmapProps) {
  // Build a 5×5 grid; impact (Y) desc so (1,1) is bottom-left
  const cols = [1, 2, 3, 4, 5]; // Likelihood
  const rows = [5, 4, 3, 2, 1]; // Impact (render top→bottom as 5..1)
  const scoreTypes = ["I", "R"];

  const [isLoading, setIsLoading] = useState(true);

  const [heatmapCells, setHeatmapCells] =
    useState<z.infer<typeof heatmapColorSchema>[]>();

  const fetchHeatmapCells = async () => {
    const res = await getHeatmapColors();
    setHeatmapCells(res);
  };

  useEffect(() => {
    fetchHeatmapCells().finally(() => setIsLoading(false));
  }, []);

  return isLoading ? (
    <div className="flex items-center gap-x-4 justify-center py-12">
      <Spinner />
      <p className="text-muted-foreground animate-pulse">Loading...</p>
    </div>
  ) : (
    <div className="inline-grid gap-2 justify-end-safe">
      <div className="flex gap-2">
        {showAxes && (
          <div className="flex flex-col items-center justify-center text-xs text-muted-foreground select-none">
            {/* Y-axis label (rotated) */}
            <div
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              Impact
            </div>
          </div>
        )}
        <div>
          {rows.map((value) => (
            <div
              key={value}
              style={{ height: cellSize }}
              className="flex flex-col justify-center"
            >
              <p className="text-sm text-muted-foreground select-none">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div
          className="grid border overflow-hidden"
          style={{
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(5, 1fr)",
          }}
          role="grid"
          aria-label="Risk heatmap"
        >
          {rows.map((impact) =>
            cols.map((likelihood) => {
              const currentCell = heatmapCells?.find(
                (cell) => cell.likelihood == likelihood && cell.impact == impact
              );
              const cellColor = currentCell
                ? colorClass[currentCell.color]
                : "";
              const isSelected =
                value?.likelihood === likelihood && value?.impact === impact;

              return (
                <button
                  key={`${likelihood}-${impact}`}
                  // fixed size cells
                  style={{ width: cellSize, height: cellSize }}
                  type="button"
                  role="gridcell"
                  aria-label={`L${likelihood} × I${impact}`}
                  aria-pressed={isSelected}
                  disabled={readOnly}
                  onClick={() => !readOnly && onChange?.(currentCell)}
                  className={cn(
                    "border transition outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    cellColor,
                    isSelected &&
                      "ring-2 ring-offset-2 ring-primary ring-offset-background",
                    readOnly && "cursor-default",
                    !readOnly && "hover:brightness-110 active:brightness-95",
                    !entries && "cursor-pointer group"
                  )}
                >
                  {entries ? (
                    riskPage ? (
                      <div className="flex justify-center gap-0.5 flex-wrap">
                        {entries.map(
                          (entry, i) =>
                            entry.likelihood === likelihood &&
                            entry.impact === impact && (
                              <Tooltip key={`${entry.likelihood}-${entry.impact}-${i}`}>
                                <TooltipTrigger
                                  className="flex items-center"
                                  disabled
                                >
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "h-5 w-5 rounded-full select-none",
                                      "font-serif bg-white dark:text-black"
                                    )}
                                  >
                                    {scoreTypes[i]}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-3xs">
                                  <p className="line-clamp-2 font-semibold">
                                    {entry.label}
                                  </p>
                                  <p>Likelihood: {entry.likelihood}</p>
                                  <p>Impact: {entry.impact}</p>
                                </TooltipContent>
                              </Tooltip>
                            )
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-center gap-1 flex-wrap">
                        {entries
                          .reduce(
                            (
                              accumulator: {
                                likelihood: number;
                                impact: number;
                                position: number;
                                label: string;
                              }[],
                              currentEntry,
                              index
                            ) => {
                              if (
                                currentEntry.impact == impact &&
                                currentEntry.likelihood == likelihood
                              )
                                accumulator.push({
                                  ...currentEntry,
                                  position: index + 1,
                                });
                              return accumulator;
                            },
                            []
                          )
                          .map(
                            (entry, i, cellEntries) =>
                              (cellEntries.length === 9 || i < 8) && (
                                <Tooltip key={i}>
                                  <TooltipTrigger className="flex items-center">
                                    <Badge
                                      className={cn(
                                        "h-5 w-5 rounded-full px-1",
                                        "tabular-nums"
                                      )}
                                    >
                                      {entry.position}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-3xs">
                                    <p className="line-clamp-2 font-semibold wrap-anywhere whitespace-normal">
                                      {entry.label}
                                    </p>
                                    <p>Likelihood: {entry.likelihood}</p>
                                    <p>Impact: {entry.impact}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )
                          )}
                        {entries.reduce(
                          (
                            accumulator: {
                              likelihood: number;
                              impact: number;
                              position: number;
                              label: string;
                            }[],
                            currentEntry,
                            index
                          ) => {
                            if (
                              currentEntry.impact == impact &&
                              currentEntry.likelihood == likelihood
                            )
                              accumulator.push({
                                ...currentEntry,
                                position: index + 1,
                              });
                            return accumulator;
                          },
                          []
                        ).length > 9 && (
                          <MoreHorizontalIcon className="w-5 h-5" />
                        )}
                      </div>
                    )
                  ) : (
                    <Badge className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <PencilIcon />
                      Edit
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
        {showAxes && (
          <div className="flex flex-col items-center justify-center text-xs text-muted-foreground select-none">
            {/* Y-axis label (rotated) */}
            <div
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
              className="opacity-0"
            >
              Impact
            </div>
          </div>
        )}
        <div>
          <div
            style={{ height: cellSize }}
            className="flex flex-col justify-center"
          >
            <p className="text-sm text-muted-foreground opacity-0 select-none">
              0
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div style={{ width: cellSize * 5 }} className="flex flex-col gap-2">
          <div className="grid grid-cols-5">
            {cols.map((value) => (
              <div key={value} className="flex justify-center">
                <p className="text-sm text-muted-foreground select-none">
                  {value}
                </p>
              </div>
            ))}
          </div>
          {showAxes && (
            <div className="text-xs text-muted-foreground select-none text-center">
              Likelihood
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
