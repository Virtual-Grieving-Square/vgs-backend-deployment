import { google } from "googleapis";
import config from "../config";
import axios from "axios";
import Filter from "bad-words";
import { profaneModel } from "../model/profanewords";

interface ToneResult {
  score: number;
  tone: string;
  emoji: string;
}

interface ToneResponse {
  overall: ToneResult[];
  results: ToneResult[][];
  sents: string[];
}

interface PerspectiveAPIClient {
  comments: {
    analyze: (params: {
      key: string;
      resource: {
        comment: {
          text: string;
        };
        requestedAttributes: {
          [key: string]: {};
        };
      };
    }) => Promise<any>;
  };
}
export const checkComment = async (comment: string): Promise<boolean> => {
  try {
    const API_KEY: string = config.Google_API;
    const DISCOVERY_URL =
      "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";

    const client = (await google.discoverAPI(
      DISCOVERY_URL
    )) as PerspectiveAPIClient;

    const analyzeRequest = {
      comment: {
        text: comment,
      },
      requestedAttributes: {
        TOXICITY: {},
      },
    };

    const response = await client.comments.analyze({
      key: API_KEY,
      resource: analyzeRequest,
    });

    const toxicityScore =
      response.data.attributeScores.TOXICITY.summaryScore.value;

    const threshold = 0.6;

    console.log("score", toxicityScore);
    return toxicityScore > threshold;
  } catch (error) {
    console.error("Error checking comment:", error);
    return false;
  }
};

function countToxicEmotions(responseData: any): number {
  const toxicEmotions = ["annoyed", "disapproving", "angry"];
  var toxicEmotionCount = 0;
  for (const emotionData of responseData.overall) {
    const emotion = emotionData[1];
    if (toxicEmotions.includes(emotion)) {
      toxicEmotionCount++;
    }
  }
  return toxicEmotionCount;
}
export const checkCommentUsingSapling = async (
  comment: string
): Promise<boolean> => {
  try {
    const response = await axios.post("https://api.sapling.ai/api/v1/tone", {
      key: config.Samp_API,
      session_id: "test session",
      text: comment,
    });

    const { status, data } = response;
    console.log({ status });
    const numberOfToxicEmotions = countToxicEmotions(data);
    console.log("Level", numberOfToxicEmotions);

    if (numberOfToxicEmotions >= 2) {
      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    const { msg } = error.response.data;
    console.log(error);
    console.log({ err: msg });
    return false;
  }
};
export const checkCommentUsingBadwords = async (
  comment: string
): Promise<boolean> => {
  const filter = new Filter();

  const additionalProfaneWords = await profaneModel.find({}, 'word');


  additionalProfaneWords.forEach(({ word }) => filter.addWords(word));

  if (filter.isProfane(comment)) {
    return true;
  } else {
    return false;
  }
};


