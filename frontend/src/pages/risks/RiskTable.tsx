import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  Table2Icon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { statusStyles } from "./columns";
import { getAllPeriods } from "@/api/periods";
import { getCategories } from "@/api/categories";
import { getAllDivisions } from "@/api/division";
import { useAuth } from "@/contexts/AuthContext";
import { bulkApproveRisk, getRisksForExcel } from "@/api/risks";
import * as XLSX from "xlsx";
import { TZDate } from "react-day-picker";
import { usePeriod } from "@/contexts/PeriodContext";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type z from "zod";
import type { periodSchema } from "@/schemas/period.schema";
import type { categorySchema } from "@/schemas/category.schema";
import type { divisionSchema } from "@/schemas/division.schema";
import { useNavigate } from "react-router-dom";

const status = [
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "verified",
    label: "CRM Verified",
  },
  {
    value: "approved",
    label: "Approved",
  },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function RiskTable<
  TData extends { id: number; status: string; period: string },
  TValue
>({ columns, data }: DataTableProps<TData, TValue>) {
  const [periods, setPeriods] = useState<z.infer<typeof periodSchema>[]>();
  const [categories, setCategories] =
    useState<z.infer<typeof categorySchema>[]>();
  const [divisions, setDivisions] =
    useState<z.infer<typeof divisionSchema>[]>();

  useEffect(() => {
    const fetchPeriods = async () => {
      const res = await getAllPeriods();
      setPeriods(res);
    };
    const fetchCategories = async () => {
      const res = await getCategories();
      setCategories(res);
    };
    const fetchDivisions = async () => {
      const res = await getAllDivisions();
      setDivisions(res);
    };
    fetchPeriods();
    fetchCategories();
    fetchDivisions();
  }, []);

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
  });

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  useEffect(() => {
    const selected = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    setSelectedRows(selected);
  }, [rowSelection]);

  const handleExportToExcelClick = async () => {
    const selectedRisks = await getRisksForExcel(selectedRows);
    const flatData = selectedRisks?.map((r) => ({
      ID: r.id,
      Name: r.name,
      Period: r.period,
      Category: r.category,
      Division: r.division,
      Description: r.description || "-",
      "Inherent Likelihood": r.inherentLikelihood,
      "Inherent Impact": r.inherentImpact,
      "Inherent Score":
        (r.inherentLikelihood as number) * (r.inherentImpact as number),
      "Residual Likelihood": r.residualLikelihood,
      "Residual Impact": r.residualImpact,
      "Residual Score":
        (r.residualLikelihood as number) * (r.residualImpact as number),
      Effectiveness: r.effectiveness || "-",
      Causes: r.causes?.join(", ") || "-",
      "Pre-Event Mitigations": r.preEventMitigations?.join(", ") || "-",
      "Risk Event": r.riskEvent || "-",
      "Post-Event Mitigations": r.postEventMitigations?.join(", ") || "-",
      Consequences: r.consequences?.join(", ") || "-",
      Owner: r.owner,
      "Created At": r.createdAt
        ? new TZDate(r.createdAt, "Asia/Bangkok").toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-",
      "Updated At": r.updatedAt
        ? new TZDate(r.updatedAt, "Asia/Bangkok").toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-",
      "Approved At": r.approvedAt
        ? new TZDate(r.approvedAt, "Asia/Bangkok").toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-",
      Status: r.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(flatData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Risks");
    XLSX.writeFile(workbook, "risks.xlsx");
  };

  const { period } = usePeriod();
  const { user } = useAuth();

  useEffect(() => {
    setColumnVisibility({ effectiveness: user?.role === "admin" });
  }, [user]);

  const navigate = useNavigate();

  const handleBulkApprove = async () => {
    const res = await bulkApproveRisk(selectedRows);
    if (res?.success) navigate(0);
  };

  const [nameFilterValue, setNameFilterValue] = useState(
    (table.getColumn("name")?.getFilterValue() as string) ?? ""
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      table.getColumn("name")?.setFilterValue(nameFilterValue);
    }, 1500); // 1500ms debounce

    return () => clearTimeout(handler); // cleanup if value changes before 300ms
  }, [nameFilterValue, table]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap gap-y-4">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="nameFilter">Name</Label>
          <Input
            id="nameFilter"
            placeholder="Filter risk names..."
            value={nameFilterValue}
            onChange={(event) => setNameFilterValue(event.target.value)}
            className="w-3xs bg-white"
          />
        </div>
        {/* Status */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="statusFilter">Status</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="statusFilter"
                variant="outline"
                role="combobox"
                className="justify-between bg-white w-[9rem]"
              >
                {table.getColumn("status")?.getFilterValue() ? (
                  <p
                    className={cn(
                      statusStyles[
                        table.getColumn("status")?.getFilterValue() as string
                      ],
                      "px-2 py-1 rounded-md text-xs font-medium select-none"
                    )}
                  >
                    {
                      status.find(
                        (status) =>
                          status.value ===
                          table.getColumn("status")?.getFilterValue()
                      )?.label
                    }
                  </p>
                ) : (
                  <p className="text-muted-foreground font-normal">
                    Filter status...
                  </p>
                )}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[9rem] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      key="all"
                      onSelect={() =>
                        table.getColumn("status")?.setFilterValue("")
                      }
                    >
                      <p className="px-2 py-1 rounded-md border dark:text-accent bg-white text-xs font-medium select-none">
                        All
                      </p>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          !table.getColumn("status")?.getIsFiltered()
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                    {status.map((status) => (
                      <CommandItem
                        key={status.value}
                        value={status.value}
                        onSelect={(event) => {
                          event === table.getColumn("status")?.getFilterValue()
                            ? table.getColumn("status")?.setFilterValue("")
                            : table.getColumn("status")?.setFilterValue(event);
                        }}
                      >
                        <p
                          className={cn(
                            statusStyles[status.value],
                            "px-2 py-1 rounded-md text-xs font-medium select-none"
                          )}
                        >
                          {status.label}
                        </p>
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            table.getColumn("status")?.getFilterValue() ===
                              status.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {/* Period */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="periodFilter">Period</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="periodFilter"
                variant="outline"
                role="combobox"
                className="justify-between bg-white w-[10rem]"
              >
                {table.getColumn("period")?.getFilterValue() ? (
                  <p>
                    {
                      periods?.find(
                        (period) =>
                          period.period ===
                          table.getColumn("period")?.getFilterValue()
                      )?.period
                    }
                  </p>
                ) : (
                  <p className="text-muted-foreground font-normal">
                    Filter periods...
                  </p>
                )}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[10rem] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search period..." />
                <CommandList>
                  <CommandEmpty>No period found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      key="all"
                      onSelect={() =>
                        table.getColumn("period")?.setFilterValue("")
                      }
                    >
                      <p className="select-none">All</p>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          !table.getColumn("period")?.getIsFiltered()
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                    {periods?.map((p) => (
                      <CommandItem
                        key={p.period}
                        value={p.period}
                        onSelect={(event) => {
                          event === table.getColumn("period")?.getFilterValue()
                            ? table.getColumn("period")?.setFilterValue("")
                            : table.getColumn("period")?.setFilterValue(event);
                        }}
                      >
                        <p>{p.period}</p>
                        {p.period === period?.name && (
                          <div
                            className={cn(
                              "-ml-0.5 w-1.5 h-1.5 rounded-full",
                              "bg-lime-500 shadow-lime-400/70",
                              "shadow-sm animate-pulse"
                            )}
                          />
                        )}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            table.getColumn("period")?.getFilterValue() ===
                              p.period
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {/* Category */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryFilter">Category</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="categoryFilter"
                variant="outline"
                role="combobox"
                className="justify-between bg-white w-[12rem]"
              >
                {table.getColumn("category")?.getFilterValue() ? (
                  <p>
                    {
                      categories?.find(
                        (category) =>
                          category.name ===
                          table.getColumn("category")?.getFilterValue()
                      )?.name
                    }
                  </p>
                ) : (
                  <p className="text-muted-foreground font-normal">
                    Filter categories...
                  </p>
                )}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[12rem] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search category..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      key="all"
                      onSelect={() =>
                        table.getColumn("category")?.setFilterValue("")
                      }
                    >
                      <p className="select-none">All</p>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          !table.getColumn("category")?.getIsFiltered()
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                    {categories?.map((category) => (
                      <CommandItem
                        key={category.name}
                        value={category.name}
                        onSelect={(event) => {
                          event ===
                          table.getColumn("category")?.getFilterValue()
                            ? table.getColumn("category")?.setFilterValue("")
                            : table
                                .getColumn("category")
                                ?.setFilterValue(event);
                        }}
                      >
                        <p>{category.name}</p>
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            table.getColumn("category")?.getFilterValue() ===
                              category.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {/* Division */}
        {user?.role === "admin" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="divisionFilter">Division</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="divisionFilter"
                  variant="outline"
                  role="combobox"
                  className="justify-between bg-white w-[11rem]"
                >
                  {table.getColumn("division")?.getFilterValue() ? (
                    <p>
                      {
                        divisions?.find(
                          (division) =>
                            division.abbreviation ===
                            table.getColumn("division")?.getFilterValue()
                        )?.abbreviation
                      }
                    </p>
                  ) : (
                    <p className="text-muted-foreground font-normal">
                      Filter divisions...
                    </p>
                  )}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="max-w-[11rem] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search division..." />
                  <CommandList>
                    <CommandEmpty>No division found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        key="all"
                        onSelect={() =>
                          table.getColumn("division")?.setFilterValue("")
                        }
                      >
                        <p className="select-none">All</p>
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            !table.getColumn("division")?.getIsFiltered()
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                      {divisions?.map((division) => (
                        <CommandItem
                          key={division.abbreviation}
                          value={division.abbreviation}
                          onSelect={(event) => {
                            event ===
                            table.getColumn("division")?.getFilterValue()
                              ? table.getColumn("division")?.setFilterValue("")
                              : table
                                  .getColumn("division")
                                  ?.setFilterValue(event);
                          }}
                        >
                          <p>{division.abbreviation}</p>
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              table.getColumn("division")?.getFilterValue() ===
                                division.abbreviation
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
        {user?.role === "approver" ? (
          <Button
            variant="default"
            className={cn("cursor-pointer ml-auto")}
            disabled={
              table.getSelectedRowModel().rows.length === 0 ||
              Boolean(
                table
                  .getSelectedRowModel()
                  .rows.find(
                    (row) =>
                      row.original.status === "approved" ||
                      row.original.period !== period?.name
                  )
              )
            }
            onClick={handleBulkApprove}
          >
            <CheckCircleIcon />
            Approve selected risk(s)
          </Button>
        ) : (
          <Button
            variant="link"
            className="cursor-pointer ml-auto"
            onClick={handleExportToExcelClick}
          >
            <Table2Icon />
            Export {selectedRows.length === 0 ? "all" : "selection "} to Excel
          </Button>
        )}
      </div>
      <div className="bg-white dark:bg-card overflow-hidden rounded-md border shadow-md h-[32rem] flex flex-col">
        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      style={{ width: header.getSize() }}
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1 select-none">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getCanSort() && (
                          <span>
                            {{
                              asc: <ArrowUpIcon className="h-4 w-4" />,
                              desc: <ArrowDownIcon className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronsUpDownIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  style={{ height: "3rem" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      style={{
                        width: cell.column.getSize(),
                      }}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center-safe justify-between">
        <p className="text-muted-foreground flex-1 text-sm my-2">
          {table.getSelectedRowModel().rows.length} out of {data.length} row(s)
          selected.
        </p>
        <div className="flex items-center-safe gap-2">
          <Select
            defaultValue={String(10)}
            onValueChange={(e) => {
              table.setPageSize(Number(e));
            }}
          >
            <SelectTrigger className="cursor-pointer bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={String(pageSize)}
                  className="cursor-pointer"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer bg-white"
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer bg-white"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer bg-white"
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer bg-white"
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RiskTable;
