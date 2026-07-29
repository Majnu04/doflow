import mongoose from 'mongoose';

const roadmapSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const RoadmapSection = mongoose.model('RoadmapSection', roadmapSectionSchema);

export default RoadmapSection;
