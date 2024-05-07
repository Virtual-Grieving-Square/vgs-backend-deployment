import { Response, Request } from 'express';

export const testSMS = (req: Request, res: Response) => {
  try {
    const accountSid = 'ACf82578cfbc9c0f0c997db5bf896f4d22';
    const authToken = '984a73580bad66de1c351467dfec59d9';
    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
        body: 'Hello from Natnael Engeda',
        from: '+18664601237',
        to: '+251936657001'
      })
      .then((message: any) => console.log(message.sid))
    // .done();

    // client.messages
    //   .create({
    //     body: 'Hello from twilio-node',
    //     to: '+12345678901', // Text your number
    //     from: '+12345678901', // From a valid Twilio number
    //   })
    //   .then((message) => console.log(message.sid));

    res.status(200).json({ msg: "Message Sent" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}