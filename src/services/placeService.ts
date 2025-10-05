import { v4 as uuidv4 } from 'uuid';
import { Place, TemporaryPlace } from '../types';
import { LocalDatabase } from './database';

export class PlaceService {
  private db: LocalDatabase;

  constructor() {
    this.db = LocalDatabase.getInstance();
  }

  async createPlace(place: Omit<Place, 'id'>): Promise<Place> {
    try {
      const newPlace: Place = {
        id: uuidv4(),
        ...place,
      };

      await this.db.create('places', newPlace);
      return newPlace;
    } catch (error) {
      console.error('Failed to create place:', error);
      throw error;
    }
  }

  async savePlace(place: Place): Promise<Place> {
    try {
      // 이미 DB에 있는지 확인
      const existing = await this.getPlace(place.id);
      if (existing) {
        return existing;
      }

      // 없으면 새로 저장
      await this.db.create('places', place);
      return place;
    } catch (error) {
      console.error('Failed to save place:', error);
      throw error;
    }
  }

  async getPlace(id: string): Promise<Place | null> {
    try {
      return await this.db.read<Place>('places', id);
    } catch (error) {
      console.error('Failed to get place:', error);
      return null;
    }
  }

  async getAllPlaces(): Promise<Place[]> {
    try {
      return await this.db.getAll<Place>('places');
    } catch (error) {
      console.error('Failed to get all places:', error);
      return [];
    }
  }

  async updatePlace(id: string, updates: Partial<Place>): Promise<Place> {
    try {
      const existingPlace = await this.db.read<Place>('places', id);
      if (!existingPlace) {
        throw new Error('Place not found');
      }

      const updatedPlace = { ...existingPlace, ...updates };
      await this.db.update('places', updatedPlace);
      return updatedPlace;
    } catch (error) {
      console.error('Failed to update place:', error);
      throw error;
    }
  }

  async deletePlace(id: string): Promise<void> {
    try {
      await this.db.delete('places', id);
    } catch (error) {
      console.error('Failed to delete place:', error);
      throw error;
    }
  }

  async addToTemporaryStorage(
    planId: string,
    place: Place
  ): Promise<TemporaryPlace> {
    try {
      const temporaryPlace: TemporaryPlace = {
        id: uuidv4(),
        planId,
        place,
        addedAt: new Date().toISOString(),
      };

      await this.db.create('temporaryPlaces', temporaryPlace);
      return temporaryPlace;
    } catch (error) {
      console.error('Failed to add to temporary storage:', error);
      throw error;
    }
  }

  async getTemporaryPlaces(planId: string): Promise<TemporaryPlace[]> {
    try {
      const allTemporary =
        await this.db.getAll<TemporaryPlace>('temporaryPlaces');
      return allTemporary.filter((temp) => temp.planId === planId);
    } catch (error) {
      console.error('Failed to get temporary places:', error);
      return [];
    }
  }

  async removeFromTemporaryStorage(id: string): Promise<void> {
    try {
      await this.db.delete('temporaryPlaces', id);
    } catch (error) {
      console.error('Failed to remove from temporary storage:', error);
      throw error;
    }
  }

  async searchPlaces(
    query: string,
    filters?: {
      category?: string;
      region?: string;
    }
  ): Promise<Place[]> {
    try {
      const allPlaces = await this.getAllPlaces();

      return allPlaces.filter((place) => {
        const matchesQuery =
          place.name.toLowerCase().includes(query.toLowerCase()) ||
          place.description?.toLowerCase().includes(query.toLowerCase()) ||
          place.address?.toLowerCase().includes(query.toLowerCase());

        const matchesCategory =
          !filters?.category || place.category === filters.category;
        const matchesRegion =
          !filters?.region ||
          place.address?.toLowerCase().includes(filters.region.toLowerCase());

        return matchesQuery && matchesCategory && matchesRegion;
      });
    } catch (error) {
      console.error('Failed to search places:', error);
      return [];
    }
  }

  async getPlacesByIds(ids: string[]): Promise<Place[]> {
    try {
      const places = await Promise.all(ids.map((id) => this.getPlace(id)));
      return places.filter((place): place is Place => place !== null);
    } catch (error) {
      console.error('Failed to get places by IDs:', error);
      return [];
    }
  }

  async getNearbyPlaces(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<Place[]> {
    try {
      const allPlaces = await this.getAllPlaces();

      return allPlaces.filter((place) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          place.latitude,
          place.longitude
        );
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Failed to get nearby places:', error);
      return [];
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
