import {
  createPeriod,
  deletePeriod,
  getAllPeriods,
  updatePeriod,
} from "@/api/periods";
import { PeriodModal } from "@/components/settings/PeriodModal";
import { Spinner } from "@/components/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePeriod } from "@/contexts/PeriodContext";
import { cn } from "@/lib/utils";
import type { periodFormSchema, periodSchema } from "@/schemas/period.schema";
import {
  CircleCheckBigIcon,
  CircleXIcon,
  MoreVertical,
  PencilIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type z from "zod";

export default function Periods() {
  const [allPeriods, setAllPeriods] =
    useState<z.infer<typeof periodSchema>[]>();
  const [createPeriodOpen, setCreatePeriodOpen] = useState(false);
  const [editPeriodOpen, setEditPeriodOpen] = useState(false);
  const [deletePeriodOpen, setDeletePeriodOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] =
    useState<z.infer<typeof periodSchema>>();
  const [isLoading, setIsLoading] = useState(true);
  const { updateCurrentPeriod } = usePeriod();

  const fetchPeriods = async () => {
    const res = await getAllPeriods();
    setAllPeriods(res);
  };

  useEffect(() => {
    fetchPeriods().finally(() => setIsLoading(false));
  }, []);

  async function onCreateSubmit(period: z.infer<typeof periodFormSchema>) {
    const res = await createPeriod(period);
    if (res?.success) {
      fetchPeriods();
      toast.success("Create period completed!", {
        description: `Created period: ${period.period.toUpperCase()}`,
      });
    } else {
      toast.error("Invalid information.", {
        description: "Please try again.",
      });
    }
  }

  async function onEditSubmit(period: z.infer<typeof periodFormSchema>) {
    const res = await updatePeriod(selectedPeriod?.id as number, period);
    if (res?.success) {
      fetchPeriods();
      toast.success("Update period completed!", {
        description: `Updated period: ${period.period}`,
      });
    } else {
      toast.error("Invalid information.", {
        description: "Please try again.",
      });
    }
  }

  async function onSetStatusClick(period: z.infer<typeof periodSchema>) {
    await updatePeriod(period.id, {
      ...period,
      isActive: !period.isActive,
    });
    fetchPeriods();
    updateCurrentPeriod();
    toast.success("Period status update successfully!", {
      description: (
        <p>
          Period "{period.period}" is now{" "}
          {!period.isActive ? (
            <span className="bg-lime-300/50 text-lime-700 dark:bg-lime-700 dark:text-lime-200 px-2 py-1 rounded-md text-xs font-medium select-none">
              Active
            </span>
          ) : (
            <span className="bg-slate-300/50 text-slate-700 dark:bg-slate-700 dark:text-slate-200 px-2 py-1 rounded-md text-xs font-medium select-none">
              Inactive
            </span>
          )}{" "}
          .
        </p>
      ),
    });
  }

  function onDeleteClick(period: z.infer<typeof periodSchema>) {
    setSelectedPeriod(period);
    setDeletePeriodOpen(true);
  }

  async function onConfirmDeleteClick(id: number) {
    const res = await deletePeriod(id);
    if (res?.success) {
      fetchPeriods();
      toast.success("Delete period completed!", {
        description: `Deleted period: ${selectedPeriod?.period}`,
      });
    } else {
      toast.error("Delete period unsuccessfully.", {
        description: "Please try again.",
      });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Periods</CardTitle>
          <CardDescription>
            Create new period, edit current period, or delete period.
          </CardDescription>
          <CardAction>
            <div className="flex items-center">
              <div
                className={cn(
                  "text-muted-foreground text-sm self-center pr-4",
                  "flex items-center gap-1.5"
                )}
              >
                Current period:{" "}
                <strong className="font-medium">
                  {isLoading ? (
                    <span className="text-muted-foreground animate-pulse">
                      Loading...
                    </span>
                  ) : (
                    allPeriods?.find((p) => p.isActive)?.period || "Closed"
                  )}
                </strong>
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    allPeriods?.find((p) => p.isActive)?.period === undefined
                      ? "bg-rose-500 shadow-rose-400/70"
                      : "bg-lime-500 shadow-lime-400/70",
                    "shadow-sm animate-pulse"
                  )}
                />
              </div>
              <Button
                className="cursor-pointer shadow-md"
                onClick={() => setCreatePeriodOpen(true)}
              >
                <Plus />
                New period
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="relative py-12">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-x-4">
                <Spinner />
                <p className="text-muted-foreground animate-pulse">
                  Loading...
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableCaption>Total periods: {allPeriods?.length}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Period</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-center">Description</TableHead>
                  <TableHead className="w-[80px]" />
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPeriods?.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">
                      {period.period}
                    </TableCell>
                    <TableCell>
                      {new Date(period.startDate).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {new Date(period.endDate).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {period.description}
                    </TableCell>
                    <TableCell className="text-center">
                      {period.isActive ? (
                        <span className="bg-lime-300/50 text-lime-700 dark:bg-lime-700 dark:text-lime-200 px-2 py-1 rounded-md text-xs font-medium select-none">
                          Active
                        </span>
                      ) : (
                        <span className="bg-slate-300/50 text-slate-700 dark:bg-slate-700 dark:text-slate-200 px-2 py-1 rounded-md text-xs font-medium select-none">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-pointer"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!period.isActive ? (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => onSetStatusClick(period)}
                            >
                              <CircleCheckBigIcon />
                              Set active
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => onSetStatusClick(period)}
                            >
                              <CircleXIcon />
                              Set inactive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedPeriod(period);
                              setEditPeriodOpen(true);
                            }}
                          >
                            <PencilIcon />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            variant="destructive"
                            onClick={() => onDeleteClick(period)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <PeriodModal
        open={createPeriodOpen}
        onOpenChange={setCreatePeriodOpen}
        onSubmitForm={onCreateSubmit}
      />
      <PeriodModal
        open={editPeriodOpen}
        onOpenChange={setEditPeriodOpen}
        onSubmitForm={onEditSubmit}
        existingValues={{
          period: selectedPeriod?.period as string,
          startDate: selectedPeriod?.startDate as Date,
          endDate: selectedPeriod?.endDate as Date,
          description: selectedPeriod?.description as string,
          isActive: selectedPeriod?.isActive as boolean,
        }}
      />
      <AlertDialog open={deletePeriodOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deleting "{selectedPeriod?.period}"
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => {
                setSelectedPeriod(undefined);
                setDeletePeriodOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={() => {
                onConfirmDeleteClick(selectedPeriod?.id as number);
                setDeletePeriodOpen(false);
                setSelectedPeriod(undefined);
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
