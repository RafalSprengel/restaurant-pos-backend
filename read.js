const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/restaurant';


async function start() {
    await mongoose.connect(url);

    const userShema = new mongoose.Schema({});
    const User = mongoose.model("User", userShema);

    const user = await User.find({ firstName: "Marian" });
    console.log(user);
    mongoose.disconnect();
}

start();