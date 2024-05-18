import twilio from "twilio";
import config from "../config";

// Function to send OTP using twilio
export async function sendOtp(numb: string): Promise<any> {
  const accountSid = config.twilioAccount;
  const authToken = config.twilioAuthToken;
  const servicToken: string = config.twilioService;
  const client = require("twilio")(accountSid, authToken);

  try {
    const verification = await client.verify.v2
      .services(servicToken)
      .verifications.create({
        to: `+${numb}`,
        channel: "sms",
      });

    return verification;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function verifyOtp(otp: number, numb: string): Promise<any> {
  const accountSid = config.twilioAccount;
  const authToken = config.twilioAuthToken;
  const servicToken: string = config.twilioService;
  const client = require("twilio")(accountSid, authToken);
  try {
    const verification = await client.verify.v2
      .services(servicToken)
      .verificationChecks.create({ to: `+${numb}`, code: otp });
    return verification.status;
  } catch (error) {
    throw error;
  }
}
