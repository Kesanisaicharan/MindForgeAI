import mongoose from 'mongoose';
import 'dotenv/config';

async function deepFix() {
    try {
        const uri = process.env.MONGO_URI;
        console.log("CONNECTING...");
        await mongoose.connect(uri);
        console.log("CONNECTED TO:", mongoose.connection.name);
        
        const collection = mongoose.connection.db.collection('certificates');
        
        console.log("LISTING INDEXES:");
        const indexes = await collection.indexes();
        console.log(JSON.stringify(indexes, null, 2));
        
        try {
            console.log("DROPPING ALL INDEXES...");
            await collection.dropIndexes();
            console.log("ALL INDEXES DROPPED");
        } catch (e) {
            console.log("ERROR DROPPING INDEXES:", e.message);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

deepFix();
