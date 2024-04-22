import { KJUR } from "jsrsasign";
// Assuming jsrsasign is a dependency with type definitions

interface JwtHeader {
  alg: string;
  typ: string;
}

interface JwtPayload {
  iss: string;
  iat: number;
  exp: number;
}

export const generateVideoSdkApiJwt = () => {
  const sdkApiKey = process.env.VIDEO_SDK_API_KEY?.toString();
  const sdkApiSecret = process.env.VIDEO_SDK_API_SECRET?.toString();

  if (!sdkApiKey || !sdkApiSecret) {
    throw new Error(
      "Missing environment variables VIDEO_SDK_API_KEY or VIDEO_SDK_API_SECRET"
    );
  }
  const iat = Math.round((new Date().getTime() - 30000) / 1000);
  const exp = iat + 60 * 60 * 2; // 2 hours expiration

  const oHeader: JwtHeader = {
    alg: "HS256",
    typ: "JWT",
  };

  const oPayload: JwtPayload = {
    iss: sdkApiKey,
    iat: iat,
    exp: exp,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const videosdk_api_token = KJUR.jws.JWS.sign(
    "HS256",
    sHeader,
    sPayload,
    sdkApiSecret
  );
  return videosdk_api_token;
};
