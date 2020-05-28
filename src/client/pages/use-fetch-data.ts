import {useEffect, useState} from 'react';
import {useSetRecoilState} from 'recoil';
import {analysisConfigState} from './analysis-state';
import DataContainer from './data-container';
import {pageState, Page} from './page-state';

export function useFetchData() {
  const [data, setData] = useState<DataContainer | null>(null);
  const [file, setFile] = useState<string | null>(undefined);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const setChartConfig = useSetRecoilState(analysisConfigState);
  const setPage = useSetRecoilState(pageState);

  useEffect(() => {
    fetch('/data')
      .then((res) => res.json())
      .then((res) => {
        setData(new DataContainer(res.data));
        setFile(res.file);
        setIsLoading(false);

        setChartConfig(res.chartConfig);
        if (res.chartConfig.x) {
          setPage(Page.analysis);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error);
      });
  }, []);

  return {
    data,
    error,
    file,
    isLoading,
  };
}
