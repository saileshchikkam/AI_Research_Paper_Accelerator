import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'professor' | 'researcher' | 'engineer';
  avatar?: string;
  enrolledAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: { 
      type: String, 
      enum: ['student', 'professor', 'researcher', 'engineer'], 
      default: 'student' 
    },
    avatar: { type: String },
    enrolledAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

// Pre-save hook to hash password
UserSchema.pre('save', async function (this: any, next: any) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (this: any, password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);
