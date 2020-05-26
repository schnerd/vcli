export interface DataPoint {
  label: string;
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
}
export interface ChartFieldsMeta {
  x: ChartFieldMeta;
  y: ChartFieldMeta;
}
