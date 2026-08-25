import { ChevronsUpDown, LogOut, Settings, User2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ModeToggle } from "./mode-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import capitalize from "@/utils/stringHelper";

export default function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      window.localStorage.removeItem("authToken");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="z-20 fixed w-full flex justify-center h-14 shrink-0 bg-background shadow-md/5 border-b">
      <div className="flex justify-between w-full">
        <Link to="/" className="flex p-3.5 space-x-3">
          <img
            src="/app/erm/logo-black.svg"
            alt="Company Logo"
            className="block dark:hidden select-none pointer-events-none object-contain"
          />
          <img
            src="/app/erm/logo-white.svg"
            alt="Company Logo"
            className="hidden dark:block select-none pointer-events-none object-contain"
          />
          <Separator orientation="vertical" className="hidden sm:block" />
          <div className="flex items-center font-medium">
            <p className="text-lg select-none lg:block hidden">
              Enterprise Risk Management System
            </p>
            <p className="text-lg select-none sm:block hidden lg:hidden">
              ERM System
            </p>
          </div>
        </Link>
        <div className="flex items-center px-2">
          <ModeToggle />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="link" className="cursor-pointer">
                <div className="flex flex-col justify-center text-left text-sm leading-tight">
                  <span className="truncate font-medium select-none">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="truncate text-xs select-none">
                    {user?.email}
                  </span>
                </div>
                <ChevronsUpDown className="my-auto size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="end"
              sideOffset={6}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {user?.user_id} / {capitalize(user?.role as string)} / Division:{" "}
                {user?.division}
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <User2 />
                My Profile
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/settings")}
                >
                  <Settings />
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will end your current session. Do you want to
              continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={handleLogout}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
