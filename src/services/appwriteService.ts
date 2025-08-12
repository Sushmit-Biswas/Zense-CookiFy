import { Client, Account, Databases, ID, Permission, Role, Query } from 'appwrite';
import { type RecipeWithImage } from '../types';

class AppwriteService {
    client = new Client();
    account: Account;
    databases: Databases;

    constructor() {
        this.client
            .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
    }

    // Authentication methods
    async createAccount(email: string, password: string, name: string) {
        try {
            const userAccount = await this.account.create(ID.unique(), email, password, name);
            if (userAccount) {
                return this.login(email, password);
            } else {
                return userAccount;
            }
        } catch (error) {
            throw error;
        }
    }

    async login(email: string, password: string) {
        try {
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            return null;
        }
    }

    async logout() {
        try {
            await this.account.deleteSessions();
        } catch (error) {
            throw error;
        }
    }

    // Favorite recipes methods
    async saveFavoriteRecipe(recipe: RecipeWithImage, userId: string) {
        try {
            // Ensure imageUrl is a valid string and not too long
            let imageUrl = recipe.imageUrl || '';
            
            // If imageUrl is empty or too long, use a placeholder
            if (!imageUrl || imageUrl.length > 800) {
                imageUrl = `https://via.placeholder.com/400x300/f59e0b/ffffff?text=${encodeURIComponent(recipe.recipeName.substring(0, 20))}`;
            }
            
            return await this.databases.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'favorites', // Collection ID for favorites
                ID.unique(),
                {
                    userId,
                    recipeName: recipe.recipeName,
                    ingredients: recipe.ingredients,
                    instructions: recipe.instructions,
                    cookingTime: recipe.cookingTime,
                    difficulty: recipe.difficulty,
                    imageUrl: imageUrl,
                    createdAt: new Date().toISOString()
                },
                [
                    Permission.read(Role.user(userId)),
                    Permission.write(Role.user(userId)),
                    Permission.delete(Role.user(userId))
                ]
            );
        } catch (error) {
            console.error('Error saving favorite recipe:', error);
            throw error;
        }
    }

    async getFavoriteRecipes(userId: string): Promise<RecipeWithImage[]> {
        try {
            const response = await this.databases.listDocuments(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'favorites', // Collection ID for favorites
                [
                    Query.equal('userId', userId)
                ]
            );

            return response.documents.map(doc => ({
                recipeName: doc.recipeName,
                ingredients: doc.ingredients,
                instructions: doc.instructions,
                cookingTime: doc.cookingTime,
                difficulty: doc.difficulty,
                imageUrl: doc.imageUrl || `https://via.placeholder.com/400x300/f59e0b/ffffff?text=${encodeURIComponent(doc.recipeName.substring(0, 20))}`
            }));
        } catch (error) {
            console.error('Error fetching favorite recipes:', error);
            return [];
        }
    }

    async removeFavoriteRecipe(recipeId: string) {
        try {
            return await this.databases.deleteDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'favorites', // Collection ID for favorites
                recipeId
            );
        } catch (error) {
            throw error;
        }
    }

    async findFavoriteRecipe(recipeName: string, userId: string) {
        try {
            const response = await this.databases.listDocuments(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'favorites', // Collection ID for favorites
                [
                    Query.equal('userId', userId),
                    Query.equal('recipeName', recipeName)
                ]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Error finding favorite recipe:', error);
            return null;
        }
    }
}

const appwriteService = new AppwriteService();
export default appwriteService;
