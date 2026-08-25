import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div
      className={cn(
        "flex flex-col min-h-svh items-center justify-center p-12",
        "bg-[url(./assets/login-bg.svg)] dark:bg-[url(./assets/login-bg-dark.svg)] bg-cover bg-center"
      )}
    >
      <div className="absolute top-2 right-4">
        <ModeToggle />
      </div>
      <div className="grid grid-rows-3 max-w-sm">
        <div className="flex flex-col gap-3">
          <img
            src="/app/erm/logo-black.svg"
            alt="Company Logo"
            className="block dark:hidden select-none pointer-events-none"
          />
          <img
            src="/app/erm/logo-white.svg"
            alt="Company Logo"
            className="hidden dark:block select-none pointer-events-none"
          />
          <div className="flex justify-center">
            <span className="text-center max-w-sm font-light text-4xl select-none">
              Enterprise Risk Management System
            </span>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
