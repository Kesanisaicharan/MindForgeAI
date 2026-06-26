import mongoose from 'mongoose';
import 'dotenv/config';

async function fixIndex() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindforge';
        await mongoose.connect(uri);
        console.log("CONNECTED TO DB");
        
        try {
            await mongoose.connection.db.collection('certificates').dropIndex('certificateId_1');
            console.log("DROPPED OLD INDEX");
        } catch (e) {
            console.log("INDEX NOT FOUND OR ALREADY DROPPED", e.message);
        }
        
        console.log("INDEX FIX COMPLETE");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixIndex();
