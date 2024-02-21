import axios from 'axios';


export const checkComment = async (comment: string): Promise<boolean> => {
  try {
    const apiKey = 'YOUR_API_KEY';
    const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;

    const response = await axios.post(url, {
      comment: { text: comment },
      languages: ['en'],
      requestedAttributes: { TOXICITY: {} }
    });

    const toxicityScore = response.data.attributeScores.TOXICITY.summaryScore.value;
    
    const threshold = 0.7;

    return toxicityScore > threshold;
  } catch (error) {
    console.error('Error checking comment:', error);
    return false; 
  }
};
