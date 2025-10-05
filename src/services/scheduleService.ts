import { Schedule, ScheduleDay, Place, TimelineItem } from '../types';
import { LocalDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';
import { format, differenceInMinutes, parseISO, addMinutes } from 'date-fns';

export class ScheduleService {
  private db = LocalDatabase.getInstance();
  private storeName = 'schedules';

  public async createSchedule(
    planId: string,
    date: string,
    placeId: string,
    startTime: string,
    endTime: string,
    order: number
  ): Promise<Schedule> {
    const newSchedule: Schedule = {
      id: uuidv4(),
      planId,
      date,
      placeId,
      startTime,
      endTime,
      order,
    };

    await this.db.create(this.storeName, newSchedule);
    return newSchedule;
  }

  public async getSchedulesByPlan(planId: string): Promise<Schedule[]> {
    return await this.db.getByIndex<Schedule>(this.storeName, 'planId', planId);
  }

  public async getSchedulesByDate(
    planId: string,
    date: string
  ): Promise<Schedule[]> {
    const allSchedules = await this.getSchedulesByPlan(planId);
    return allSchedules
      .filter((schedule) => schedule.date === date)
      .sort((a, b) => a.order - b.order);
  }

  public async updateSchedule(
    id: string,
    updates: Partial<Schedule>
  ): Promise<Schedule> {
    const existingSchedule = await this.db.read<Schedule>(this.storeName, id);
    if (!existingSchedule) {
      throw new Error('Schedule not found');
    }

    const updatedSchedule: Schedule = {
      ...existingSchedule,
      ...updates,
      id,
    };

    await this.db.update(this.storeName, updatedSchedule);
    return updatedSchedule;
  }

  public async deleteSchedule(id: string): Promise<void> {
    await this.db.delete(this.storeName, id);
  }

  public async reorderSchedules(
    planId: string,
    date: string,
    scheduleIds: string[]
  ): Promise<void> {
    const schedules = await this.getSchedulesByDate(planId, date);

    for (let i = 0; i < scheduleIds.length; i++) {
      const schedule = schedules.find((s) => s.id === scheduleIds[i]);
      if (schedule) {
        await this.updateSchedule(schedule.id, { order: i });
      }
    }
  }

  public async getSchedulesByDay(planId: string): Promise<ScheduleDay[]> {
    try {
      const schedules = await this.getSchedulesByPlan(planId);
      const groupedByDate = this.groupSchedulesByDate(schedules);

      return Object.entries(groupedByDate).map(([date, daySchedules]) => {
        const sortedSchedules = daySchedules.sort((a, b) => a.order - b.order);
        const totalDuration = this.calculateTotalDuration(sortedSchedules);

        return {
          date,
          schedules: sortedSchedules,
          totalDuration,
        };
      });
    } catch (error) {
      console.error('Failed to get schedules by day:', error);
      return [];
    }
  }

  public createTimeline(
    schedules: Schedule[],
    places: Place[]
  ): TimelineItem[] {
    const timeline: TimelineItem[] = [];
    let order = 0;

    schedules.forEach((schedule, index) => {
      const place = places.find((p) => p.id === schedule.placeId);

      timeline.push({
        id: `schedule-${schedule.id}`,
        type: 'schedule',
        schedule,
        place,
        order: order++,
      });

      if (index < schedules.length - 1) {
        const currentPlace = place;
        const nextSchedule = schedules[index + 1];
        const nextPlace = places.find((p) => p.id === nextSchedule.placeId);

        if (currentPlace && nextPlace) {
          const travelTime = this.calculateETA(
            currentPlace.latitude,
            currentPlace.longitude,
            nextPlace.latitude,
            nextPlace.longitude
          );

          timeline.push({
            id: `travel-${schedule.id}-${nextSchedule.id}`,
            type: 'travel',
            travelTime,
            order: order++,
          });
        }
      }
    });

    return timeline;
  }

  public formatTime(timeString: string): string {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'HH:mm');
    } catch (error) {
      return timeString;
    }
  }

  public calculateDuration(startTime: string, endTime: string): number {
    try {
      const start = parseISO(`2000-01-01T${startTime}`);
      const end = parseISO(`2000-01-01T${endTime}`);
      return differenceInMinutes(end, start);
    } catch (error) {
      return 0;
    }
  }

  public addTimeToSchedule(startTime: string, durationMinutes: number): string {
    try {
      const start = parseISO(`2000-01-01T${startTime}`);
      const end = addMinutes(start, durationMinutes);
      return format(end, 'HH:mm');
    } catch (error) {
      return startTime;
    }
  }

  public calculateETA(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ): number {
    const R = 6371;
    const dLat = ((toLat - fromLat) * Math.PI) / 180;
    const dLng = ((toLng - fromLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((fromLat * Math.PI) / 180) *
        Math.cos((toLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    const averageSpeed = 30;
    return Math.round((distance / averageSpeed) * 60);
  }

  private groupSchedulesByDate(
    schedules: Schedule[]
  ): Record<string, Schedule[]> {
    return schedules.reduce(
      (groups, schedule) => {
        const date = schedule.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(schedule);
        return groups;
      },
      {} as Record<string, Schedule[]>
    );
  }

  private calculateTotalDuration(schedules: Schedule[]): number {
    return schedules.reduce((total, schedule) => {
      const duration = this.calculateDuration(
        schedule.startTime,
        schedule.endTime
      );
      return total + duration;
    }, 0);
  }
}
