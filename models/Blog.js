const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String, // image URL or path
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
