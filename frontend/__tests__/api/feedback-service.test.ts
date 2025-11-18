/**
 * Feedback Service Tests
 * Tests for feedback submission and rating functionality
 */

import { feedbackService } from '@/lib/api/feedback-service';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client');

describe('FeedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const mockResponse = {
        success: true,
        feedback_id: 'feedback_123',
        message: 'Feedback submitted',
      };

      (apiClient.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await feedbackService.submitFeedback({
        type: 'suggestion',
        content: 'Great app!',
        user_id: 'user_123',
      });

      expect(result).toEqual(mockResponse);
      expect(apiClient.request).toHaveBeenCalledWith('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          type: 'suggestion',
          content: 'Great app!',
          user_id: 'user_123',
        }),
      });
    });

    it('should handle feedback submission errors', async () => {
      (apiClient.request as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        feedbackService.submitFeedback({
          type: 'bug',
          content: 'Found a bug',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('submitRating', () => {
    it('should submit rating successfully', async () => {
      const mockResponse = {
        success: true,
        feedback_id: 'rating_123',
        message: 'Rating submitted',
      };

      (apiClient.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await feedbackService.submitRating({
        message_id: 'msg_123',
        rating: 5,
        user_id: 'user_123',
        comment: 'Excellent!',
      });

      expect(result.success).toBe(true);
      expect(result.rating_id).toBe('rating_123');
    });
  });

  describe('quickRate', () => {
    it('should submit quick rating', async () => {
      const mockResponse = {
        success: true,
        feedback_id: 'rating_123',
        message: 'Rating submitted',
      };

      (apiClient.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await feedbackService.quickRate('msg_123', 4, 'user_123');

      expect(result.success).toBe(true);
    });

    it('should validate rating range', async () => {
      await expect(
        feedbackService.quickRate('msg_123', 0, 'user_123')
      ).rejects.toThrow('Rating must be between 1 and 5');

      await expect(
        feedbackService.quickRate('msg_123', 6, 'user_123')
      ).rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('submitBugReport', () => {
    it('should submit bug report with metadata', async () => {
      const mockResponse = {
        success: true,
        feedback_id: 'bug_123',
        message: 'Bug report submitted',
      };

      (apiClient.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await feedbackService.submitBugReport(
        'App crashes on startup',
        'user_123',
        { page: '/home' }
      );

      expect(result.success).toBe(true);
      expect(apiClient.request).toHaveBeenCalledWith(
        '/feedback',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('submitSuggestion', () => {
    it('should submit suggestion', async () => {
      const mockResponse = {
        success: true,
        feedback_id: 'suggestion_123',
        message: 'Suggestion submitted',
      };

      (apiClient.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await feedbackService.submitSuggestion(
        'Add dark mode',
        'user_123'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('submitDetailedFeedback', () => {
    it('should submit detailed feedback with rating and comment', async () => {
      const mockResponse = {
        success: true,
        feedback_id: 'detailed_123',
        message: 'Feedback submitted',
      };

      (apiClient.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await feedbackService.submitDetailedFeedback(
        'msg_123',
        5,
        'Amazing response!',
        'user_123'
      );

      expect(result.success).toBe(true);
    });

    it('should validate rating range', async () => {
      await expect(
        feedbackService.submitDetailedFeedback('msg_123', 0, 'Bad', 'user_123')
      ).rejects.toThrow('Rating must be between 1 and 5');
    });
  });
});
