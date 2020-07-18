import {atom} from 'recoil';

export interface AnalysisConfigStateType {
  x: null | number;
  y: null | number;
  yAgg: null | number;
  dateAgg: null | number;
  facet: null | number;
}

export const analysisConfigState = atom<AnalysisConfigStateType>({
  key: 'analysisConfigState',
  default: {
    x: null,
    y: null,
    yAgg: null,
    dateAgg: null,
    facet: null,
  },
});
