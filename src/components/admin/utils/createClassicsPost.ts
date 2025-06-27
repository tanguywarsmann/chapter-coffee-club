
import { createClassicsArticle } from '../../../scripts/addBlogPost';

export const addClassicsPostToDB = async () => {
  try {
    const post = await createClassicsArticle();
    console.log('Article "10 classiques à lire pour renouer doucement avec la lecture" ajouté avec succès');
    return post;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'article:', error);
    throw error;
  }
};
