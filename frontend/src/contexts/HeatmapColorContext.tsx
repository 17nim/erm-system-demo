import { createContext, useContext, useEffect, useState } from "react";

interface HeatmapColor {
  id: number | undefined;
  likelihood: 1 | 2 | 3 | 4 | 5 | undefined;
  impact: 1 | 2 | 3 | 4 | 5 | undefined;
  color: "sky" | "emerald" | "lime" | "yellow" | "orange" | "rose" | undefined;
}

interface HeatmapColorsContextType {
  heatmapColors: HeatmapColor[] | undefined;
  loading: boolean;
}

const HeatmapColorsContext = createContext<HeatmapColorsContextType>({
  heatmapColors: undefined,
  loading: true,
});

export const HeatmapColorsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [heatmapColors, setheatmapColors] = useState<
    HeatmapColor[] | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getHeatmapColors = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/heatmap-colors`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${window.localStorage.getItem(
                "authToken"
              )}`,
            },
          }
        );
        if (res.ok) {
          const heatmapColorsData = (
            (await res.json()).data as (HeatmapColor & {
              company_code: string;
            })[]
          ).map((heatmapColor) => {
            const { company_code, ...sanitizedData } = heatmapColor;
            return sanitizedData;
          });
          setheatmapColors(heatmapColorsData);
        } else {
          setheatmapColors(undefined);
        }
      } catch (error) {
        setheatmapColors([]);
        console.error(
          "Error fetching heatmap colors: no heatmap colors found."
        );
      } finally {
        setLoading(false);
      }
    };
    getHeatmapColors();
  }, []);

  return (
    <HeatmapColorsContext.Provider value={{ heatmapColors, loading }}>
      {children}
    </HeatmapColorsContext.Provider>
  );
};

export const useHeatmapColors = () => useContext(HeatmapColorsContext);
