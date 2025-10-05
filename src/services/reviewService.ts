import { ReviewItem, ReviewType, Schedule } from '../types';
import { LocalDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

export class ReviewService {
  private db = LocalDatabase.getInstance();
  private storeName = 'reviews';

  /**
   * 장소 리뷰 생성
   */
  public async createPlaceReview(
    planId: string,
    placeId: string,
    authorId: string,
    content: string,
    images: string[] = [],
    rating?: number
  ): Promise<ReviewItem> {
    if (content.length > 100) {
      throw new Error('장소 리뷰는 100자 이내로 작성해주세요.');
    }

    if (images.length > 2) {
      throw new Error('장소 리뷰는 사진을 최대 2장까지 첨부할 수 있습니다.');
    }

    const newReview: ReviewItem = {
      id: uuidv4(),
      planId,
      placeId,
      content,
      images,
      writtenAt: new Date().toISOString(),
      authorId,
      rating,
      type: ReviewType.PLACE,
    };

    await this.db.create(this.storeName, newReview);
    return newReview;
  }

  /**
   * 일기형 후기 생성
   */
  public async createDailyReview(
    planId: string,
    authorId: string,
    content: string,
    images: string[] = []
  ): Promise<ReviewItem> {
    if (content.length > 1000) {
      throw new Error('일기형 후기는 1,000자 이내로 작성해주세요.');
    }

    const newReview: ReviewItem = {
      id: uuidv4(),
      planId,
      content,
      images,
      writtenAt: new Date().toISOString(),
      authorId,
      type: ReviewType.DAILY,
    };

    await this.db.create(this.storeName, newReview);
    return newReview;
  }

  /**
   * 리뷰 조회 (여행 계획별)
   */
  public async getReviewsByPlan(planId: string): Promise<ReviewItem[]> {
    return await this.db.getByIndex<ReviewItem>(
      this.storeName,
      'planId',
      planId
    );
  }

  /**
   * 장소별 리뷰 조회
   */
  public async getReviewsByPlace(
    planId: string,
    placeId: string
  ): Promise<ReviewItem[]> {
    const allReviews = await this.getReviewsByPlan(planId);
    return allReviews.filter(
      (review) => review.type === ReviewType.PLACE && review.placeId === placeId
    );
  }

  /**
   * 일기형 후기 조회
   */
  public async getDailyReviews(planId: string): Promise<ReviewItem[]> {
    const allReviews = await this.getReviewsByPlan(planId);
    return allReviews.filter((review) => review.type === ReviewType.DAILY);
  }

  /**
   * 리뷰 수정
   */
  public async updateReview(
    id: string,
    updates: Partial<ReviewItem>
  ): Promise<ReviewItem> {
    const existingReview = await this.db.read<ReviewItem>(this.storeName, id);
    if (!existingReview) {
      throw new Error('Review not found');
    }

    // 타입별 유효성 검사
    if (updates.content) {
      const maxLength = existingReview.type === ReviewType.PLACE ? 100 : 1000;
      if (updates.content.length > maxLength) {
        throw new Error(
          `${existingReview.type === ReviewType.PLACE ? '장소 리뷰' : '일기형 후기'}는 ${maxLength}자 이내로 작성해주세요.`
        );
      }
    }

    if (updates.images) {
      const maxImages = existingReview.type === ReviewType.PLACE ? 2 : 10;
      if (updates.images.length > maxImages) {
        throw new Error(
          `${existingReview.type === ReviewType.PLACE ? '장소 리뷰' : '일기형 후기'}는 사진을 최대 ${maxImages}장까지 첨부할 수 있습니다.`
        );
      }
    }

    const updatedReview: ReviewItem = {
      ...existingReview,
      ...updates,
      id,
    };

    await this.db.update(this.storeName, updatedReview);
    return updatedReview;
  }

  /**
   * 리뷰 삭제
   */
  public async deleteReview(id: string): Promise<void> {
    await this.db.delete(this.storeName, id);
  }

  /**
   * 장소 리뷰 작성 가능 여부 확인
   */
  public canWritePlaceReview(schedule: Schedule): boolean {
    const scheduleTime = new Date(
      `${schedule.date}T${schedule.endTime || '23:59'}`
    );
    const now = new Date();
    return now > scheduleTime;
  }

  /**
   * 일기형 후기 작성 가능 여부 확인 (해당 날짜가 지났는지)
   */
  public canWriteDailyReview(date: string): boolean {
    const targetDate = new Date(date);
    targetDate.setHours(23, 59, 59, 999); // 해당 날짜의 끝
    const now = new Date();
    return now > targetDate;
  }

  /**
   * 이미지 파일 검증
   */
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

  /**
   * 이미지를 Base64로 변환
   */
  public async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
