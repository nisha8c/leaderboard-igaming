import { NextFunction, Response } from 'express';
import { Request } from 'express-serve-static-core';

export const verifyJwt = (_req: Request, _res: Response, next: NextFunction) => {
  _req.user = { 'cognito:groups': ['admin'] };
  next();
};
