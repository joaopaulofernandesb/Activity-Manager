
import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  type: string;
  cardId: string;
  startTime: Date;
  endTime: Date | null;
}

const activitySchema = new Schema<IActivity>({
  type: { type: String, required: true },
  cardId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, default: null },
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', activitySchema);
