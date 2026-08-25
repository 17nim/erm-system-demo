import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { userFormSchema } from "@/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getAllDivisions } from "@/api/division";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import type { divisionSchema } from "@/schemas/division.schema";

export function UserModal({
  open,
  onOpenChange,
  onSubmitForm,
  existingValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitForm: (data: z.infer<typeof userFormSchema>) => void;
  existingValues?: z.infer<typeof userFormSchema>;
}) {
  const { user } = useAuth();

  const [divisions, setDivisions] = useState<z.infer<typeof divisionSchema>[]>(
    []
  );

  useEffect(() => {
    const fetchDivisions = async () => {
      const res = await getAllDivisions();
      setDivisions(res || []);
    };

    fetchDivisions();
  }, []);

  const form = useForm<any>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      division: "",
      role: "",
      password: "",
    },
  });

  function handleSubmit(values: z.infer<typeof userFormSchema>) {
    onSubmitForm(values);
    onOpenChange(false);
    form.reset();
  }

  useEffect(() => {
    if (!existingValues) return;

    form.setValue("email", existingValues.email);
    form.setValue("role", existingValues.role);

    if (user?.company_code !== "DIT") {
      form.setValue("id", existingValues.id);
      form.setValue("firstName", existingValues.firstName);
      form.setValue("lastName", existingValues.lastName);
      form.setValue("division", existingValues.division);
      form.setValue("password", existingValues.password);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{existingValues ? "Edit" : "Create"} User</DialogTitle>
          <DialogDescription className="sr-only">
            {existingValues ? "Edit" : "Create"} a user account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <>
              <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="after:text-rose-500 after:content-['*']">
                        Employee ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Enter employee ID"
                          type="text"
                          disabled={Boolean(existingValues)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="after:text-rose-500 after:content-['*']">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Enter first name"
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="after:text-rose-500 after:content-['*']">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Enter last name"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="after:text-rose-500 after:content-['*']">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Enter email"
                          type="email"
                          disabled={Boolean(existingValues)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="after:text-rose-500 after:content-['*']">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Enter password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel className="after:text-rose-500 after:content-['*']">
                          Division
                        </FormLabel>
                        <Select
                          required
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Select division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {divisions?.map((division) => (
                              <SelectItem
                                key={division.abbreviation}
                                className="cursor-pointer"
                                value={division.abbreviation}
                              >
                                {division.abbreviation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel className="after:text-rose-500 after:content-['*']">
                          Role
                        </FormLabel>
                        <Select
                          required
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              className="cursor-pointer"
                              value="owner"
                            >
                              Owner
                            </SelectItem>
                            <SelectItem
                              className="cursor-pointer"
                              value="approver"
                            >
                              Approver
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </>
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
