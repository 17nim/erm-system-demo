import {
  heatmapColorFormSchema,
  heatmapColorSchema,
} from "@/schemas/heatmapColor.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export const cellColorClass: Record<string, string> = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  lime: "bg-lime-500",
  yellow: "bg-yellow-400",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
};

export function HeatmapColorModal({
  open,
  onOpenChange,
  onSubmitForm,
  existingValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitForm: (data: z.infer<typeof heatmapColorFormSchema>) => void;
  existingValues: Partial<z.infer<typeof heatmapColorSchema>>;
}) {
  const form = useForm<z.infer<typeof heatmapColorFormSchema>>({
    resolver: zodResolver(heatmapColorFormSchema),
  });

  function handleSubmit(values: z.infer<typeof heatmapColorFormSchema>) {
    onSubmitForm(values);
    onOpenChange(false);
    form.reset();
  }

  useEffect(() => {
    form.setValue("color", `${existingValues.color as string}`);
  }, [existingValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Edit Heatmap Cell Color — Likelihood: {existingValues.likelihood},
            Impact: {existingValues.impact}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Edit the heatmap cell color for this likelihood and impact.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:text-rose-500 after:content-['*']">
                    Cell Color
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(cellColorClass).map((color) => (
                        <SelectItem value={color}>
                          <div
                            className={cn(cellColorClass[color], "w-3xs h-3")}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
