import cron from "node-cron";
import NewsModel from "../model/news";
import NewsFetchTimeModel from "../model/newsFetchTime";
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
