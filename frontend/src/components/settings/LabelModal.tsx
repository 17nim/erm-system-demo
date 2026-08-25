import { labelFormSchema, labelSchema } from "@/schemas/label.schema";
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
import capitalize from "@/utils/stringHelper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function LabelModal({
  open,
  onOpenChange,
  onSubmitForm,
  existingValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitForm: (data: z.infer<typeof labelFormSchema>) => void;
  existingValues: Partial<z.infer<typeof labelSchema>>;
}) {
  const form = useForm<z.infer<typeof labelFormSchema>>({
    resolver: zodResolver(labelFormSchema),
  });

  function handleSubmit(values: z.infer<typeof labelFormSchema>) {
    onSubmitForm(values);
    onOpenChange(false);
    form.reset();
  }

  useEffect(() => {
    form.setValue("label", existingValues.label as string);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Edit Label — {capitalize(String(existingValues?.type))}:{" "}
            {existingValues.score}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Edit the label for this risk score.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:text-rose-500 after:content-['*']">
                    Label
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder={`ex. ${
                        existingValues.type === "impact"
                          ? "Insignificant"
                          : "Rare"
                      }`}
                      type="text"
                      {...field}
                    />
                  </FormControl>
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
