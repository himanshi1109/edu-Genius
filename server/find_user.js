import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function findUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }));
    const student = await User.findOne({ role: 'student' });
    console.log('Found Student:', student);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findUser();
