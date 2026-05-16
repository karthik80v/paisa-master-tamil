export interface Stock {
  id: number;
  manualrating: string;
  companyname: string;
  sector: string;
  symbol: string;
  overprice: string;
  bestprice: string;
  currentprice: string;
  rating: string;
  capital: string;
  remarks: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  favourite: boolean | null;
}
