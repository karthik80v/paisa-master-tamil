import { Injectable } from "@angular/core";
import { Consideration } from "../models/common.model";

export interface StockData {
  manualrating: string;
  currentprice: string;
  bestprice: string;
  overprice: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {

    constructor() { }

    getConsideration(stock: StockData): Consideration {
        if (stock.manualrating === 'D') {
            return { rating: 'P' as any, rowClass: 'row-red' };
        }

        if (stock.manualrating === 'X') {
            return { rating: 'D' as any, rowClass: 'row-analyze' };
        }

        if (stock.manualrating === 'Auto') {
            const currentPrice = parseFloat(stock.currentprice);
            const bestPrice = parseFloat(stock.bestprice);
            const overPrice = parseFloat(stock.overprice);

            if (currentPrice < bestPrice) {
                return { rating: 'A' as any, rowClass: 'row-green' };
            }

            if (currentPrice >= bestPrice && currentPrice < overPrice) {
                return { rating: 'B' as any, rowClass: 'row-blue' };
            }

            return { rating: 'C' as any, rowClass: 'row-amber' };
        }

        return { rating: 'C' as any, rowClass: 'row-amber' };
    }

}