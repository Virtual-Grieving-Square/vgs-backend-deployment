import cron from "node-cron";
import NewsModel from "../model/news";
import NewsFetchTimeModel from "../model/newsFetchTime";
import { HumanMemorial } from "../model/humanMemorial";
import FamousPeopleModel from "../model/famousPeople";
import { PetMemorial } from "../model/petMemorial";
import { UserModel } from "../model/user";
import { sendEmailAniversary } from "../util/email";
const NewsAPI = require("newsapi");

const NewApiEnv = process.env.NEWS_API_KEY;
const newsapi = new NewsAPI(NewApiEnv);

// export const fetchAndUpdateNews = async () => {
//   console.log("here is the time ")
//   try {
//     const response = await newsapi.v2.everything({
//       q: 'death OR school-shootings OR funeral OR mass-shooting OR earth-quake OR celebrity-death',
//       language: 'en',
//     });

//     if (response.status === 'ok') {
//       const articles = response.articles;

//       for (const article of articles) {
//         await NewsModel.updateOne(
//           { url: article.url },
//           {
//             $set: {
//               source: { id: article.source.id || "", name: article.source.name || "" },
//               author: article.author,
//               title: article.title,
//               description: article.description,
//               url: article.url,
//               urlToImage: article.urlToImage,
//               publishedAt: article.publishedAt,
//               content: article.content,
//               createdAt: new Date()
//             }
//           },
//           { upsert: true }
//         );
//       }

//       await NewsFetchTimeModel.create({ lastFetchTime: new Date() });
//     }
//   } catch (error) {
//     console.error('Error fetching news:', error);
//   }
// };

export const fetchAndUpdateNews = async () => {
  console.log("Cron job started at", new Date().toISOString());

  try {
    const response = await newsapi.v2.everything({
      q: "died OR school-shootings OR funeral OR mass-shooting OR earth-quake OR celebrity-death",
      language: "en",
      sortBy: "publishedAt",
      pageSize: 50,
    });

    if (response.status === "ok") {
      const articles = response.articles;

      for (const article of articles) {
        await NewsModel.updateOne(
          { url: article.url },
          {
            $set: {
              source: {
                id: article.source.id || "",
                name: article.source.name || "",
              },
              author: article.author,
              title: article.title,
              description: article.description,
              url: article.url,
              urlToImage: article.urlToImage,
              publishedAt: article.publishedAt,
              content: article.content,
              createdAt: new Date(),
            },
          },
          { upsert: true } // Insert the article if it doesn't exist, otherwise update
        );
      }

      await NewsFetchTimeModel.create({ lastFetchTime: new Date() });
      console.log("News articles updated at", new Date().toISOString());
    }
  } catch (error) {
    console.error("Error fetching news:", error);
  }

  console.log("Cron job finished at", new Date().toISOString());
};

export const fetchAniversayEmail = async () => {
  console.log("Cron job started at for aniversarry", new Date().toISOString());

  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    // Set time to start of the day
    oneYearAgo.setHours(0, 0, 0, 0);

    const endOfOneYearAgo = new Date(oneYearAgo);
    // Set end time to end of the day
    endOfOneYearAgo.setHours(23, 59, 59, 999);

    const humanObituaries = await HumanMemorial.aggregate([
      {
        $match: {
          dod: { $gte: oneYearAgo, $lt: endOfOneYearAgo },
        },
      },
    ]);

    const famousObituaries = await PetMemorial.aggregate([
      {
        $match: {
          DOD: { $gte: oneYearAgo, $lt: endOfOneYearAgo },
        },
      },
    ]);
    console.log(famousObituaries);
    if (humanObituaries.length !== 0) {
      for (const obituary of humanObituaries) {
        console.log(obituary.author);
        const user = await UserModel.findById(obituary.author);
        if (user) {
          console.log(`User for human obituary ${obituary}:`);
          // Process user or send email
          sendEmailAniversary(user, obituary);
        } else {
          console.log(`No user found for AuthorID ${obituary}`);
        }
      }
    }

    if (famousObituaries.length !== 0) {
      for (const obituary of famousObituaries) {
        const user = await UserModel.findById(obituary.owner);
        if (user) {
          sendEmailAniversary(user, obituary);
        } else {
          console.log(`No user found for ownerId ${obituary}`);
        }
      }
    }
  } catch (error) {
    console.error("Error sending aniversary:", error);
  }

  console.log("Cron job finished at", new Date().toISOString());
};
