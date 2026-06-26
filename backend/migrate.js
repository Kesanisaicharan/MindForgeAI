import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

import Certificate from './models/Certificate.model.js';

async function migrate() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindforge';
        await mongoose.connect(uri);
        console.log("CONNECTED TO DB");
        
        const certs = await Certificate.find({ 
            $or: [
                { certificateId: { $exists: false } },
                { certificateId: null }
            ]
        });
        
        console.log(`Found ${certs.length} certificates to migrate.`);
        
        for (const cert of certs) {
            cert.certificateId = uuidv4();
            await cert.save();
            console.log(`Migrated cert ${cert._id} with title: ${cert.courseTitle}`);
        }
        
        console.log("MIGRATION COMPLETE");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
