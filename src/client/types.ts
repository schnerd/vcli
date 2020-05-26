export interface DataPoint {
  label: string | Date;
  value: number;
}

export enum DataTypes {
  date,
  num,
  text,
}

interface ChartFieldMeta {
  index: number;
  type: DataTypes;
  dateAgg?: DateAggType;
}
export interface ChartFieldsMeta {
  x: ChartFieldMeta;
  y: ChartFieldMeta;
}

export enum DateAggType {
  year,
  month,
  day,
}

export enum NumAggType {
  first,
  min,
  max,
  sum,
  mean,
  median,
  p5,
  p95,
}
