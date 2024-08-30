import { Response, Request } from "express";
import { sendOtp, verifyOtp } from "../util/smsMethods";
import { sendNotification } from "../middleware/notification";
import { sendEmailClaimer } from "../util/email";
import { fetchAniversayEmail } from "../cron/newsUpdater";

// Axios
import axios from 'axios';

export const testSMS = async (req: Request, res: Response) => {
  try {
    const response = await sendOtp("251937174609");
    res.status(200).json({ msg: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const testNotif = async (req: Request, res: Response) => {
  try {
    const { userID, authorTokens } = req.body;

    const payload = {
      title: "Your post got a new like!",
      body: `liked your post.`,
      data: { postId: userID },
    };
    await sendNotification({ token: authorTokens, payload });

    res.status(200).json({ msg: "Okay" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const testEmail = async (req: Request, res: Response) => {
  await sendEmailClaimer({
    name: "Aklile ",
    email: "aklilegetachew@gmail.com",
    amount: 500,
    date: new Date().toISOString().split("T")[0],
    type: "Withdrawal",
    confirmation: "Confirmed",

    recieverEmail: "aklilegetachew@gmail.com",
  })
    .then((response) => {
      console.log(response);
      res.status(200);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const testNotif3 = async (req: Request, res: Response) => {
  try {
    const { otp, pnum } = req.body;
    const response = await verifyOtp(otp, pnum);
    res.status(200).json({ msg: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const testAniversary = async (req: Request, res: Response) => {
  try {
    fetchAniversayEmail();
    res.status(200).json({ msg: "Works" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const testLogin = async (req: Request, res: Response) => {
  try {
    const results: any = [];

    for (let i = 0; i < 100; i++) {
      console.log(`Sending request number: ${i + 1}`);
      axios.post("https://sjxdbohpzl.execute-api.us-east-2.amazonaws.com/prod/auth/login", {
        email: "demo@virtualgrievingsquare.com",
        password: "Testing123!"
      }).then((response) => {
        console.log(response.data);

        results.push({
          requestNumber: i + 1,
        });
      }).catch((error) => {
        console.error("Error Logging In", error);
      })
    }

    console.log('Finished sending requests.');
    console.log("Results", results);

    res.json({ message: 'Requests completed', results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}
