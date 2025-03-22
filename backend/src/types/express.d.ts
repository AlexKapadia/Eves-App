import { Request, Response, NextFunction } from 'express';
import 'express';
import * as core from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

// Fix for route handlers return type incompatibility
declare module 'express-serve-static-core' {
  interface Request {
    user: any;
  }
  
  interface Response {
    [key: string]: any;
  }
  
  interface RequestHandler<
    P = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query,
    LocalsObj extends Record<string, any> = Record<string, any>
  > {
    (
      req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
      res: Response<ResBody, LocalsObj>,
      next: NextFunction
    ): any;
  }
} 