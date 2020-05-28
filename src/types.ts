import {DateAggType, NumAggType} from './client/types';

export interface ChartConfig {
  x: number | null;
  y: number | null;
  facet: number | null;
  yAgg: NumAggType | null;
  dateAgg: DateAggType | null;
}

export type DataFrame = any[][];

export interface DataResponse {
  chartConfig: ChartConfig;
  file: string | null;
  data: DataFrame;
}
