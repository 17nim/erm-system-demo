import { divisionFormSchema } from "@/schemas/division.schema";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect } from "react";

export function DivisionModal({
  open,
  onOpenChange,
  onSubmitForm,
  existingValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitForm: (data: z.infer<typeof divisionFormSchema>) => void;
  existingValues?: z.infer<typeof divisionFormSchema>;
}) {
  const form = useForm<z.infer<typeof divisionFormSchema>>({
    resolver: zodResolver(divisionFormSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
    },
  });

  function handleSubmit(values: z.infer<typeof divisionFormSchema>) {
    onSubmitForm(values);
    onOpenChange(false);
    form.reset();
  }

  useEffect(() => {
    if (!existingValues) return;
    form.setValue("name", existingValues.name);
    form.setValue("abbreviation", existingValues.abbreviation);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {existingValues ? "Edit" : "Create"} Division
          </DialogTitle>
          <DialogDescription className="sr-only">
            {existingValues ? "Edit" : "Create"} a division.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:text-rose-500 after:content-['*']">
                    Division Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="ex. Human Resource Management"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="abbreviation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:text-rose-500 after:content-['*']">
                    Abbreviation
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="ex. HRM"
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
