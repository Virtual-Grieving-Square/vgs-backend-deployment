import axios from "axios";
import { ZOOM_OAUTH_ENDPOINT } from "../constants";

interface TokenResponse {
  access_token: string | null;
  expires_in: number | null;
  error: any; // Change the type according to the actual error structure
}

let accessToken: string | null = null;
let tokenExpiration: number | null = null;

/**
 * Retrieve token from Zoom API
 *
 * @returns {Object} { access_token, expires_in, error }
 */
const getToken = async (): Promise<TokenResponse> => {
  try {
    const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;

    if (!ZOOM_ACCOUNT_ID) {
      throw new Error("ZOOM_ACCOUNT_ID is not defined");
    }

    const params = new URLSearchParams({
      grant_type: "account_credentials",
      account_id: ZOOM_ACCOUNT_ID,
    });

    const request = await axios.post(ZOOM_OAUTH_ENDPOINT, params.toString(), {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    });

    const { access_token, expires_in } = request.data;
    accessToken = access_token;
    tokenExpiration = Date.now() + expires_in * 1000; // Convert expiration time to milliseconds

    return { access_token, expires_in, error: null };
  } catch (error) {
    return { access_token: null, expires_in: null, error };
  }
};

/**
 * Check if the access token is expired
 *
 * @returns {boolean} Whether the access token is expired
 */
const isTokenExpired = (): boolean => {
  return tokenExpiration !== null && tokenExpiration < Date.now();
};

/**
 * Set zoom access token with expiration
 *
 * @param {String} access_token
 * @param {int} expires_in
 */
const setToken = ({
  access_token,
  expires_in,
}: {
  access_token: string;
  expires_in: number;
}): void => {
  accessToken = access_token;
  tokenExpiration = Date.now() + expires_in * 1000; // Convert expiration time to milliseconds
};

export { getToken, setToken, isTokenExpired };
