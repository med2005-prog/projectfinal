import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string) {
  try {
    const response = await client.messages.create({
      body: message,
      from: fromPhone,
      to: to,
    });
    return { success: true, sid: response.sid };
  } catch (error: any) {
    console.error("Twilio Error:", error);
    return { success: false, error: error.message };
  }
}
