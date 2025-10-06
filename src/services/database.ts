import { supabase } from '../lib/supabase';
import type {
  TravelPlan,
  Place,
  Schedule,
  BudgetItem,
  PackingItem,
  ReviewItem,
  TemporaryPlace,
  User,
} from '../types';

// Helper function to convert camelCase to snake_case
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

// Helper function to convert snake_case to camelCase
function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

export class SupabaseDatabase {
  private static instance: SupabaseDatabase;

  private constructor() {}

  public static getInstance(): SupabaseDatabase {
    if (!SupabaseDatabase.instance) {
      SupabaseDatabase.instance = new SupabaseDatabase();
    }
    return SupabaseDatabase.instance;
  }

  public async init(): Promise<void> {
    // Supabase client is already initialized in lib/supabase.ts
    // This method is kept for compatibility with existing code
    return Promise.resolve();
  }

  // Generic CRUD operations
  public async create<T extends { id: string }>(
    tableName: string,
    item: T
  ): Promise<T> {
    const snakeItem = toSnakeCase(item as unknown as Record<string, unknown>);

    const { data, error } = await supabase
      .from(tableName)
      .insert(snakeItem)
      .select()
      .single();

    if (error) {
      console.error(`Failed to create item in ${tableName}:`, error);
      throw new Error(`Failed to create item: ${error.message}`);
    }

    return toCamelCase(data) as unknown as T;
  }

  public async read<T>(tableName: string, id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Failed to read item from ${tableName}:`, error);
      throw new Error(`Failed to read item: ${error.message}`);
    }

    return data ? (toCamelCase(data) as unknown as T) : null;
  }

  public async update<T extends { id: string }>(
    tableName: string,
    item: T
  ): Promise<T> {
    const { id, ...updates } = item;
    const snakeUpdates = toSnakeCase(updates as unknown as Record<string, unknown>);

    const { data, error } = await supabase
      .from(tableName)
      .update(snakeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Failed to update item in ${tableName}:`, error);
      throw new Error(`Failed to update item: ${error.message}`);
    }

    return toCamelCase(data) as unknown as T;
  }

  public async delete(tableName: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Failed to delete item from ${tableName}:`, error);
      throw new Error(`Failed to delete item: ${error.message}`);
    }
  }

  public async getAll<T>(tableName: string): Promise<T[]> {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Failed to get all items from ${tableName}:`, error);
      throw new Error(`Failed to get items: ${error.message}`);
    }

    return data.map((item) => toCamelCase(item) as unknown as T);
  }

  public async getByIndex<T>(
    tableName: string,
    indexName: string,
    value: string
  ): Promise<T[]> {
    const snakeIndexName = indexName.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq(snakeIndexName, value)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Failed to get items by index from ${tableName}:`, error);
      throw new Error(`Failed to get items by index: ${error.message}`);
    }

    return data.map((item) => toCamelCase(item) as unknown as T);
  }
}

// Maintain backward compatibility
export const LocalDatabase = SupabaseDatabase;

// LocalStorage service remains unchanged as it's for client-side temporary data
export class LocalStorageService {
  private static prefix = 'travel_planner_';

  public static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serializedValue);
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
    }
  }

  public static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return null;
    }
  }

  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
    }
  }

  public static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys
        .filter((key) => key.startsWith(this.prefix))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

// Export typed database instance
export const db = SupabaseDatabase.getInstance();

// Helper functions for specific entities
export const travelPlanService = {
  async getByOwnerId(ownerId: string): Promise<TravelPlan[]> {
    return db.getByIndex<TravelPlan>('travel_plans', 'ownerId', ownerId);
  },

  async getByMembership(userId: string): Promise<TravelPlan[]> {
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .or(`owner_id.eq.${userId},members.cs.${JSON.stringify([{ id: userId }])}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get travel plans by membership:', error);
      throw new Error(`Failed to get travel plans: ${error.message}`);
    }

    return data.map((item) => toCamelCase(item) as unknown as TravelPlan);
  },
};

export const scheduleService = {
  async getByPlanAndDate(planId: string, date: string): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('plan_id', planId)
      .eq('date', date)
      .order('order', { ascending: true });

    if (error) {
      console.error('Failed to get schedules:', error);
      throw new Error(`Failed to get schedules: ${error.message}`);
    }

    return data.map((item) => toCamelCase(item) as unknown as Schedule);
  },
};

export const budgetService = {
  async getByPlan(planId: string): Promise<BudgetItem[]> {
    return db.getByIndex<BudgetItem>('budget_items', 'planId', planId);
  },
};

export const packingService = {
  async getByPlan(planId: string): Promise<PackingItem[]> {
    return db.getByIndex<PackingItem>('packing_items', 'planId', planId);
  },
};

export const reviewService = {
  async getByPlan(planId: string): Promise<ReviewItem[]> {
    return db.getByIndex<ReviewItem>('reviews', 'planId', planId);
  },

  async getByPlace(placeId: string): Promise<ReviewItem[]> {
    return db.getByIndex<ReviewItem>('reviews', 'placeId', placeId);
  },
};

export const temporaryPlaceService = {
  async getByPlan(planId: string): Promise<TemporaryPlace[]> {
    return db.getByIndex<TemporaryPlace>('temporary_places', 'planId', planId);
  },
};

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Try to get user from database
    const dbUser = await db.read<User>('users', user.id);

    if (dbUser) {
      return dbUser;
    }

    // Create user if doesn't exist
    const newUser: User = {
      id: user.id,
      name: user.email?.split('@')[0] || 'Anonymous User',
      email: user.email,
      avatar: user.user_metadata?.avatar_url,
    };

    return db.create('users', newUser);
  },

  async signInAnonymously(): Promise<User> {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      throw new Error(`Failed to sign in: ${error.message}`);
    }

    const user: User = {
      id: data.user!.id,
      name: 'Anonymous User',
      email: undefined,
      avatar: undefined,
    };

    return db.create('users', user);
  },
};
