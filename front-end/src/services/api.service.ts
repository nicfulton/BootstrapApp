// Updated API service with better error handling
// src/services/api.service.ts
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { get, post, put, del } from 'aws-amplify/api';
import { ApiErrorResponse, ApiRequestError, Item } from '../models/api.types.ts';
import { ConsoleLogger as Logger } from 'aws-amplify/utils';

const logger = new Logger('ApiService');

export class ApiService {
  private static async getHeaders(): Promise<Headers> {
    // Get the current session token using the new method
    const { tokens } = await fetchAuthSession();
    const token = tokens?.idToken?.toString();

    if (!token) {
      throw new Error('No authentication token available');
    }

    var dateString = new Date().toUTCString; //.toateString();

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `allow, Bearer ${token}`,
      // 'Date': `${dateString}`,
      // 'X-Amz-Date': `${dateString}`
     });

    return headers;
  }


  static async getItems(): Promise<Item[]> {


    try {
      const headers = await this.getHeaders();
      const { body } = await get({
        apiName: 'api',
        path: '/items',
        options: {
          headers: Object.fromEntries(headers.entries()),
          /*
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': `${window.location.origin.toString()}`
          }
            */
        },
        //authMode: 'AWS_IAM'
      }).response;
      
      return body as unknown as Item[];
    } catch (error: unknown) {
      logger.error('Error fetching items:', error);
      throw this.handleError(error);
    }
  }

  static async getItem(id: string): Promise<Item> {
    try {
      const headers = await this.getHeaders();
      const { body } = await get({
        apiName: 'api',
        path: `/items/${id}`,
        options: {
          headers: Object.fromEntries(headers.entries()),
        }
      }).response;

      return body as unknown as Item;
    } catch (error: unknown) {
      logger.error('Error fetching item:', id, error);
      throw this.handleError(error);
    }
  }

  static async createItem(item: Omit<Item, 'id' | 'userId' | 'createdAt'>): Promise<Item> {
    try {
      const headers = await this.getHeaders();
      const { body } = await post({
        apiName: 'api',
        path: '/items',
        options: {
          body: item,
          headers: Object.fromEntries(headers.entries()),
        }
      }).response;

      return body as unknown as Item;
    } catch (error: unknown) {
      logger.error('Error creating items:', error);
      throw this.handleError(error);
    }
  }

  static async updateItem(id: string, item: Partial<Item>): Promise<Item> {
    try {
      const headers = await this.getHeaders();
      const { body } = await put({
        apiName: 'api',
        path: `/items/${id}`,
        options: {
          body: item,
          headers: Object.fromEntries(headers.entries()),
        }
      }).response;

      return body as unknown as Item;
    } catch (error: unknown) {
      logger.error('Error updating items:', error);
      throw this.handleError(error);
    }
  }

  static async deleteItem(id: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await del({
        apiName: 'api',
        path: `/items/${id}`,
        options: {
          headers: Object.fromEntries(headers.entries()),
        }
      }).response;
    } catch (error: unknown) {
      logger.error('Error deleting items:', error);
      throw this.handleError(error);
    }
  }

  private static handleError(error: unknown): never {
    console.error('API Error:', error);

    // Handle Amplify API errors
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response: ApiErrorResponse };
      if (apiError.response.statusCode === 401) {
        // Handle unauthorized access
        signOut(); // Using the new signOut method
      }
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
