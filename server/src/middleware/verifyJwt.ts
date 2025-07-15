// server/src/middleware/verifyJwt.ts
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}


import jwt, { JwtHeader } from 'jsonwebtoken';
import jwksClient from "jwks-rsa";
import { Request, Response, NextFunction } from "express";

const client = jwksClient({
  jwksUri: "https://YOUR-USERPOOL-DOMAIN.auth.eu-north-1.amazoncognito.com/.well-known/jwks.json",
});

function getKey(header: JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid!, function (err, key) {
    if (err) {
      console.error("Signing key error:", err);
      callback(err, undefined);
    } else {
      const signingKey = key!.getPublicKey();
      callback(null, signingKey);
    }
  });
}


export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["RS256"],
      issuer: "https://cognito-idp.eu-north-1.amazonaws.com/YOUR_USER_POOL_ID",
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verify failed:", err);
        return res.status(401).json({ error: "Invalid token" });
      }
      req.user = decoded;
      next();
    }
  );
}
