import { PackingItem } from '../types';
import { LocalDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

export class PackingService {
  private db = LocalDatabase.getInstance();
  private storeName = 'packingItems';

  public async createPackingItem(
    planId: string,
    text: string,
    imageUrl?: string
  ): Promise<PackingItem> {
    if (!text || text.length > 20) {
      throw new Error('준비물 텍스트는 1-20자 이내여야 합니다.');
    }

    const newItem: PackingItem = {
      id: uuidv4(),
      planId,
      text,
      imageUrl,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.db.create(this.storeName, newItem);
    return newItem;
  }

  public async getPackingItemsByPlan(planId: string): Promise<PackingItem[]> {
    return await this.db.getByIndex<PackingItem>(
      this.storeName,
      'planId',
      planId
    );
  }

  public async updatePackingItem(
    id: string,
    updates: Partial<PackingItem>
  ): Promise<PackingItem> {
    const existingItem = await this.db.read<PackingItem>(this.storeName, id);
    if (!existingItem) {
      throw new Error('Packing item not found');
    }

    const updatedItem: PackingItem = {
      ...existingItem,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await this.db.update(this.storeName, updatedItem);
    return updatedItem;
  }

  public async togglePackingItem(id: string): Promise<PackingItem> {
    const existingItem = await this.db.read<PackingItem>(this.storeName, id);
    if (!existingItem) {
      throw new Error('Packing item not found');
    }

    return this.updatePackingItem(id, {
      completed: !existingItem.completed,
    });
  }

  public async deletePackingItem(id: string): Promise<void> {
    await this.db.delete(this.storeName, id);
  }

  public async getPackingStats(
    planId: string
  ): Promise<{ total: number; completed: number; remaining: number }> {
    const items = await this.getPackingItemsByPlan(planId);
    const total = items.length;
    const completed = items.filter((item) => item.completed).length;
    const remaining = total - completed;

    return { total, completed, remaining };
  }

  public validateImageFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      throw new Error('이미지 크기는 5MB 이하여야 합니다.');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('JPG, PNG, GIF, WEBP 형식만 가능합니다.');
    }

    return true;
  }

  public async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
