import { BudgetItem, BudgetCategory } from '../types';
import { LocalDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

export class BudgetService {
  private db = LocalDatabase.getInstance();
  private storeName = 'budgetItems';

  public async createBudgetItem(
    planId: string,
    amount: number,
    description: string,
    category: BudgetCategory,
    day?: string,
    placeId?: string
  ): Promise<BudgetItem> {
    const newItem: BudgetItem = {
      id: uuidv4(),
      planId,
      day,
      placeId,
      amount,
      description,
      category,
      createdAt: new Date().toISOString(),
    };

    await this.db.create(this.storeName, newItem);
    return newItem;
  }

  public async getBudgetItemsByPlan(planId: string): Promise<BudgetItem[]> {
    return await this.db.getByIndex<BudgetItem>(
      this.storeName,
      'planId',
      planId
    );
  }

  public async updateBudgetItem(
    id: string,
    updates: Partial<BudgetItem>
  ): Promise<BudgetItem> {
    const existingItem = await this.db.read<BudgetItem>(this.storeName, id);
    if (!existingItem) {
      throw new Error('Budget item not found');
    }

    const updatedItem: BudgetItem = {
      ...existingItem,
      ...updates,
      id,
    };

    await this.db.update(this.storeName, updatedItem);
    return updatedItem;
  }

  public async deleteBudgetItem(id: string): Promise<void> {
    await this.db.delete(this.storeName, id);
  }

  public async getTotalBudget(planId: string): Promise<number> {
    const items = await this.getBudgetItemsByPlan(planId);
    return items.reduce((total, item) => total + item.amount, 0);
  }

  public async getBudgetByCategory(
    planId: string
  ): Promise<Record<BudgetCategory, number>> {
    const items = await this.getBudgetItemsByPlan(planId);
    const categoryTotals: Record<BudgetCategory, number> = {
      [BudgetCategory.ACCOMMODATION]: 0,
      [BudgetCategory.FOOD]: 0,
      [BudgetCategory.TRANSPORT]: 0,
      [BudgetCategory.ACTIVITY]: 0,
      [BudgetCategory.SHOPPING]: 0,
      [BudgetCategory.OTHER]: 0,
    };

    items.forEach((item) => {
      categoryTotals[item.category] += item.amount;
    });

    return categoryTotals;
  }
}
