export interface Transaction {
  id?: number;
  dateOfPurchase: string;
  itemPurchased: string;
  itemCategory: string;
  amountSpent: number;
  userId: number;
}
