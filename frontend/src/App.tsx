import "./App.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login";
import ProtectedLayout from "./components/routes/ProtectedLayout";
import Home from "./pages/home";
import Profile from "./pages/profile";
import RiskIndex from "./pages/risks";
import CreateRisk from "./pages/risks/create";
import RiskDetails from "./pages/risks/details";
import EditRisk from "./pages/risks/edit";
import Settings from "./pages/settings/settings-layout";
import Users from "./pages/settings/users";
import Categories from "./pages/settings/categories";
import Divisions from "./pages/settings/divisions";
import HeatmapColors from "./pages/settings/heatmap-colors";
import Periods from "./pages/settings/periods";
import Labels from "./pages/settings/labels";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <HashRouter>
      <Toaster richColors visibleToasts={1} position="top-center" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/risks">
            <Route index element={<RiskIndex />} />
            <Route path="create" element={<CreateRisk />} />
            <Route path=":id" element={<RiskDetails />} />
            <Route path=":id/edit" element={<EditRisk />} />
          </Route>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />}>
            <Route index element={<Users />} />
            <Route path="periods" element={<Periods />} />
            <Route path="categories" element={<Categories />} />
            <Route path="divisions" element={<Divisions />} />
            <Route path="labels" element={<Labels />} />
            <Route path="heatmap-colors" element={<HeatmapColors />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
