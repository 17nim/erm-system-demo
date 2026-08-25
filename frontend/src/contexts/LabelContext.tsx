import { createContext, useContext, useEffect, useState } from "react";

interface Label {
  id: number | undefined;
  type: "likelihood" | "impact" | undefined;
  score: 1 | 2 | 3 | 4 | 5 | undefined;
  label: string | undefined;
}

interface LabelsContextType {
  labels: Label[] | undefined;
  loading: boolean;
}

const LabelsContext = createContext<LabelsContextType>({
  labels: undefined,
  loading: true,
});

export const LabelsProvider = ({ children }: { children: React.ReactNode }) => {
  const [labels, setLabels] = useState<Label[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLabels = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/labels`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("authToken")}`,
          },
        });
        if (res.ok) {
          const labelsData = (
            (await res.json()).data as (Label & {
              company_code: string;
            })[]
          ).map((label) => {
            const { company_code, ...sanitizedData } = label;
            return sanitizedData;
          });
          setLabels(labelsData);
        } else {
          setLabels(undefined);
        }
      } catch (error) {
        setLabels([]);
        console.error("Error fetching labels: no labels found.");
      } finally {
        setLoading(false);
      }
    };
    getLabels();
  }, []);

  return (
    <LabelsContext.Provider value={{ labels, loading }}>
      {children}
    </LabelsContext.Provider>
  );
};

export const useLabels = () => useContext(LabelsContext);
