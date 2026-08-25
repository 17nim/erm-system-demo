import { categoryFormSchema } from "@/schemas/category.schema";
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

export function CategoryModal({
  open,
  onOpenChange,
  onSubmitForm,
  existingValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitForm: (data: z.infer<typeof categoryFormSchema>) => void;
  existingValues?: z.infer<typeof categoryFormSchema>;
}) {
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
    },
  });

  function handleSubmit(values: z.infer<typeof categoryFormSchema>) {
    onSubmitForm(values);
    onOpenChange(false);
    form.reset();
  }

  useEffect(() => {
    if (!existingValues) return;
    form.setValue("name", existingValues.name);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {existingValues ? "Edit" : "Create"} Category
          </DialogTitle>
          <DialogDescription className="sr-only">
            {existingValues ? "Edit" : "Create"} a category.
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
                    Category Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="ex. Financial"
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
