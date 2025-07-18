import { Request, Response, NextFunction } from "express";
function isAdminUser(user: unknown): user is { 'cognito:groups': string[] } {
  return (
    typeof user === 'object' &&
    user !== null &&
    Array.isArray((user as Record<string, any>)['cognito:groups'])
  );
}

export function checkAdminAndParseBody(req: Request, res: Response, next: NextFunction) {
  if (!isAdminUser(req.user) || !req.user['cognito:groups'].includes('admin')) {
    return res.status(403).json({ message: "Admins only" });
  }

  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({ message: "Invalid Buffer JSON body" });
    }
  } else if (typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ message: "Invalid JSON body" });
    }
  }

  next();
}
