import { Request, Response } from "express";
import NewsFetchTimeModel from "../model/newsFetchTime";
import { fetchNews } from "../util/newsfetchapi";
import NewsModel from "../model/news";
// import newsapi from "newsapi";
const NewsAPI = require('newsapi');

const newsapi = new NewsAPI("e42134b4c21a40aeb96703d971947429");

export const getNews = async (req: any, res: Response) => {
  try {
    const currentTime = new Date().toISOString();
    const checkLatestFetch = await NewsFetchTimeModel.findOne({}).sort({ createdAt: -1 });
    const lastFetchTime = new Date(checkLatestFetch!.lastFetchTime).getTime();
    const currentTimeMillis = new Date(currentTime).getTime();

    // Fetching Limit
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!checkLatestFetch) {
      await NewsFetchTimeModel.create({
        lastFetch: new Date()
      });

      newsapi.v2.everything({
        q: 'death OR school-shootings OR funeral OR mass-shooting OR earth-quake OR celebrity-death',
        language: 'en',
      }).then(async (response: any) => {
        const status = response.status;
        if (status == "ok") {
          const totalResults = response.totalResults;
          const articles = response.articles;

          for (let i = 0; i < 50; i++) {
            await NewsModel.create({
              source: { id: articles[i].source.id || "", name: articles[i].source.name || "" },
              author: articles[i].author,
              title: articles[i].title,
              description: articles[i].description,
              url: articles[i].url,
              urlToImage: articles[i].urlToImage,
              publishedAt: articles[i].publishedAt,
              content: articles[i].content
            });
          }

          const total = await NewsModel.countDocuments();

          const news = await NewsModel.find({})
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

          res.status(200).json({
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit),
            news: news,
          });
        }
      });
    } else if (currentTimeMillis - lastFetchTime < 3600000) {

      // 24 Hours haven't passed since last fetch
      const news = await NewsModel.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await NewsModel.countDocuments();

      res.status(200).json({
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
        news: news,
      });
    } else {
      await NewsFetchTimeModel.create({
        lastFetch: new Date()
      });

      newsapi.v2.everything({
        q: 'death OR school-shootings OR funeral OR mass-shooting OR earth-quake OR celebrity-death',
        language: 'en',
      }).then(async (response: any) => {
        const status = response.status;
        if (status == "ok") {
          const totalResults = response.totalResults;
          const articles = response.articles;

          for (let i = 0; i < 50; i++) {
            await NewsModel.create({
              source: { id: articles[i].source.id || "", name: articles[i].source.name || "" },
              author: articles[i].author,
              title: articles[i].title,
              description: articles[i].description,
              url: articles[i].url,
              urlToImage: articles[i].urlToImage,
              publishedAt: articles[i].publishedAt,
              content: articles[i].content
            });
          }

          const news = await NewsModel.find({})
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
          const total = await NewsModel.countDocuments();

          res.status(200).json({
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit),
            news: news,
          });
        }
      });

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};