import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { objectSnakeToCamel } from "@/utils/caseConverter";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import nullToUndefined from "@/utils/objectHelper";
import { riskFormSchema, riskSchema } from "@/schemas/risk.schema";
import { getCategories } from "@/api/categories";
import { useLabels } from "@/contexts/LabelContext";
import { MultiValueInput } from "@/components/MultiValueInput";
import { RiskHeatmap } from "@/components/RiskHeatmap";
import { usePeriod } from "@/contexts/PeriodContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useHeatmapColors } from "@/contexts/HeatmapColorContext";
import { cn } from "@/lib/utils";
import { cellColorClass } from "@/components/settings/HeatmapColorModal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { categorySchema } from "@/schemas/category.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/spinner";
import { getCurrentPeriod } from "@/api/periods";

async function getRiskDetails(id: number) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/risks/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("authToken")}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      const sanitizedData = nullToUndefined(data[0]);
      return objectSnakeToCamel(sanitizedData);
    }
  } catch (error) {
    console.error("Error fetching risk details");
  }
}

function EditRisk() {
  const { id } = useParams();
  const { user } = useAuth();
  const { period } = usePeriod();
  const { labels } = useLabels();
  const { heatmapColors } = useHeatmapColors();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [riskDetails, setRiskDetails] = useState<z.infer<typeof riskSchema>>();
  useEffect(() => {
    getRiskDetails(Number(id))
      .then((data) => {
        setRiskDetails(data);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

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

  const form = useForm<z.infer<typeof riskFormSchema>>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      name: "",
      categoryId: undefined,
      description: "",
      riskEvent: "",
      causes: [],
      preEventMitigations: [],
      postEventMitigations: [],
      consequences: [],
      status: "draft",
    },
  });

  const [inherentScore, setInherentScore] = useState<number | undefined>(
    undefined
  );
  const [residualScore, setResidualScore] = useState<number | undefined>(
    undefined
  );
  const [inherentColor, setInherentColor] = useState<string | undefined>(
    undefined
  );
  const [residualColor, setResidualColor] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setInherentScore(
      (form.watch("inherentLikelihood") as number) *
        (form.watch("inherentImpact") as number)
    );
    setResidualScore(
      (form.watch("residualLikelihood") as number) *
        (form.watch("residualImpact") as number)
    );
    setInherentColor(
      heatmapColors?.find(
        (cell) =>
          cell.likelihood === form.watch("inherentLikelihood") &&
          cell.impact === form.watch("inherentImpact")
      )?.color
    );
    setResidualColor(
      heatmapColors?.find(
        (cell) =>
          cell.likelihood === form.watch("residualLikelihood") &&
          cell.impact === form.watch("residualImpact")
      )?.color
    );
  });

  useEffect(() => {
    form.setValue("name", riskDetails?.name as string);
    form.setValue("description", riskDetails?.description);
    form.setValue("causes", riskDetails?.causes || []);
    form.setValue(
      "preEventMitigations",
      riskDetails?.preEventMitigations || []
    );
    form.setValue("riskEvent", riskDetails?.riskEvent);
    form.setValue(
      "postEventMitigations",
      riskDetails?.postEventMitigations || []
    );
    form.setValue("consequences", riskDetails?.consequences || []);
    form.setValue("status", riskDetails?.status as "draft" | "completed");
    setTimeout(() => {
      form.setValue("categoryId", riskDetails?.categoryId);
      form.setValue("inherentLikelihood", riskDetails?.inherentLikelihood);
      form.setValue("inherentImpact", riskDetails?.inherentImpact);
      form.setValue("residualLikelihood", riskDetails?.residualLikelihood);
      form.setValue("residualImpact", riskDetails?.residualImpact);
    }, 0);
  }, [riskDetails, form]);

  async function onSubmit(formData: z.infer<typeof riskFormSchema>) {
    const data = {
      ...formData,
      ownerId: user?.user_id,
      division: user?.division,
      name: formData.name?.trim(),
      description: formData.description?.trim(),
      riskEvent: formData.riskEvent?.trim(),
    };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/risks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        navigate(`/risks/${id}`);
        return {
          success: true,
          message: "Risk updated successfully.",
          data: data,
        };
      } else {
        const currentPeriod = await getCurrentPeriod();
        if (!currentPeriod) {
          toast.error(
            <span>
              The current period is now <strong>Closed</strong>.
            </span>,
            {
              description: <span>You will be redirected in 5 seconds.</span>,
            }
          );
          setTimeout(() => {
            window.location.href = "/";
          }, 5000);
        } else throw new Error((await res.json()).error_description);
      }
    } catch (error) {
      toast.error("Invalid values", {
        description: (error as Error).message,
      });
    }
  }

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
        <Breadcrumb>
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
              <BreadcrumbPage>Edit Risk</BreadcrumbPage>
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
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2">
            <div className="flex flex-1 gap-3">
              <h1 className="scroll-m-20 text-4xl font-bold tracking-tight md:text-nowrap">
                Edit Risk
              </h1>
              <Separator orientation="vertical" className="mx-1 h-full" />
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className="rounded-full bg-white dark:bg-accent shadow-sm select-none"
                >
                  {riskDetails?.period}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full bg-white dark:bg-accent shadow-sm select-none"
                >
                  {riskDetails?.division}
                </Badge>
              </div>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="gap-4">
                    <CardHeader>
                      <CardTitle>Risk Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-y-3">
                        <div className="grid grid-cols-3 gap-x-4">
                          {/* Name */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="col-span-2 flex flex-col gap-2">
                                <FormLabel className="after:text-rose-500 after:content-['*']">
                                  Risk Name
                                </FormLabel>
                                <FormControl className="bg-white">
                                  <Input
                                    required
                                    placeholder="Enter risk name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Category */}
                          <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem className="flex flex-col gap-2">
                                <FormLabel>Category</FormLabel>
                                <Select
                                  onValueChange={(val) =>
                                    field.onChange(Number(val))
                                  }
                                  value={field.value?.toString() ?? ""}
                                >
                                  <FormControl className="w-full bg-white">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((c) => (
                                      <SelectItem
                                        key={c.id}
                                        value={String(c.id)}
                                      >
                                        {c.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {/* Description */}
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="col-span-3 flex flex-col gap-2 h-[7.5rem]">
                              <FormLabel>Description</FormLabel>
                              <FormControl className="bg-white">
                                <Textarea
                                  placeholder="Enter description"
                                  className="h-full resize-none overflow-y-auto"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="gap-4">
                    <CardHeader>
                      <CardTitle>Risk Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-y-3">
                        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                          <div className="col-span-3 flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-5 w-5 rounded-full select-none",
                                "font-serif bg-white dark:text-black"
                              )}
                            >
                              I
                            </Badge>
                            <p className="font-semibold tracking-tight">
                              Inherent
                            </p>
                          </div>
                          {/* Inherent Likelihood */}
                          <FormField
                            control={form.control}
                            name="inherentLikelihood"
                            render={({ field }) => (
                              <FormItem className="flex flex-col gap-2">
                                <FormLabel>Likelihood</FormLabel>
                                <Select
                                  onValueChange={(val) =>
                                    field.onChange(Number(val))
                                  }
                                  value={field.value?.toString() ?? ""}
                                >
                                  <FormControl className="w-full bg-white">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a number" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {labels
                                      ?.filter(
                                        (label) => label.type === "likelihood"
                                      )
                                      .map((label) => (
                                        <SelectItem
                                          key={label.id}
                                          value={String(label.score)}
                                        >
                                          {label.score}
                                          {" – "}
                                          {label.label}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Inherent Impact */}
                          <FormField
                            control={form.control}
                            name="inherentImpact"
                            render={({ field }) => (
                              <FormItem className="flex flex-col gap-2">
                                <FormLabel>Impact</FormLabel>
                                <Select
                                  onValueChange={(val) =>
                                    field.onChange(Number(val))
                                  }
                                  value={field.value?.toString() ?? ""}
                                >
                                  <FormControl className="w-full bg-white">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a number" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {labels
                                      ?.filter(
                                        (label) => label.type === "impact"
                                      )
                                      .map((label) => (
                                        <SelectItem
                                          key={label.id}
                                          value={String(label.score)}
                                        >
                                          {label.score}
                                          {" – "}
                                          {label.label}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Inherent Score */}
                          <div className="flex flex-col gap-2">
                            <Label>Score</Label>
                            <div className="flex items-center gap-2">
                              <div>
                                <Tooltip>
                                  <TooltipTrigger className="flex items-center gap-2">
                                    {Boolean(inherentScore) && (
                                      <div
                                        className={cn(
                                          "w-4 h-4 rounded-full inline-block",
                                          cellColorClass[
                                            inherentColor as string
                                          ]
                                        )}
                                      />
                                    )}
                                    <p
                                      className="text-muted-foreground text-xl"
                                      id="inherentScore"
                                    >
                                      {inherentScore || "-"}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="bottom"
                                    align={inherentScore ? "start" : "center"}
                                  >
                                    <p>
                                      = Inherent Likelihood × Inherent Impact
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                          <div className="col-span-3 flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-5 w-5 rounded-full select-none",
                                "font-serif bg-white dark:text-black"
                              )}
                            >
                              R
                            </Badge>
                            <p className="font-semibold tracking-tight">
                              Residual
                            </p>
                          </div>
                          {/* Residual Likelihood */}
                          <FormField
                            control={form.control}
                            name="residualLikelihood"
                            render={({ field }) => (
                              <FormItem className="flex flex-col gap-2">
                                <FormLabel>Likelihood</FormLabel>
                                <Select
                                  onValueChange={(val) =>
                                    field.onChange(Number(val))
                                  }
                                  value={field.value?.toString() ?? ""}
                                >
                                  <FormControl className="w-full bg-white">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a number" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {labels
                                      ?.filter(
                                        (label) => label.type === "likelihood"
                                      )
                                      .map((label) => (
                                        <SelectItem
                                          key={label.id}
                                          value={String(label.score)}
                                        >
                                          {label.score}
                                          {" – "}
                                          {label.label}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Residual Impact */}
                          <FormField
                            control={form.control}
                            name="residualImpact"
                            render={({ field }) => (
                              <FormItem className="order-11 flex flex-col gap-2">
                                <FormLabel>Impact</FormLabel>
                                <Select
                                  onValueChange={(val) =>
                                    field.onChange(Number(val))
                                  }
                                  value={field.value?.toString() ?? ""}
                                >
                                  <FormControl className="w-full bg-white">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a number" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {labels
                                      ?.filter(
                                        (label) => label.type === "impact"
                                      )
                                      .map((label) => (
                                        <SelectItem
                                          key={label.id}
                                          value={String(label.score)}
                                        >
                                          {label.score}
                                          {" – "}
                                          {label.label}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Residual Score */}
                          <div className="order-12 flex flex-col gap-2">
                            <Label>Score</Label>
                            <div className="flex items-center gap-2">
                              <div>
                                <Tooltip>
                                  <TooltipTrigger className="flex items-center gap-2">
                                    {Boolean(residualScore) && (
                                      <div
                                        className={cn(
                                          "w-4 h-4 rounded-full inline-block",
                                          cellColorClass[
                                            residualColor as string
                                          ]
                                        )}
                                      />
                                    )}
                                    <p
                                      className="text-muted-foreground text-xl"
                                      id="residualScore"
                                    >
                                      {residualScore || "-"}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="bottom"
                                    align={residualScore ? "start" : "center"}
                                  >
                                    <p>
                                      = Residual Likelihood × Residual Impact
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-col-1 lg:grid-cols-3 gap-4">
                  <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Bow Tie</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Bow Tie */}
                      <div className="grid grid-cols-5 gap-2">
                        <FormField
                          control={form.control}
                          name="causes"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Cause(s)</FormLabel>
                              <FormControl>
                                <MultiValueInput {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="preEventMitigations"
                          render={({ field }) => (
                            <FormItem className="flex flex-col my-auto">
                              <FormLabel>Pre-Event Mitigation(s)</FormLabel>
                              <FormControl>
                                <MultiValueInput {...field} isMitigation />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="riskEvent"
                          render={({ field }) => (
                            <FormItem className="my-auto">
                              <FormLabel>Risk Event</FormLabel>
                              <FormControl className="bg-white">
                                <Textarea
                                  className="max-h-[10rem] h-auto"
                                  placeholder="Enter risk event"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="postEventMitigations"
                          render={({ field }) => (
                            <FormItem className="flex flex-col my-auto">
                              <FormLabel>Post-Event Mitigation(s)</FormLabel>
                              <FormControl>
                                <MultiValueInput {...field} isMitigation />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="consequences"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Consequence(s)</FormLabel>
                              <FormControl>
                                <MultiValueInput {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Risk Heatmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Heatmap */}
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-center ">
                          <RiskHeatmap
                            cellSize={60}
                            entries={[
                              {
                                label: "Inherent",
                                likelihood: form.watch(
                                  "inherentLikelihood"
                                ) as number,
                                impact: form.watch("inherentImpact") as number,
                              },
                              {
                                label: "Residual",
                                likelihood: form.watch(
                                  "residualLikelihood"
                                ) as number,
                                impact: form.watch("residualImpact") as number,
                              },
                            ]}
                            riskPage
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-6">
                  <Button
                    type="submit"
                    className="order-21 col-end-4 lg:col-end-7 w-full select-none cursor-pointer"
                    disabled={
                      riskDetails?.status !== "draft" ||
                      riskDetails?.period !== period?.name ||
                      riskDetails?.division !== user?.division ||
                      riskDetails?.companyCode !== user?.company_code
                    }
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      )}
    </>
  );
}

export default EditRisk;
