export interface PortfolioItem {
  id: number;
  user_id: number;
  masterdata_id: number;
  noofstocks: string;
  createdAt: string;
  updatedAt: string;
  masterdata: {
    id: number;
    manualrating: string;
    companyname: string;
    sector: string;
    symbol: string;
    overprice: string;
    bestprice: string;
    currentprice: string;
    rating: string | null;
    capital: string;
    remarks: string;
    status: number;
    createdAt: string;
    updatedAt: string;
  };
}