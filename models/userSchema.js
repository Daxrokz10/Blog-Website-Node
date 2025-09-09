const { default: mongoose } = require("mongoose");

const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

        // profile
    experienceLevel: { type: String, default: "" },
    favoriteArtists: { type: [String], default: [] },
    software: { type: String, default: "" },
    favoriteGenre: { type: String, default: "" },
    preferredMood: { type: String, default: "" },
    city: { type: String, default: "" },
    availability: { type: Boolean, default: false },
    badges: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    bio: { type: String, default: "" }
});

const User = mongoose.model('user',userSchema);

module.exports = User;