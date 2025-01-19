const Product = require('../db/models/Product');
const Category = require('../db/models/Category');

exports.getProducts = async (req, res) => {
    
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const searchString = req.query.search || '';
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;


    const search = searchString ? { 
        $or:[
            { name: { $regex: searchString, $options: 'i' } },
            { desc: { $regex: searchString, $options: 'i' } },
            ...(isNaN(parseInt(searchString))?[]:[{price: {$eq:parseInt(searchString)}}])
        ]
     } : {};

    try {
        let categoryFilter = {};
        if (req.query.category) {
            const category = await Category.findOne({
                name: req.query.category,
            });
            if (category) {
                categoryFilter = { category: category._id };
            } else {
                return res.status(404).json({ error: 'Category not found' });
            }
        }

        const filters = { ...search, ...categoryFilter };

        const products = await Product.find(filters)
            .populate({ path: 'category', select: 'name -_id' })
            .sort({ [sortBy]: sortOrder })
            .skip(offset)
            .limit(limit);
 
        const totalProducts = await Product.countDocuments(filters);

        return res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            products: products,
        });
    } catch (err) {
        console.error('ERROR fetching products: ', err);
        return res.status(500).json({ error: 'Error fetching products' });
    }
};

exports.getSingleProduct = async (req, res) => {

    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            return res.status(200).json(product);
        } else {
            return res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        console.error('ERROR fetching product: ', err);
        return res.status(500).json({ error: 'Error fetching product' });
    }
};

exports.addProduct = async (req, res) => {
    const { name, desc, price, image, category, isFeatured, ingredients, isVegetarian, isGlutenFree, isAvailable } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const productExists = await Product.findOne({ name });
        if (productExists) {
            return res.status(400).json({ error: 'Product already exists' });
        }

        const newProduct = new Product({
            name,
            desc,
            price,
            image,
            category,
            isFeatured,
            ingredients,
            isVegetarian,
            isGlutenFree,
            isAvailable,
        });

        await newProduct.save();
        return res.status(201).json({ message: 'Product added successfully' });
    } catch (e) {
        return res.status(500).json({ error: 'An error occurred, Customer NOT saved, details: '+e});
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        desc,
        price,
        image,
        category,
        isFeatured,
        ingredients,
        isVegetarian,
        isGlutenFree,
        isAvailable,
    } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing product ID in request params' });
    if (!name && !desc && !price && !image && !category && !ingredients &&
        isFeatured === undefined && isVegetarian === undefined &&
        isGlutenFree === undefined && isAvailable === undefined) {
        return res.status(422).json({ error: 'No fields provided for update' });
    }

    try {
        
        const updateFields = {};
        if (name) updateFields.name = name;
        if (desc) updateFields.desc = desc;
        if (price) updateFields.price = price;
        if (image) updateFields.image = image;
        if (category) updateFields.category = category;
        if (ingredients) updateFields.ingredients = ingredients;
        if (typeof isFeatured !== 'undefined') updateFields.isFeatured = isFeatured;
        if (typeof isVegetarian !== 'undefined') updateFields.isVegetarian = isVegetarian;
        if (typeof isGlutenFree !== 'undefined') updateFields.isGlutenFree = isGlutenFree;
        if (typeof isAvailable !== 'undefined') updateFields.isAvailable = isAvailable;

      
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true } 
        );

        if (updatedProduct) {
            return res.status(200).json({ message: 'Product updated successfully', updatedProduct });
        } else {
            return res.status(404).json({ error: 'Product with this ID not found' });
        }
    } catch (e) {
        console.error('Error updating product:', e.message);
        return res.status(500).json({ error: 'Error updating product, details: ' + e.message });
    }
};


exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (deletedProduct) {
            return res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            return res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        console.error('ERROR deleting product: ', err);
        return res.status(500).json({ error: 'Error deleting product' });
    }
};
