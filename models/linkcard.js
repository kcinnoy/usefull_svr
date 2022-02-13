import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema;

const showcaseSchema = new mongoose.Schema(
    {
    title: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 320,
        required: true,
      },
      slug: {
        type: String,
        lowercase: true,
      },
      content: {
        type: {},
        minlength: 200,
      },
      video: {},
      free_preview: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
);


const linkcardSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 320,
        required: true,
      },
      slug: {
        type: String,
        lowercase: true,
      },
      description: {
        type: {},
        minlength: 200,
        required: true,
      },
      price: {
        type: Number,
        default: 9.99,
      },
      image: {},
      category: String,
      published: {
        type: Boolean,
        default: false,
      },
      paid: {
        type: Boolean,
        default: true,
      },
      account: {
        type: ObjectId,
        ref: "User",
        required: true,
      },
      showcases: [showcaseSchema],
    },
    { timestamps: true }
);
export default mongoose.model('Linkcard',linkcardSchema)