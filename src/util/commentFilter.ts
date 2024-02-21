import { google} from 'googleapis';
import config from '../config';

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
    const DISCOVERY_URL = 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';

    
    const client = await google.discoverAPI(DISCOVERY_URL) as PerspectiveAPIClient;

    // Define the analyze request object
    const analyzeRequest = {
      comment: {
        text: comment,
      },
      requestedAttributes: {
        TOXICITY: {},
      },
    };

    // Call the analyze method of the comments endpoint
    const response = await client.comments.analyze({
      key: API_KEY,
      resource: analyzeRequest,
    });

    // Extract toxicity score from the response
    const toxicityScore = response.data.attributeScores.TOXICITY.summaryScore.value;

    // Define toxicity threshold
    const threshold = 0.6;

    console.log("score", toxicityScore);
    return toxicityScore > threshold;
  } catch (error) {
    console.error("Error checking comment:", error);
    return false;
  }
};




