const NewsAPI = require('newsapi');

const NewApiEnv = process.env.NEWS_API_KEY;
const newsapi = new NewsAPI(NewApiEnv);

export const fetchNews = async () => {
  try {
    newsapi.v2.everything({
      q: 'death OR school-shootings OR funeral OR mass-shooting OR earth-quake OR celebrity-death',
      language: 'en',
    }).then((response: any) => {
      const status = response.status;
      console.log(status, response.totalResults);
      // if (status == "ok") {
      return response;
      // }
    });
    // return [{
    //   status: false,
    //   message: "news-fetched",
    //   totalResults: 0,
    //   articles: []
    // }];
  } catch (error) {
    console.error(error);
    return [{ status: false, message: "error-fetching-message" }];
  }
}