export interface Store {
  id: string;
  storeName: string;
  location: string;
  description: string;
  tags: string[]; // * TODO: maybe list all type of tags
  price: number;
  currency: string; // * TODO: maybe list all type of currency
  createTime: Date;
  updateTime: Date;
}
