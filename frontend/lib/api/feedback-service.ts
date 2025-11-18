/**
 * Feedback Service
 * Handles user feedback, ratings, and suggestions
 */

import { apiClient } from './client';

export type FeedbackType = 'suggestion' | 'bug' | 'rating' | 'other';

export interface FeedbackRequest {
  type: FeedbackType;
  content: string;
  user_id?: string;
  rating?: number;
  message_id?: string;
  metadata?: Record<string, unknown>;
}

export interface FeedbackResponse {
  success: boolean;
  feedback_id: string;
  message: string;
  timestamp?: number;
}

export interface RatingRequest {
  message_id: string;
  rating: number;
  user_id?: string;
  comment?: string;
}

export interface RatingResponse {
  success: boolean;
  rating_id: string;
  message: string;
}

class FeedbackService {
  /**
   * Submit general feedback
   */
  async submitFeedback(feedback: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      const response = await apiClient.request<FeedbackResponse>('/feedback', {
        method: 'POST',
        body: JSON.stringify(feedback),
      });
      return response;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  /**
   * Submit a rating for a specific message
   */
  async submitRating(rating: RatingRequest): Promise<RatingResponse> {
    try {
      const feedbackRequest: FeedbackRequest = {
        type: 'rating',
        content: rating.comment || `Rating: ${rating.rating}/5`,
        rating: rating.rating,
        message_id: rating.message_id,
        user_id: rating.user_id,
        metadata: {
          rating: rating.rating,
          message_id: rating.message_id,
        },
      };

      const response = await this.submitFeedback(feedbackRequest);
      
      return {
        success: response.success,
        rating_id: response.feedback_id,
        message: response.message,
      };
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  }

  /**
   * Submit a bug report
   */
  async submitBugReport(
    description: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): Promise<FeedbackResponse> {
    return this.submitFeedback({
      type: 'bug',
      content: description,
      user_id: userId,
      metadata: {
        ...metadata,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Submit a feature suggestion
   */
  async submitSuggestion(
    suggestion: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): Promise<FeedbackResponse> {
    return this.submitFeedback({
      type: 'suggestion',
      content: suggestion,
      user_id: userId,
      metadata,
    });
  }

  /**
   * Quick rating (1-5 stars) for a message
   */
  async quickRate(
    messageId: string,
    rating: number,
    userId?: string
  ): Promise<RatingResponse> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return this.submitRating({
      message_id: messageId,
      rating,
      user_id: userId,
    });
  }

  /**
   * Submit detailed feedback with rating
   */
  async submitDetailedFeedback(
    messageId: string,
    rating: number,
    comment: string,
    userId?: string
  ): Promise<RatingResponse> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return this.submitRating({
      message_id: messageId,
      rating,
      comment,
      user_id: userId,
    });
  }
}

export const feedbackService = new FeedbackService();
