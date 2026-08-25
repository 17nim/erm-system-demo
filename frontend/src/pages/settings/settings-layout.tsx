import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import capitalize from "@/utils/stringHelper";
import {
  BriefcaseBusiness,
  Calendar,
  Grid3X3,
  Library,
  Tag,
  User2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

function SettingsLayout() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  const navigate = useNavigate();
  const menus = [
    { title: "users", icon: <User2 /> },
    { title: "periods", icon: <Calendar /> },
    { title: "categories", icon: <Library /> },
    { title: "divisions", icon: <BriefcaseBusiness /> },
    { title: "labels", icon: <Tag /> },
    { title: "heatmap-colors", icon: <Grid3X3 /> },
  ];
  const [currentPage, setCurrentPage] = useState<number>();
  const location = useLocation();
  useEffect(() => {
    const index = menus.findIndex((menu) =>
      location.pathname.includes(menu.title)
    );
    setCurrentPage(index !== -1 ? index : 0);
  }, [location.pathname]);

  return (
    <div className="grid gap-4">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight md:text-nowrap">
        Settings
      </h1>
      <div className="flex gap-4">
        <Card className="p-1 h-fit">
          <div className="flex flex-col w-3xs">
            {menus.map((menu, i) => (
              <Button
                key={menu.title}
                variant="ghost"
                className={cn(
                  "cursor-pointer justify-start",
                  i === currentPage && "bg-accent"
                )}
                onClick={() =>
                  navigate(
                    `/settings/${menu.title === "users" ? "" : menu.title}`
                  )
                }
              >
                {menu.icon}
                {menu.title === "labels"
                  ? "Likelihood/Impact Labels"
                  : menu.title === "heatmap-colors"
                  ? "Heatmap Colors"
                  : capitalize(menu.title)}
              </Button>
            ))}
          </div>
        </Card>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default SettingsLayout;
