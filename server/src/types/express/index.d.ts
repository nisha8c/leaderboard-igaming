import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: string | (JwtPayload & { [key: string]: any });
  }
}

/*
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
  }
}
 */