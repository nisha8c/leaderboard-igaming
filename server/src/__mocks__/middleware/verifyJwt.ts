export const verifyJwt = (_req: any, _res: any, next: any) => {
  _req.user = { 'cognito:groups': ['admin'] }; // simulate admin user
  next();
};
