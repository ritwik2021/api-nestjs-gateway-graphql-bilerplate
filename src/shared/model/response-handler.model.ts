import { HttpException, Injectable } from '@nestjs/common';

/**
 * @class ResponseHandlerModel
 * @description This class is used to handle responses for HTTP requests.
 * @author Ritwik Rohitashwa
 */
@Injectable()
export class ResponseHandlerModel {
  /**
   * @description This method is used to handle successful responses for HTTP requests. It takes in a data
   * payload and a status code, and returns an object containing the success status, status code, and data.
   * @param data  any
   * @param statusCode  number
   * @returns { success: boolean, statusCode: number, data: any }
   * @author Ritwik Rohitashwa
   */
  async response(data: any, statusCode: number): Promise<{ success: boolean; statusCode: number; data: any }> {
    return { success: true, statusCode, data };
  }

  /**
   * @description This method is used to handle error responses for HTTP requests. It takes in an error object
   * and a status code, and throws an error containing the error message, stack trace, and status code.
   * @param error any
   * @param statusCode number
   * @throws { response, statusCode: number }
   * @author Ritwik Rohitashwa
   */
  error(error: any, statusCode: number) {
    const response = {};
    Object.assign(response, {
      success: false,
      error: typeof error == 'string' ? error : error.error,
      stack: typeof error == 'string' ? error : error.stack,
      statusCode: statusCode
    });
    throw new HttpException(response, statusCode);
  }
}
