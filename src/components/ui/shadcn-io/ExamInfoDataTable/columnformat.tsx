//@ts-nocheck
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
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
    cell: ({ row }) => <div className="capitalize">{row.getValue("roll")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "marks",
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
    cell: ({ row }) => <div className="ml-5 ml-5 font-medium">{row.getValue("marks")}</div>,
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
    cell: ({ row }) => <div className="ml-5 font-medium">{row.getValue("score")}%</div>,
  },
  {
    accessorKey: "total_questions_attempted",
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
    cell: ({ row }) => (
      <div className="ml-5 font-medium">{row.getValue("total_questions_attempted")}</div>
    ),
  },
  {
    accessorKey: "total_questions_correct",
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
    cell: ({ row }) => (
      <div className="ml-5 font-medium">{row.getValue("total_questions_correct")}</div>
    ),
  },
  {
    accessorKey: "total_questions_incorrect",
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
    cell: ({ row }) => (
      <div className="ml-5 font-medium">{row.getValue("total_questions_correct")}</div>
    ),
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
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>View Attempt</DropdownMenuItem>
            <DropdownMenuItem>Remove Attempt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
