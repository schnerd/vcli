import {atom} from 'recoil';

export enum Page {
  overview,
  analysis,
}

export const pageState = atom({
  key: 'pageState',
  default: Page.overview,
});
