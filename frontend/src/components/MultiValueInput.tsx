import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { PlusIcon, XIcon } from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  forwardRef,
  useState,
} from "react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

type MultiValueInputProps = InputProps & {
  isMitigation?: boolean;
  value: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
};

export const MultiValueInput = forwardRef<
  HTMLInputElement,
  MultiValueInputProps
>(({ isMitigation, value, onChange, ...props }, ref) => {
  const [pendingDataPoint, setPendingDataPoint] = useState("");

  const addPendingDataPoint = () => {
    if (pendingDataPoint) {
      const newDataPoints = new Set([...value, pendingDataPoint]);
      onChange(Array.from(newDataPoints));
      setPendingDataPoint("");
    }
  };

  return (
    <>
      <div className="flex">
        <Input
          value={pendingDataPoint}
          onChange={(e) => setPendingDataPoint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPendingDataPoint();
            }
          }}
          className="rounded-r-none bg-white"
          {...props}
          ref={ref}
          placeholder="Type here..."
          maxLength={255}
        />
        <Button
          size="icon"
          type="button"
          variant="secondary"
          className="rounded-l-none border border-l-0 cursor-pointer"
          onClick={addPendingDataPoint}
        >
          <PlusIcon />
        </Button>
      </div>
      <ScrollArea
        className={cn(
          "border rounded-md p-2 bg-white dark:bg-input/30",
          isMitigation ? "h-[12rem]" : "h-[20rem]"
        )}
      >
        <div className="flex flex-col gap-2 flex-wrap flex-1 items-start">
          {value.map((item, idx) => (
            <Badge key={idx} variant="secondary">
              <p className="wrap-anywhere whitespace-normal text-sm">{item}</p>
              <button
                type="button"
                className="w-3 ml-2 shrink-0"
                onClick={() => {
                  onChange(value.filter((i) => i !== item));
                }}
              >
                <XIcon className="w-3 cursor-pointer" />
              </button>
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </>
  );
});
