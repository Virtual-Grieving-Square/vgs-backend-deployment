import express, { Request, Response } from "express";
import { KJUR } from "jsrsasign";
import {
  inNumberArray,
  isBetween,
  isRequiredAllOrNone,
  validateRequest,
  Validator,
} from "../util/validation";

import config from "../config";

const propValidations: { [key: string]: Validator | Validator[] } = {
  role: inNumberArray([0, 1]),
  expirationSeconds: isBetween(1800, 172800),
};

const schemaValidations: Validator[] = [
  isRequiredAllOrNone(["meetingNumber", "role"]),
];

const coerceRequestBody = (body: any) => ({
  ...body,
  ...["role", "expirationSeconds"].reduce(
    (acc: any, cur: string) => ({
      ...acc,
      [cur]:
        typeof body[cur] === "string" ? parseInt(body[cur], 10) : body[cur],
    }),
    {}
  ),
});
const router = express.Router();

router.post("/", (req: Request, res: Response) => {
  console.log(req.body);
  const requestBody = coerceRequestBody(req.body);
  const validationErrors = validateRequest(
    requestBody,
    propValidations,
    schemaValidations
  );

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const { meetingNumber, role, expirationSeconds } = requestBody;
  const iat = Math.floor(Date.now() / 1000);
  const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;
  const oHeader = { alg: "HS256", typ: "JWT" };

  const oPayload = {
    appKey: config.Zoom_sdk_key!,
    sdkKey: config.Zoom_sdk_key!,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const sdkJWT = KJUR.jws.JWS.sign(
    "HS256",
    sHeader,
    sPayload,
    config.Zoom_sdk_sec_key!
  );
  return res.json({ signature: sdkJWT });
});

export default router;
