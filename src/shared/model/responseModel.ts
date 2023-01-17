import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class ResponseModel {
  response(message: any, status: number, success: boolean) {
    return {
      message,
      success,
      status
    };
  }

  error(message: any, status: number, success: boolean) {
    throw new HttpException({ message, success }, status);
  }
}
