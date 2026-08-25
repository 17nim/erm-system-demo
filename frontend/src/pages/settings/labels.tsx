import { getAllLabels, updateLabel } from "@/api/labels";
import { LabelModal } from "@/components/settings/LabelModal";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { labelFormSchema, labelSchema } from "@/schemas/label.schema";
import capitalize from "@/utils/stringHelper";
import { ArrowRightIcon, PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type z from "zod";

export default function Labels() {
  const [allLabels, setAllLabels] = useState<z.infer<typeof labelSchema>[]>([]);
  const [editLabelOpen, setEditLabelOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] =
    useState<z.infer<typeof labelSchema>>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchLabels = async () => {
    const res = await getAllLabels(); // assume API returns an array
    setAllLabels(res || []);
  };

  useEffect(() => {
    fetchLabels().finally(() => setIsLoading(false));
  }, []);

  const likelihoodLabels = allLabels?.filter(
    (label) => label.type === "likelihood"
  );
  const impactLabels = allLabels?.filter((label) => label.type === "impact");

  async function onEditSubmit(label: z.infer<typeof labelFormSchema>) {
    const res = await updateLabel(selectedLabel?.id as number, label);
    if (res?.success) {
      fetchLabels();
      toast.success("Update label completed!", {
        description: (
          <p className="flex items-center-safe gap-1">
            {capitalize(selectedLabel?.type as string)}: {selectedLabel?.score}
            <ArrowRightIcon className="w-3.5 h-3.5" />"{label.label}"
          </p>
        ),
      });
    } else {
      toast.error("Invalid information.", {
        description: "Please try again.",
      });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Likelihood/Impact Labels</CardTitle>
          <CardDescription>Edit likelihood and impact labels.</CardDescription>
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
            <div className="grid grid-cols-2 gap-x-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Likelihood</TableHead>
                    <TableHead />
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {likelihoodLabels?.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell className="font-medium text-center">
                        {label.score}
                      </TableCell>
                      <TableCell>{label.label}</TableCell>
                      <TableCell className="flex justify-center">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer"
                          onClick={() => {
                            setSelectedLabel(label);
                            setEditLabelOpen(true);
                          }}
                        >
                          <PencilIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Impact</TableHead>
                    <TableHead />
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {impactLabels?.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell className="font-medium text-center">
                        {label.score}
                      </TableCell>
                      <TableCell>{label.label}</TableCell>

                      <TableCell className="flex justify-center">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer"
                          onClick={() => {
                            setSelectedLabel(label);
                            setEditLabelOpen(true);
                          }}
                        >
                          <PencilIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <LabelModal
        open={editLabelOpen}
        onOpenChange={setEditLabelOpen}
        onSubmitForm={onEditSubmit}
        existingValues={{
          type: selectedLabel?.type,
          score: selectedLabel?.score,
          label: selectedLabel?.label,
        }}
      />
    </>
  );
}
