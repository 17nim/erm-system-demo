import { getCurrentPeriod } from "@/api/periods";
import { createContext, useContext, useEffect, useState } from "react";

interface Period {
  id: number | undefined;
  name: string | undefined;
  description: string | undefined;
  start_date: Date | undefined;
  end_date: Date | undefined;
}

interface PeriodContextType {
  period: Period | undefined;
  updateCurrentPeriod: () => void;
  loading: boolean;
}

const PeriodContext = createContext<PeriodContextType>({
  period: undefined,
  updateCurrentPeriod: () => {},
  loading: true,
});

export const PeriodProvider = ({ children }: { children: React.ReactNode }) => {
  const [period, setPeriod] = useState<Period | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchCurrentPeriod = async () => {
    const res = await getCurrentPeriod();
    setPeriod({
      id: res?.id ?? undefined,
      name: res?.name ?? "Closed",
      description: res?.description ?? undefined,
      start_date: res?.start_date ?? undefined,
      end_date: res?.end_date ?? undefined,
    });
  };

  useEffect(() => {
    fetchCurrentPeriod().finally(() => setLoading(false));
  }, []);

  const updateCurrentPeriod = () => {
    setLoading(true);
    fetchCurrentPeriod().finally(() => setLoading(false));
  };

  return (
    <PeriodContext.Provider value={{ period, loading, updateCurrentPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
};

export const usePeriod = () => useContext(PeriodContext);
