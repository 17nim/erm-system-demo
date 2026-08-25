import RiskTable from "./RiskTable";
import { columns, type Risk } from "./columns";
import CreateRiskButton from "@/components/CreateRiskButton";
import { usePeriod } from "@/contexts/PeriodContext";
import { useEffect, useState } from "react";
import { getRiskData, updateRisk } from "@/api/risks";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/spinner";

export default function RiskIndex() {
  const [riskData, setRiskData] = useState([]);
  const { user } = useAuth();
  const { period } = usePeriod();
  const [updateEffectivenessDialogOpen, setUpdateEffectivenessDialogOpen] =
    useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllRisk = async () => {
    const res = await getRiskData();
    setRiskData(res);
  };

  useEffect(() => {
    fetchAllRisk().finally(() => setIsLoading(false));
  }, []);

  const handleUpdateEffectivenessClick = (risk: Risk) => {
    setSelectedRisk(risk);
    setUpdateEffectivenessDialogOpen(true);
  };

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
      selectedRisk?.id as number,
      undefined,
      values.effectiveness
    );
    if (res?.success) {
      fetchAllRisk();
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
      selectedRisk?.effectiveness as number
    );
  }, [updateEffectivenessDialogOpen]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight md:text-nowrap">
            Risks
          </h1>
        </div>
        {!isLoading && (
          <div className="flex items-center md:justify-end">
            <div
              className={cn(
                "text-muted-foreground text-sm self-center-safe",
                user?.role !== "approver" && "pr-4",
                "flex items-center gap-1.5"
              )}
            >
              Current period:
              <strong className="font-medium">{period?.name}</strong>
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  period?.name === "Closed"
                    ? "bg-rose-500 shadow-rose-400/70"
                    : "bg-lime-500 shadow-lime-400/70",
                  "shadow-sm animate-pulse"
                )}
              />
            </div>
            {user?.role !== "approver" && (
              <CreateRiskButton disabled={!period?.id} />
            )}
          </div>
        )}
        <div className="col-span-2">
          {isLoading ? (
            <div className="relative h-[32rem]">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-x-4">
                <Spinner />
                <p className="text-muted-foreground animate-pulse">
                  Loading...
                </p>
              </div>
            </div>
          ) : (
            <RiskTable
              columns={columns(handleUpdateEffectivenessClick)}
              data={riskData}
            />
          )}
          <Dialog
            key="updateEffectiveness"
            open={updateEffectivenessDialogOpen}
            onOpenChange={setUpdateEffectivenessDialogOpen}
          >
            <DialogContent>
              <DialogHeader className="line-clamp-2">
                <DialogTitle className="leading-normal">
                  Edit effectiveness: "{selectedRisk?.name}"
                </DialogTitle>
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
      </div>
    </>
  );
}
