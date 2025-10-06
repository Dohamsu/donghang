import { TravelPlan, UserRole } from '../types';
import { CreateTravelPlanRequest } from '../types/api';
import { LocalDatabase, LocalStorageService } from './database';
import { v4 as uuidv4 } from 'uuid';

export class TravelPlanService {
  private db = LocalDatabase.getInstance();
  private storeName = 'travel_plans';

  public async createTravelPlan(
    request: CreateTravelPlanRequest,
    userId: string
  ): Promise<TravelPlan> {
    const newPlan: TravelPlan = {
      id: uuidv4(),
      title: request.title,
      startDate: request.startDate,
      endDate: request.endDate,
      region: request.region,
      confirmed: false,
      ownerId: userId,
      members: [
        {
          id: userId,
          name: 'Owner',
          role: UserRole.OWNER,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.db.create(this.storeName, newPlan);
    return newPlan;
  }

  public async getTravelPlan(id: string): Promise<TravelPlan | null> {
    return await this.db.read<TravelPlan>(this.storeName, id);
  }

  public async getUserTravelPlans(userId: string): Promise<TravelPlan[]> {
    const allPlans = await this.db.getAll<TravelPlan>(this.storeName);
    return allPlans.filter(
      (plan) =>
        plan.ownerId === userId ||
        plan.members.some((member) => member.id === userId)
    );
  }

  public async updateTravelPlan(
    id: string,
    updates: Partial<TravelPlan>
  ): Promise<TravelPlan> {
    const existingPlan = await this.getTravelPlan(id);
    if (!existingPlan) {
      throw new Error('Travel plan not found');
    }

    const updatedPlan: TravelPlan = {
      ...existingPlan,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await this.db.update(this.storeName, updatedPlan);
    return updatedPlan;
  }

  public async deleteTravelPlan(id: string): Promise<void> {
    await this.db.delete(this.storeName, id);
  }

  public async confirmTravelPlan(id: string): Promise<TravelPlan> {
    return await this.updateTravelPlan(id, {
      confirmed: true,
      updatedAt: new Date().toISOString(),
    });
  }

  public async unconfirmTravelPlan(id: string): Promise<TravelPlan> {
    return await this.updateTravelPlan(id, {
      confirmed: false,
      updatedAt: new Date().toISOString(),
    });
  }

  public getCurrentUserId(): string {
    let userId = LocalStorageService.getItem<string>('currentUserId');
    if (!userId) {
      userId = uuidv4();
      LocalStorageService.setItem('currentUserId', userId);
    }
    return userId;
  }

  public setCurrentUserId(userId: string): void {
    LocalStorageService.setItem('currentUserId', userId);
  }
}
