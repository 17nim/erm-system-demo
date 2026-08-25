import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/api/categories";
import { CategoryModal } from "@/components/settings/CategoryModal";
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
  categoryFormSchema,
  categorySchema,
} from "@/schemas/category.schema";
import {
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type z from "zod";

export default function Categories() {
  const [allCategories, setAllCategories] =
    useState<z.infer<typeof categorySchema>[]>();
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<z.infer<typeof categorySchema>>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    const res = await getCategories();
    setAllCategories(res);
  };

  useEffect(() => {
    fetchCategories().finally(() => setIsLoading(false));
  }, []);

  async function onCreateSubmit(category: z.infer<typeof categoryFormSchema>) {
    const res = await createCategory(category);
    if (res?.success) {
      fetchCategories();
      toast.success("Create category completed!", {
        description: `Created category: ${category.name}`,
      });
    } else {
      toast.error("Invalid information.", {
        description: "Please try again.",
      });
    }
  }

  async function onEditSubmit(category: z.infer<typeof categoryFormSchema>) {
    const res = await updateCategory(selectedCategory?.id as number, category);
    if (res?.success) {
      fetchCategories();
      toast.success("Update category completed!", {
        description: `Updated category: ${category.name}`,
      });
    } else {
      toast.error("Invalid information.", {
        description: "Please try again.",
      });
    }
  }

  function onDeleteClick(category: z.infer<typeof categorySchema>) {
    setSelectedCategory(category);
    setDeleteCategoryOpen(true);
  }

  async function onConfirmDeleteClick(id: number) {
    const res = await deleteCategory(id);
    if (res?.success) {
      fetchCategories();
      toast.success("Delete category completed!", {
        description: `Deleted category: ${selectedCategory?.name}`,
      });
    } else {
      toast.error("Delete category unsuccessfully.", {
        description: "Please try again.",
      });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Create new category, edit current category, or delete category.
          </CardDescription>
          <CardAction>
            <Button
              className="cursor-pointer shadow-md"
              onClick={() => setCreateCategoryOpen(true)}
            >
              <PlusIcon />
              New category
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
                Total categories: {allCategories?.length}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCategories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
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
                              setSelectedCategory(category);
                              setEditCategoryOpen(true);
                            }}
                          >
                            <PencilIcon />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            variant="destructive"
                            onClick={() => onDeleteClick(category)}
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
      <CategoryModal
        // Create
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
        onSubmitForm={onCreateSubmit}
      />
      <CategoryModal
        // Edit
        open={editCategoryOpen}
        onOpenChange={setEditCategoryOpen}
        onSubmitForm={onEditSubmit}
        existingValues={{
          name: selectedCategory?.name as string,
        }}
      />
      <AlertDialog open={deleteCategoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deleting "{selectedCategory?.name}"
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => {
                setSelectedCategory(undefined);
                setDeleteCategoryOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={() => {
                onConfirmDeleteClick(selectedCategory?.id as number);
                setDeleteCategoryOpen(false);
                setSelectedCategory(undefined);
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
