// Debug script to test Appwrite connection
import { Client, Account, Databases, ID, Permission, Role, Query } from 'appwrite';

const client = new Client();
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68988a580004812d1492');

const account = new Account(client);
const databases = new Databases(client);

async function testAppwriteConnection() {
    try {
        console.log('🔍 Testing Appwrite connection...');
        
        // Test 1: Check client configuration
        console.log('✅ Client configured with:');
        console.log('   Endpoint:', 'https://fra.cloud.appwrite.io/v1');
        console.log('   Project ID:', '68988a580004812d1492');
        
        // Test 2: Check if user is authenticated
        try {
            const user = await account.get();
            console.log('✅ User authenticated:', user.email);
            console.log('   User ID:', user.$id);
            
            // Test 3: Test database access
            console.log('🔍 Testing database access...');
            const response = await databases.listDocuments(
                '68988bb300312df8e19a', // Database ID
                '68989241003527949c57', // Collection ID
                []
            );
            console.log('✅ Database access successful');
            console.log('   Documents found:', response.documents.length);
            
            // Test 4: Try to create a test document
            console.log('🔍 Testing document creation...');
            const testDoc = await databases.createDocument(
                '68988bb300312df8e19a',
                '68989241003527949c57',
                ID.unique(),
                {
                    userId: user.$id,
                    recipeName: 'Test Recipe',
                    ingredients: ['test ingredient'],
                    instructions: ['test instruction'],
                    cookingTime: '10 mins',
                    difficulty: 'Easy',
                    imageUrl: '',
                    createdAt: new Date().toISOString()
                },
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.write(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            );
            console.log('✅ Test document created successfully:', testDoc.$id);
            
            // Clean up test document
            await databases.deleteDocument(
                '68988bb300312df8e19a',
                '68989241003527949c57',
                testDoc.$id
            );
            console.log('✅ Test document cleaned up');
            
        } catch (error) {
            console.log('❌ Authentication error:', error.message);
            console.log('   Please log in first');
        }
        
    } catch (error) {
        console.error('❌ Connection error:', error);
    }
}

// Run the test
testAppwriteConnection();
