import {
  createDivision,
  deleteDivision,
  getAllDivisions,
  updateDivision,
} from "@/api/division";
import { DivisionModal } from "@/components/settings/DivisionModal";
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
import type {
  divisionFormSchema,
  divisionSchema,
} from "@/schemas/division.schema";
import {
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type z from "zod";

export default function Divisions() {
  const [allDivisions, setAllDivisions] =
    useState<z.infer<typeof divisionSchema>[]>();
  const [createDivisionOpen, setCreateDivisionOpen] = useState(false);
  const [editDivisionOpen, setEditDivisionOpen] = useState(false);
  const [deleteDivisionOpen, setDeleteDivisionOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] =
    useState<z.infer<typeof divisionSchema>>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchDivisions = async () => {
    const res = await getAllDivisions();
    setAllDivisions(res);
  };

  useEffect(() => {
    fetchDivisions().finally(() => setIsLoading(false));
  }, []);

  async function onCreateSubmit(
    division: z.infer<typeof divisionFormSchema>
  ) {
    const res = await createDivision(division);
    if (res?.success) {
      fetchDivisions();
      toast.success("Create division completed!", {
        description: `Created division: ${
          division.name
        } (${division.abbreviation.toUpperCase()})`,
      });
    } else {
      toast.error("Invalid information.", {
        description: "Please try again.",
      });
    }
  }

  async function onEditSubmit(division: z.infer<typeof divisionFormSchema>) {
    const res = await updateDivision(
      selectedDivision?.id as number,
      division
    );
    if (res?.success) {
      fetchDivisions();
      toast.success("Update division completed!", {
        description: `Updated division: ${
          division.name
        } (${division.abbreviation.toUpperCase()})`,
      });
    } else {
      toast.error("Invalid information.", {
        description: "Please try again.",
      });
    }
  }

  function onDeleteClick(division: z.infer<typeof divisionSchema>) {
    setSelectedDivision(division);
    setDeleteDivisionOpen(true);
  }

  async function onConfirmDeleteClick(id: number) {
    const res = await deleteDivision(id);
    if (res?.success) {
      fetchDivisions();
      toast.success("Delete division completed!", {
        description: `Deleted division: ${
          selectedDivision?.name
        } (${selectedDivision?.abbreviation.toUpperCase()})`,
      });
    } else {
      toast.error("Delete division unsuccessfully.", {
        description: "Please try again.",
      });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Divisions</CardTitle>
          <CardDescription>
            Create new division, edit division, or delete division.
          </CardDescription>
          <CardAction>
            <Button
              className="cursor-pointer shadow-md"
              onClick={() => setCreateDivisionOpen(true)}
            >
              <PlusIcon />
              New division
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
              <TableCaption>
                Total divisions: {allDivisions?.length}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="">Name</TableHead>
                  <TableHead>Abbreviation</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDivisions?.map((division) => (
                  <TableRow key={division.id}>
                    <TableCell className="">{division.name}</TableCell>
                    <TableCell>{division.abbreviation}</TableCell>
                    <TableCell className="flex justify-center">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-pointer"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVerticalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedDivision(division);
                              setEditDivisionOpen(true);
                            }}
                          >
                            <PencilIcon />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            variant="destructive"
                            onClick={() => onDeleteClick(division)}
                          >
                            <Trash2Icon />
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
      <DivisionModal
        open={createDivisionOpen}
        onOpenChange={setCreateDivisionOpen}
        onSubmitForm={onCreateSubmit}
      />
      <DivisionModal
        open={editDivisionOpen}
        onOpenChange={setEditDivisionOpen}
        onSubmitForm={onEditSubmit}
        existingValues={{
          name: selectedDivision?.name as string,
          abbreviation: selectedDivision?.abbreviation as string,
        }}
      />
      <AlertDialog open={deleteDivisionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deleting "{selectedDivision?.name}"
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => {
                setDeleteDivisionOpen(false);
                setSelectedDivision(undefined);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={() => {
                onConfirmDeleteClick(selectedDivision?.id as number);
                setDeleteDivisionOpen(false);
                setSelectedDivision(undefined);
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
