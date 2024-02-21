
const { Translate } = require('@google-cloud/translate').v2;


const translate = new Translate();


async function translateComment(comment: string, targetLanguage: string) {
  try {
   
    const [translation] = await translate.translate(comment, targetLanguage);

    
    return translation;
  } catch (error) {
    console.error('Error translating comment:', error);
    throw error;
  }
}


const comment = 'this is comment testing'; 
const targetLanguage = 'amh'; 
translateComment(comment, targetLanguage)
  .then((translatedComment) => {
    console.log('Translated comment:', translatedComment);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
