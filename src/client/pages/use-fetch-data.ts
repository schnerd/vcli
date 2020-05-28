import {useEffect, useState} from 'react';
import DataContainer from './data-container';

export function useFetchData() {
  const [data, setData] = useState<DataContainer | null>(null);
  const [chartConfig, setChartConfig] = useState<any>(null);
  const [file, setFile] = useState<string | null>(undefined);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/data')
      .then((res) => res.json())
      .then((res) => {
        setData(new DataContainer(res.data));
        setChartConfig(res.chartConfig);
        setFile(res.file);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error);
      });
  }, []);

  return {
    data,
    chartConfig,
    error,
    file,
    isLoading,
  };
}
