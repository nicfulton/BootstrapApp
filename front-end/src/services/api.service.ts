// Updated API service with better error handling
// src/services/api.service.ts
import { get, post, put, del } from 'aws-amplify/api';
import { ApiErrorResponse, ApiRequestError, Item } from '../models/api.types.ts';

export class ApiService {
  static async getItems(): Promise<Item[]> {
    try {
      const { body } = await get({
        apiName: 'api',
        path: '/items',
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      }).response;
      
      return body as unknown as Item[];
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  static async getItem(id: string): Promise<Item> {
    try {
      const { body } = await get({
        apiName: 'api',
        path: `/items/${id}`,
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      }).response;

      return body as unknown as Item;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  static async createItem(item: Omit<Item, 'id' | 'userId' | 'createdAt'>): Promise<Item> {
    try {
      const { body } = await post({
        apiName: 'api',
        path: '/items',
        options: {
          body: item,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      }).response;

      return body as unknown as Item;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  static async updateItem(id: string, item: Partial<Item>): Promise<Item> {
    try {
      const { body } = await put({
        apiName: 'api',
        path: `/items/${id}`,
        options: {
          body: item,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      }).response;

      return body as unknown as Item;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  static async deleteItem(id: string): Promise<void> {
    try {
      await del({
        apiName: 'api',
        path: `/items/${id}`,
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      }).response;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: unknown): never {
    console.error('API Error:', error);

    // Handle Amplify API errors
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response: ApiErrorResponse };
      throw new ApiRequestError(
        apiError.response.body.message || 'An unexpected error occurred',
        apiError.response.statusCode,
        apiError.response.body.code,
        apiError.response.body.details
      );
    }

    // Handle network errors
    if (error instanceof Error) {
      throw new ApiRequestError(
        error.message || 'Network error occurred',
        500,
        'NETWORK_ERROR'
      );
    }

    // Handle unknown errors
    throw new ApiRequestError(
      'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR'
    );
  }
}
