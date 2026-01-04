import { productKeys } from '../constants/productKeys';

type ProductKey = keyof typeof productKeys;

export interface Subscription {
  id: string;
  productKey: ProductKey;
  active: boolean;
  document: string;
  createdAt: Date;
  updatedAt: Date;
  activatedAt: Date;
  removedIn90Days: number;
}
