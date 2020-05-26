import {useEffect, useState} from 'react';
import DataContainer from './data-container';

export function useFetchData() {
  const [data, setData] = useState<DataContainer | null>(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/data')
      .then((res) => res.json())
      .then((res) => {
        setData(new DataContainer(res));
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error);
      });
  }, []);

  return {
    data,
    error,
    isLoading,
  };
}
