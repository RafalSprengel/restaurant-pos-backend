const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/restaurant';


async function start() {
    await mongoose.connect(url)
    const userShema = new mongoose.Schema({
        firstName: String,
        LastName: String
    });

    const User = mongoose.model("User", userShema);

    await User.deleteMany({});

    const user1 = new User({
        firstName: "Marian",
        LastName: "Kowalski"
    });

    await user1.save();
    mongoose.disconnect()
}

start()


