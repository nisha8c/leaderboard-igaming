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
import dotenv from "dotenv";
dotenv.config();

const client = jwksClient({
  jwksUri: `https://cognito-idp.eu-north-1.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`,
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
      issuer: `https://cognito-idp.eu-north-1.amazonaws.com/${process.env.USER_POOL_ID}`,
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verify failed:", err);
        return res.status(401).json({ error: "Invalid token" });
      }
      req.user = decoded;
      console.log("✅ Decoded JWT payload:", decoded);
      next();
    }
  );
}
