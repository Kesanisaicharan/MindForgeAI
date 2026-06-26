import mongoose from 'mongoose';
import fs from 'fs';
import 'dotenv/config';

import Certificate from './models/Certificate.model.js';
import Course from './models/Course.model.js';

async function check() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindforge';
        await mongoose.connect(uri);
        const certs = await Certificate.find();
        const courses = await Course.find();
        const output = {
            total_certs: certs.length,
            total_courses: courses.length,
            certs: certs,
            courses: courses.map(c => ({ id: c._id, title: c.title, userId: c.userId }))
        };
        fs.writeFileSync('db_diagnostic.json', JSON.stringify(output, null, 2), 'utf8');
        console.log("DIAGNOSTIC COMPLETE");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
