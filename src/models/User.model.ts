import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '../types/roles';

// This interface allows TypeScript to enforce types on our documents
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  phone: string;
  // Instance method signature
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2. Define the User Schema
const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // 'select: false' ensures password is not returned by default queries
    role: { type: String, enum: Object.values(UserRole), default: UserRole.STUDENT },
    avatar: { type: String, default: 'default.jpg' },
    phone: { type: String, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    // Ensure password is automatically excluded from responses when converting to JSON
    toJSON: {
      transform: (doc, ret) => {
        // cast to any so TypeScript permits deleting the property
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// 3. Mongoose Pre-Save Hook (Password Hashing)
// Runs before a document is saved (on create() or save())
UserSchema.pre<IUser>('save', async function(next) {
  // Only hash the password if it is new or has been modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12 (standard for modern apps)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// 4. Instance Method for Password Comparison
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  // Use bcrypt to compare the plaintext password with the stored hash
  // 'this.password' here must be manually selected in the query (e.g., .select('+password'))
  return bcrypt.compare(candidatePassword, this.password);
};

// 5. Export the Model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;