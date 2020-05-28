import {atom} from 'recoil';

export const analysisConfigState = atom({
  key: 'analysisConfigState',
  default: {
    x: null,
    y: null,
    yAgg: null,
    dateAgg: null,
    facet: null,
  },
});
