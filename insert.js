const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/restaurant';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    }
})

const Categories = mongoose.model("Category", categorySchema)

const menuItemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    ingridiens: [{ type: String }],
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isGlutenFree: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const MenuItems = new mongoose.model("MenuItem", menuItemsSchema)

// const categories = [{
//     name: "Drinks",
//     description: "Drinks",
//     image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
// },
// {
//     name: "Dinners",
//     description: "Dinners",
//     image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
// },
// {
//     name: "Desserts",
//     description: "Desserts",
//     image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
// }]



async function start() {
    await mongoose.connect(url);
    //await Categories.insertMany(categories);
    const dinners = await Categories.findOne({ name: "Dinners" });
    const drinks = await Categories.findOne({ name: "Drinks" });
    const items = [{
        name: "Kebab",
        desc: "Kebab",
        price: 20,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        category: dinners._id,
        isVegetarian: false,
        isGlutenFree: false,
        isAvailable: true,
        createdAt: new Date()
    },
    {
        name: "Cola",
        desc: "Cola",
        price: 10,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        category: drinks._id,
        isVegetarian: false,
        isGlutenFree: false,
        isAvailable: true,
        createdAt: new Date()
    }]
    await MenuItems.insertMany(items);
    const item = await MenuItems.find({ name: "Cola" }).populate({ path: "category", select: "-_id" });
    console.log(item);
    mongoose.disconnect();
}

start();