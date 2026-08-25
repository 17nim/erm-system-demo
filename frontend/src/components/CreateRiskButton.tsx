import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

function CreateRiskButton({ disabled }: { disabled?: boolean }) {
  const navigate = useNavigate();
  return (
    <Button
      className="cursor-pointer shadow-md"
      onClick={() => navigate("/risks/create")}
      disabled={disabled}
    >
      <Plus />
      New risk
    </Button>
  );
}

export default CreateRiskButton;
