//@ts-nocheck
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import {
  Select,
  SelectGroup,
  SelectContent,
  SelectTrigger,
  SelectLabel,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { DataTablePagination } from "@/components/ui/shadcn-io/ExamInfoDataTable/datatablepagination";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export function ExamViewDataTable({ attempts, evaluation, exam_code }) {
  const columns = [
    {
      accessorKey: "serial",
      header: ({ column }) => "No",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("serial")}</div>
      ),
    },
    {
      accessorKey: "roll",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className=""
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Roll
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("roll")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "awarded_marks",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className=""
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Marks
            <ArrowUpDown />
          </Button>
        );
      },
      // 🔹 Fixed precision display for awarded_marks
      cell: ({ row }) => {
        const marks = row.getValue("awarded_marks");
        return (
          <div className="ml-5 font-medium">
            {marks !== null && marks !== undefined
              ? Number(marks).toFixed(1)
              : "—"}
          </div>
        );
      },
    },

    {
      accessorKey: "score",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className=""
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Score
            <ArrowUpDown />
          </Button>
        );
      },
      // 🔹 Fixed precision display for percentage
      cell: ({ row }) => {
        const score = row.getValue("score");
        return (
          <div className="ml-5 font-medium">
            {score !== null && score !== undefined
              ? `${Number(score).toFixed(1)}%`
              : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "total_attempted",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className=""
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Attempted
            <ArrowUpDown />
          </Button>
        );
      },
      // 🔹 Fixed precision
      cell: ({ row }) => (
        <div className="ml-5 font-medium">
          {Number(row.getValue("total_attempted")).toFixed(1)}
        </div>
      ),
    },
    {
      accessorKey: "correct",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className=""
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Correct
            <ArrowUpDown />
          </Button>
        );
      },
      // 🔹 Fixed precision
      cell: ({ row }) => (
        <div className="ml-5 font-medium">
          {Number(row.getValue("correct")).toFixed(1)}
        </div>
      ),
    },
    {
      accessorKey: "incorrect",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className=""
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Incorrect
            <ArrowUpDown />
          </Button>
        );
      },
      // 🔹 Fixed precision
      cell: ({ row }) => (
        <div className="ml-5 font-medium">
          {Number(row.getValue("incorrect")).toFixed(1)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    {
      accessorKey: "attempt_id",
      header: "Attempt ID",
      enableHiding: true,
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link
                to={`/dashboard/viewattempt/${exam_code}/${row.getValue(
                  "attempt_id"
                )}`}
              >
                <DropdownMenuItem>View Attempt</DropdownMenuItem>
              </Link>
              {row.getValue("awarded_marks") === null && (
                <Link
                  to={`/dashboard/evaluate/${exam_code}/${row.getValue(
                    "attempt_id"
                  )}`}
                >
                  <DropdownMenuItem>Evaluate Attempt</DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filterBy, setFilterBy] = React.useState("roll");

  const updateColumns = (evaluation, columns) => {
    if (evaluation === "no") {
      const updated = columns.filter(
        (column) =>
          column.accessorKey != "status" &&
          column.accessorKey != "awarded_marks" &&
          column.accessorKey != "score"
      );
      return updated;
    }
    return columns;
  };

  const updatedColumns = updateColumns(evaluation, columns);

  const table = useReactTable({
    data: attempts,
    columns: updatedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Start searching for..."
          value={
            filterBy === "roll"
              ? (table.getColumn("roll")?.getFilterValue() as string) ?? ""
              : (table.getColumn("name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) => {
            if (filterBy === "roll") {
              return table
                .getColumn("roll")
                ?.setFilterValue(event.target.value);
            } else {
              return table
                .getColumn("name")
                ?.setFilterValue(event.target.value);
            }
          }}
          className="max-w-sm"
        />
        <Select onValueChange={(value) => setFilterBy(value)} value={filterBy}>
          <SelectTrigger className="ml-5 w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by</SelectLabel>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="roll">Roll</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
      <div className="my-2">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
