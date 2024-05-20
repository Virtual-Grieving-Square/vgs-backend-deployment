import dotenv from "dotenv";
dotenv.config();

interface Config {
  DB_CONNECTION_STRING: string;
  PORT: number;
  Google_API: string;
  Samp_API: string;
  Google_translate: string;
  zoomSEC: string;
  zoomAPI: string;
  Zoom_sdk_key: string;
  Zoom_sdk_sec_key: string;
}

const config: Config = {
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || "",
  PORT: parseInt(process.env.PORT || "3000", 10),
  Google_API: process.env.GOOGLE_PRE_API_KEY || "",
  Samp_API: process.env.SAMPLING_API_KEY || "",
  Google_translate: process.env.GOOGLE_TRANSLATE_API_KEY || "",
  zoomSEC: process.env.ZOOM_API_SECRET || "",
  zoomAPI: process.env.ZOOM_API_KEY || "",
  Zoom_sdk_key: process.env.ZOOM_API_KEY || "",
  Zoom_sdk_sec_key: process.env.ZOOM_API_SECRET || "",
};

export default config;
