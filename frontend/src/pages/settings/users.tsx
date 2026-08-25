import { createUser, deleteUser, getAllUsers, updateUser } from "@/api/users";
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
import { UserModal } from "@/components/settings/UserModal";
import type { userFormSchema, userSchema } from "@/schemas/user.schema";
import capitalize from "@/utils/stringHelper";
import { MoreVertical, PencilIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type z from "zod";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";

export default function Users() {
  const [allUsers, setAllUsers] = useState<z.infer<typeof userSchema>[]>();
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<z.infer<typeof userFormSchema>>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    const res = await getAllUsers();
    setAllUsers(res);
  };

  useEffect(() => {
    fetchUsers().finally(() => setIsLoading(false));
  }, []);

  async function onCreateSubmit(user: z.infer<typeof userFormSchema>) {
    const res = await createUser(user);
    if (res?.success) {
      fetchUsers();
      toast.success("Create user completed!");
    } else {
      toast.error(res.error_description || "Invalid information");
    }
  }

  async function onEditSubmit(user: z.infer<typeof userFormSchema>) {
    user.firstName = selectedUser?.firstName;
    user.lastName = selectedUser?.lastName;
    user.id = selectedUser!.id;
    const res = await updateUser(user.id, user);
    if (res?.success) {
      fetchUsers();
      toast.success("Update user completed!");
    } else {
      toast.error(res.error_description || "Invalid information");
    }
  }

  function onDeleteClick(user: z.infer<typeof userFormSchema>) {
    setSelectedUser(user);
    setDeleteUserOpen(true);
  }

  async function onConfirmDeleteClick(id: string) {
    const res = await deleteUser(id);
    if (res?.success) {
      fetchUsers();
      toast.success("Delete user completed!");
    } else {
      toast.error(res.error_description || "Delete user unsuccessfully.", {
        description: "Please try again.",
      });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Create new users, edit current users, or delete users.
          </CardDescription>
          <CardAction>
            <Button
              className="cursor-pointer shadow-md"
              onClick={() => setCreateUserOpen(true)}
            >
              <Plus />
              New user
            </Button>
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
              <TableCaption>Total users: {allUsers?.length}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Division</TableHead>
                  <TableHead className="text-center">Position</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-center">
                      {user.division}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.position}
                    </TableCell>
                    <TableCell className="text-center">
                      {capitalize(user.role)}
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-pointer"
                            disabled={user.role === "admin"}
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedUser(
                                user as Omit<typeof user, "role"> & {
                                  role: "owner" | "approver";
                                }
                              );
                              setEditUserOpen(true);
                            }}
                          >
                            <PencilIcon />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            variant="destructive"
                            onClick={() =>
                              onDeleteClick(
                                user as Omit<typeof user, "role"> & {
                                  role: "owner" | "approver";
                                }
                              )
                            }
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
      <UserModal
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        onSubmitForm={onCreateSubmit}
      />
      <UserModal
        open={editUserOpen}
        onOpenChange={setEditUserOpen}
        onSubmitForm={onEditSubmit}
        existingValues={selectedUser}
      />
      <AlertDialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deleting "{selectedUser?.firstName} {selectedUser?.lastName}"
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => {
                setSelectedUser(undefined);
                setDeleteUserOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={() => {
                onConfirmDeleteClick(selectedUser?.id as string);
                setDeleteUserOpen(false);
                setSelectedUser(undefined);
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
