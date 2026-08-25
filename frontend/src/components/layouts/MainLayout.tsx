import { Outlet } from "react-router-dom";
import Header from "../Header";

export default function MainLayout() {
  return (
    <>
      <Header />
      <div className="h-screen pt-14">
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
}
