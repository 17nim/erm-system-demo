import z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { riskSchema } from "@/schemas/risk.schema";
import {
  ArrowLeftIcon,
  CircleCheckBigIcon,
  PencilIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategories } from "@/api/categories";
import capitalize from "@/utils/stringHelper";
import { statusStyles } from "./columns";
import {
  completeRisk,
  deleteRisk,
  getRiskDetails,
  updateRisk,
} from "@/api/risks";
import { useLabels } from "@/contexts/LabelContext";
import { RiskHeatmap } from "@/components/RiskHeatmap";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { usePeriod } from "@/contexts/PeriodContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { cellColorClass } from "@/components/settings/HeatmapColorModal";
import { useHeatmapColors } from "@/contexts/HeatmapColorContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { categorySchema } from "@/schemas/category.schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/spinner";

export default function RiskDetails() {
  const { user } = useAuth();
  const { period } = usePeriod();
  const { id } = useParams();
  const [detail, setDetail] = useState<z.infer<typeof riskSchema>>();
  const navigate = useNavigate();
  const { labels } = useLabels();
  const { heatmapColors } = useHeatmapColors();
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState<
    z.infer<typeof categorySchema>[]
  >([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getCategories();
      setCategories(res || []);
    };
    fetchCategories();
  }, []);

  const fetchRiskDetails = async () => {
    const res = await getRiskDetails(Number(id));
    setDetail(res);
  };

  useEffect(() => {
    fetchRiskDetails().finally(() => setIsLoading(false));
  }, []);

  if (!detail) {
    setTimeout(() => {
      return (
        <div className="flex items-center px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="w-full space-y-6 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
                404 Page Not Found
              </h1>
              <p className="text-gray-500">
                Sorry, we couldn&#x27;t find the page you&#x27;re looking for.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex h-10 items-center rounded-md border border-gray-200 bg-white shadow-sm px-8 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
            >
              Return to website
            </Link>
          </div>
        </div>
      );
    }, 2000);
  }

  const classes = detail?.status ? statusStyles[detail?.status] : "hidden";
  const inherentColor = heatmapColors?.find(
    (cell) =>
      cell.likelihood === detail?.inherentLikelihood &&
      cell.impact === detail?.inherentImpact
  )?.color;
  const residualColor = heatmapColors?.find(
    (cell) =>
      cell.likelihood === detail?.residualLikelihood &&
      cell.impact === detail?.residualImpact
  )?.color;

  const [updateEffectivenessDialogOpen, setUpdateEffectivenessDialogOpen] =
    useState(false);

  const effectivenessFormSchema = z.object({
    effectiveness: z.preprocess(
      (value) => Number.parseInt(value as string),
      z.int({ error: "Please enter a valid number" })
    ),
  });

  const effectivenessForm = useForm<z.infer<typeof effectivenessFormSchema>>({
    resolver: zodResolver(effectivenessFormSchema) as any,
    defaultValues: { effectiveness: "" as unknown as number },
  });

  async function onEffectivenessFormSubmit(
    values: z.infer<typeof effectivenessFormSchema>
  ) {
    const res = await updateRisk(
      detail?.id as number,
      undefined,
      values.effectiveness
    );
    if (res?.success) {
      fetchRiskDetails();
      toast.success("Update risk effectiveness successfully!", {
        description: <span>Effectiveness: {values.effectiveness}</span>,
      });
      setUpdateEffectivenessDialogOpen(false);
    } else {
      toast.error("Error updating risk effectiveness.", {
        description: res?.message,
      });
    }
  }

  useEffect(() => {
    effectivenessForm.setValue(
      "effectiveness",
      detail?.effectiveness as number
    );
  }, [updateEffectivenessDialogOpen]);

  const markAsCompleted = async () => {
    const res = await completeRisk(Number(id), {
      name: detail?.name || "",
      categoryId: detail?.categoryId,
      description: detail?.description || "",
      inherentLikelihood: detail?.inherentLikelihood || -1,
      inherentImpact: detail?.inherentImpact || -1,
      residualLikelihood: detail?.residualLikelihood || -1,
      residualImpact: detail?.residualImpact || -1,
      causes: detail?.causes || [],
      preEventMitigations: detail?.preEventMitigations || [],
      riskEvent: detail?.riskEvent || "",
      postEventMitigations: detail?.postEventMitigations || [],
      consequences: detail?.consequences || [],
      status: "completed",
      ownerId: user?.user_id || "",
      division: user?.division || "",
    });
    if (res?.success) {
      fetchRiskDetails();
      toast.success("Update risk status successfully!", {
        description: (
          <span>
            Risk status is now{" "}
            <span
              className={`${statusStyles["completed"]} px-2 py-1 rounded-md text-xs font-medium select-none`}
            >
              Completed
            </span>{" "}
            !
          </span>
        ),
      });
    } else {
      toast.error("Error updating risk status.", {
        description: res?.message,
      });
    }
  };

  const revertToDraft = async () => {
    const res = await updateRisk(detail?.id as number, "draft");
    if (res?.success) {
      fetchRiskDetails();
      toast.success("Update risk status successfully!", {
        description: (
          <span>
            Risk status is now{" "}
            <span
              className={`${statusStyles["draft"]} px-2 py-1 rounded-md text-xs font-medium select-none`}
            >
              Draft
            </span>
          </span>
        ),
      });
    } else {
      toast.error("Error updating risk status.", {
        description: res?.message,
      });
    }
  };

  const markAsApproved = async () => {
    const res = await updateRisk(detail?.id as number, "approved");
    if (res?.success) {
      fetchRiskDetails();
      toast.success("Update risk status successfully!", {
        description: (
          <span>
            Risk status is now{" "}
            <span
              className={`${statusStyles["approved"]} px-2 py-1 rounded-md text-xs font-medium select-none`}
            >
              Approved
            </span>
          </span>
        ),
      });
    } else
      toast.error("Error updating risk status.", {
        description: res?.message,
      });
  };

  const markAsVerified = async () => {
    const res = await updateRisk(detail?.id as number, "verified");
    if (res?.success) {
      fetchRiskDetails();
      toast.success("Update risk status successfully!", {
        description: (
          <span>
            Risk status is now{" "}
            <span
              className={`${statusStyles["verified"]} px-2 py-1 rounded-md text-xs font-medium select-none`}
            >
              CRM Verified
            </span>
          </span>
        ),
      });
    } else
      toast.error("Error updating risk status.", {
        description: res?.message,
      });
  };

  const [deleteRiskOpen, setDeleteRiskOpen] = useState(false);

  const handleDeleteRisk = async () => {
    const res = await deleteRisk(detail?.id as number);
    if (res.success) {
      navigate("/risks");
      toast.success("Delete risk successfully!");
    } else toast.error("Error deleting risk.");
  };

  return (
    <>
      <div className="flex items-center pb-3 gap-x-4 h-[40px]">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center-safe cursor-pointer bg-white"
        >
          <ArrowLeftIcon />
          Back
        </Button>
        <Breadcrumb className="select-none">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/risks">Risks</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Risk Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {isLoading ? (
        <div className="relative py-12">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-x-4">
            <Spinner />
            <p className="text-muted-foreground animate-pulse">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-2">
            <div className="flex flex-1 gap-3">
              <h1 className="scroll-m-20 text-4xl font-bold tracking-tight md:text-nowrap">
                Risk Details
              </h1>
              <Separator orientation="vertical" className="mx-1" />
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className="rounded-full bg-white dark:bg-accent shadow-sm select-none"
                >
                  {detail?.period}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full bg-white dark:bg-accent shadow-sm select-none"
                >
                  {detail?.division}
                </Badge>
                <p
                  className={`${classes} px-2 py-1 rounded-md text-xs font-medium select-none shadow-sm`}
                >
                  {detail?.status !== "verified"
                    ? capitalize(detail?.status || "")
                    : "CRM Verified"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end-safe gap-2">
              {detail?.companyCode === user?.company_code &&
                detail?.division === user?.division &&
                detail?.period === period?.name &&
                user?.role === "approver" &&
                detail?.status === "verified" && (
                  <>
                    <Button
                      variant="outline"
                      className="cursor-pointer bg-white"
                      onClick={markAsApproved}
                    >
                      <CircleCheckBigIcon />
                      Mark as
                      <p
                        className={`${statusStyles["approved"]} px-2 py-1 rounded-md text-xs font-medium select-none`}
                      >
                        Approved
                      </p>
                    </Button>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="outline"
                          className="cursor-pointer bg-white"
                          onClick={revertToDraft}
                        >
                          <Undo2Icon />
                          Return this risk
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end">
                        <div className="flex items-center gap-1">
                          This will return this risk's status to{" "}
                          <p
                            className={cn(
                              "dark:bg-slate-300/50 dark:text-slate-700 bg-slate-700 text-slate-200",
                              "px-2 py-1 rounded-md text-xs font-medium select-none"
                            )}
                          >
                            Draft
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              {detail?.companyCode === user?.company_code &&
                detail?.division === user?.division &&
                user?.role !== "approver" &&
                detail?.period === period?.name &&
                detail?.status === "draft" && (
                  <>
                    <Button
                      className={cn(
                        "cursor-pointer",
                        (detail?.status !== "draft" ||
                          !period?.id ||
                          detail?.period !== String(period?.name)) &&
                          "hidden"
                      )}
                      onClick={() => navigate(`/risks/${id}/edit`)}
                    >
                      <PencilIcon />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="cursor-pointer bg-white"
                      onClick={markAsCompleted}
                    >
                      <CircleCheckBigIcon />
                      Mark as
                      <p
                        className={`${statusStyles["completed"]} px-2 py-1 rounded-md text-xs font-medium select-none`}
                      >
                        Completed
                      </p>
                    </Button>
                  </>
                )}
              {detail?.companyCode === user?.company_code &&
                detail?.division === user?.division &&
                user?.role !== "approver" &&
                detail?.period === period?.name &&
                detail?.status === "completed" && (
                  <Button
                    variant="outline"
                    className="cursor-pointer bg-white"
                    onClick={revertToDraft}
                  >
                    <Undo2Icon />
                    Revert to
                    <p
                      className={`${statusStyles["draft"]} px-2 py-1 rounded-md text-xs font-medium select-none`}
                    >
                      Draft
                    </p>
                  </Button>
                )}
              {detail?.companyCode === user?.company_code &&
                user?.role === "admin" &&
                detail?.period === period?.name &&
                detail?.status === "completed" && (
                  <>
                    <Button
                      variant="outline"
                      className="cursor-pointer bg-white"
                      onClick={markAsVerified}
                    >
                      <CircleCheckBigIcon />
                      Mark as
                      <p
                        className={`${statusStyles["verified"]} px-2 py-1 rounded-md text-xs font-medium select-none`}
                      >
                        Verified
                      </p>
                    </Button>
                    {detail.division !== "COF" && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="outline"
                            className="cursor-pointer bg-white"
                            onClick={revertToDraft}
                          >
                            <Undo2Icon />
                            Return this risk
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent align="end">
                          <div className="flex items-center gap-1">
                            This will return this risk's status to{" "}
                            <p
                              className={cn(
                                "dark:bg-slate-300/50 dark:text-slate-700 bg-slate-700 text-slate-200",
                                "px-2 py-1 rounded-md text-xs font-medium select-none"
                              )}
                            >
                              Draft
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                )}
              {detail?.companyCode === user?.company_code &&
                detail?.division === user?.division &&
                user?.role !== "approver" &&
                detail?.status === "draft" && (
                  <Button
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => setDeleteRiskOpen(true)}
                  >
                    <Trash2Icon />
                    Delete
                  </Button>
                )}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="order-1">
              <CardHeader>
                <CardTitle className="after:text-rose-500 after:content-['*'] after:ml-1">
                  Risk Name
                </CardTitle>
                <p
                  className="text-muted-foreground text-xl wrap-anywhere"
                  id="name"
                >
                  {detail?.name}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="grid grid-cols-2">
                  <div className="grid gap-2 order-2">
                    <Label
                      htmlFor="category"
                      className="after:text-rose-500 after:content-['*']"
                    >
                      Category
                    </Label>
                    <p className="text-muted-foreground text-xl" id="category">
                      {categories.find(
                        (category) => category.id === detail?.categoryId
                      )?.name || "Not selected"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 col-span-3 order-3 lg:order-7 min-w-0">
                  <Label
                    htmlFor="description"
                    className="after:text-rose-500 after:content-['*']"
                  >
                    Description
                  </Label>
                  <p
                    className="text-muted-foreground text-xl wrap-anywhere"
                    id="description"
                  >
                    {detail?.description?.trim() || "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="order-4">
              <Card>
                <CardContent className="flex items-center gap-4">
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    Risk Scores
                  </h4>
                  {detail?.companyCode === user?.company_code &&
                    (user?.role === "admin" || detail?.effectiveness) &&
                    detail?.status === "approved" && (
                      <Badge
                        variant="outline"
                        className="text-sm rounded-full bg-white dark:bg-accent shadow-sm select-none"
                      >
                        Effectiveness:{" "}
                        {detail?.effectiveness ?? (
                          <p className="font-normal text-muted-foreground">
                            Not selected
                          </p>
                        )}
                      </Badge>
                    )}
                  {detail?.companyCode === user?.company_code &&
                    detail?.status === "approved" &&
                    user?.role === "admin" && (
                      <Button
                        variant="outline"
                        className="cursor-pointer bg-white ml-auto"
                        onClick={() => setUpdateEffectivenessDialogOpen(true)}
                      >
                        <PencilIcon />
                        Edit effectiveness
                      </Button>
                    )}
                </CardContent>
                <Separator />
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 w-5 rounded-full select-none",
                        "font-serif bg-white dark:text-black"
                      )}
                    >
                      I
                    </Badge>
                    Inherent
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3">
                  <div className="flex flex-col gap-2 order-4">
                    <Label
                      htmlFor="inherentLikelihood"
                      className="after:text-rose-500 after:content-['*']"
                    >
                      Likelihood
                    </Label>
                    <p
                      className="text-muted-foreground text-xl"
                      id="inherentLikelihood"
                    >
                      {detail?.inherentLikelihood
                        ? `${detail?.inherentLikelihood} – `
                        : "-"}
                      {
                        labels?.find(
                          (label) => detail?.inherentLikelihood == label.score
                        )?.label
                      }
                    </p>
                  </div>
                  <div className="grid gap-2 order-5">
                    <Label
                      htmlFor="inherentImpact"
                      className="after:text-rose-500 after:content-['*']"
                    >
                      Impact
                    </Label>
                    <p
                      className="text-muted-foreground text-xl"
                      id="inherentImpact"
                    >
                      {detail?.inherentImpact
                        ? `${detail?.inherentImpact} – `
                        : "-"}
                      {
                        labels?.find(
                          (label) => detail?.inherentImpact == label.score
                        )?.label
                      }
                    </p>
                  </div>
                  <div className="grid gap-2 order-6">
                    <Label htmlFor="inherentScore">Score</Label>
                    <div>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-2">
                          {detail?.inherentLikelihood &&
                            detail?.inherentImpact && (
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full inline-block",
                                  cellColorClass[inherentColor as string]
                                )}
                              />
                            )}
                          <p
                            className="text-muted-foreground text-xl"
                            id="inherentScore"
                          >
                            {detail?.inherentLikelihood &&
                            detail?.inherentImpact
                              ? detail?.inherentLikelihood *
                                detail?.inherentImpact
                              : "-"}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align={
                            detail?.inherentLikelihood && detail?.inherentImpact
                              ? "start"
                              : "center"
                          }
                        >
                          <p>= Inherent Likelihood × Inherent Impact</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 w-5 rounded-full select-none",
                        "font-serif bg-white dark:text-black"
                      )}
                    >
                      R
                    </Badge>
                    Residual
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3">
                  <div className="flex flex-col gap-2 order-10">
                    <Label
                      htmlFor="residualLikelihood"
                      className="after:text-rose-500 after:content-['*']"
                    >
                      Likelihood
                    </Label>
                    <p
                      className="text-muted-foreground text-xl"
                      id="residualLikelihood"
                    >
                      {detail?.residualLikelihood
                        ? `${detail?.residualLikelihood} – `
                        : "-"}
                      {
                        labels?.find(
                          (label) => detail?.residualLikelihood == label.score
                        )?.label
                      }
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 order-11">
                    <Label
                      htmlFor="residualImpact"
                      className="after:text-rose-500 after:content-['*']"
                    >
                      Impact
                    </Label>
                    <p
                      className="text-muted-foreground text-xl"
                      id="residualImpact"
                    >
                      {detail?.residualImpact
                        ? `${detail?.residualImpact} – `
                        : "-"}
                      {
                        labels?.find(
                          (label) => detail?.residualImpact == label.score
                        )?.label
                      }
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 order-12">
                    <Label htmlFor="residualScore">Score</Label>
                    <div>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-2">
                          {detail?.residualLikelihood &&
                            detail?.residualImpact && (
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full inline-block",
                                  cellColorClass[residualColor as string]
                                )}
                              />
                            )}
                          <p
                            className="text-muted-foreground text-xl"
                            id="residualScore"
                          >
                            {detail?.residualLikelihood &&
                            detail?.residualImpact
                              ? detail?.residualLikelihood *
                                detail?.residualImpact
                              : "-"}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align={
                            detail?.residualLikelihood && detail?.residualImpact
                              ? "start"
                              : "center"
                          }
                        >
                          <p>= Residual Likelihood × Residual Impact</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="grid xl:grid-cols-7 gap-4">
            {/* Bow Tie */}
            <Card className="xl:col-span-5">
              <CardHeader>
                <CardTitle>Bow Tie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3 max-h-[20rem] mb-6">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm leading-none font-medium sticky after:text-rose-500 after:content-['*'] after:ml-1">
                      Cause(s)
                    </h4>
                    <ScrollArea className="h-[20rem] rounded-md border shadow-md">
                      <ul className="p-3 list-disc">
                        {!detail?.causes || detail?.causes.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No cause added.
                          </p>
                        ) : (
                          detail?.causes.map((cause, i, causes) => (
                            <Fragment key={`${cause}-${i}`}>
                              <li
                                className="text-sm wrap-anywhere whitespace-normal ml-3"
                              >
                                {cause}
                              </li>
                              {i !== causes.length - 1 && (
                                <Separator className="my-1.5" />
                              )}
                            </Fragment>
                          ))
                        )}
                      </ul>
                    </ScrollArea>
                  </div>
                  <div className="flex flex-col gap-2 my-auto">
                    <h4 className="text-sm leading-none font-medium sticky after:text-rose-500 after:content-['*'] after:ml-1">
                      Pre-Event Mitigation(s)
                    </h4>
                    <ScrollArea className="h-[12rem] rounded-md border shadow-md">
                      <ul className="p-3 list-disc">
                        {!detail?.preEventMitigations ||
                        detail?.preEventMitigations.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No pre-event mitigation added.
                          </p>
                        ) : (
                            detail?.preEventMitigations.map(
                            (mitigation, i, mitigations) => (
                              <Fragment key={`${mitigation}-${i}`}>
                                <li
                                  className="text-sm wrap-anywhere whitespace-normal ml-3"
                                >
                                  {mitigation}
                                </li>
                                {i !== mitigations.length - 1 && (
                                  <Separator className="my-1.5" />
                                )}
                              </Fragment>
                            )
                          )
                        )}
                      </ul>
                    </ScrollArea>
                  </div>
                  <div className="flex flex-col gap-2 my-auto text-center">
                    <Label
                      className="justify-center after:text-rose-500 after:content-['*']"
                      htmlFor="riskEvent"
                    >
                      Risk Event
                    </Label>
                    <Separator />
                    <p
                      id="riskEvent"
                      className={cn(
                        "text-sm",
                        detail?.riskEvent
                          ? "wrap-anywhere whitespace-normal"
                          : "text-muted-foreground"
                      )}
                    >
                      {detail?.riskEvent?.trim() || "No risk event added."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 my-auto">
                    <h4 className="text-sm leading-none font-medium sticky after:text-rose-500 after:content-['*'] after:ml-1">
                      Post-Event Mitigation(s)
                    </h4>
                    <ScrollArea className="h-[12rem] rounded-md border shadow-md">
                      <ul className="p-3 list-disc">
                        {!detail?.postEventMitigations ||
                        detail?.postEventMitigations.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No post-event mitigation added.
                          </p>
                        ) : (
                            detail?.postEventMitigations.map(
                            (mitigation, i, mitigations) => (
                              <Fragment key={`${mitigation}-${i}`}>
                                <li
                                  className="text-sm wrap-anywhere whitespace-normal ml-3"
                                >
                                  {mitigation}
                                </li>
                                {i !== mitigations.length - 1 && (
                                  <Separator className="my-1.5" />
                                )}
                              </Fragment>
                            )
                          )
                        )}
                      </ul>
                    </ScrollArea>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm leading-none font-medium sticky after:text-rose-500 after:content-['*'] after:ml-1">
                      Consequence(s)
                    </h4>
                    <ScrollArea className="h-[20rem] rounded-md border shadow-md">
                      <ul className="p-3 list-disc">
                        {!detail?.consequences ||
                        detail?.consequences.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No consequence added.
                          </p>
                        ) : (
                          detail?.consequences.map(
                            (consequence, i, consequences) => (
                              <Fragment key={`${consequence}-${i}`}>
                                <li
                                  className="text-sm wrap-anywhere whitespace-normal ml-3"
                                >
                                  {consequence}
                                </li>
                                {i !== consequences.length - 1 && (
                                  <Separator className="my-1.5" />
                                )}
                              </Fragment>
                            )
                          )
                        )}
                      </ul>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Heatmap */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Risk Heatmap</CardTitle>
              </CardHeader>
              <CardContent className="px-0 my-auto flex justify-center-safe">
                <RiskHeatmap
                  cellSize={50}
                  entries={[
                    {
                      label: "Inherent",
                      likelihood: detail?.inherentLikelihood as number,
                      impact: detail?.inherentImpact as number,
                    },
                    {
                      label: "Residual",
                      likelihood: detail?.residualLikelihood as number,
                      impact: detail?.residualImpact as number,
                    },
                  ]}
                  riskPage
                />
              </CardContent>
            </Card>
          </div>
          <Dialog
            key="updateEffectiveness"
            open={updateEffectivenessDialogOpen}
            onOpenChange={setUpdateEffectivenessDialogOpen}
          >
            <DialogContent>
              <DialogHeader className="line-clamp-2">
                <DialogTitle>Edit effectiveness: "{detail?.name}"</DialogTitle>
                <DialogDescription className="sr-only">
                  Edit the effectiveness rating for this risk.
                </DialogDescription>
              </DialogHeader>
              <Form {...effectivenessForm}>
                <form
                  onSubmit={effectivenessForm.handleSubmit(
                    onEffectivenessFormSubmit
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={effectivenessForm.control}
                    name="effectiveness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effectiveness</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString() ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[10rem]">
                              <SelectValue placeholder="Select a value..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <SelectItem value={String(value)}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center-safe gap-x-2 justify-end-safe">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUpdateEffectivenessDialogOpen(false);
                        effectivenessForm.reset();
                      }}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="cursor-pointer">
                      Submit
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <AlertDialog open={deleteRiskOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deleting "{detail?.name}"</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => setDeleteRiskOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={handleDeleteRisk}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
