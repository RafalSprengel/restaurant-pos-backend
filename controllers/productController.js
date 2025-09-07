const Product = require('../db/models/Product');
const Category = require('../db/models/Category');
const fs = require('fs').promises
const path = require('path')

exports.getProducts = async (req, res) => {

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const searchString = req.query.search || '';
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;


    const search = searchString ? {
        $or: [
            { name: { $regex: searchString, $options: 'i' } },
            { desc: { $regex: searchString, $options: 'i' } },
            ...(isNaN(parseInt(searchString)) ? [] : [{ price: { $eq: parseInt(searchString) } }])
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
    const { name, desc, price, category, isFeatured, ingredients, isVegetarian, isGlutenFree, isAvailable } = req.body;
    if (!name || !price || !category) return res.status(400).json({ error: 'All required fields must be provided' });

    try {
        const productExists = await Product.findOne({ name });
        if (productExists) return res.status(400).json({ error: 'Product already exists' });

        const newProduct = new Product({
            name,
            desc,
            price,
            category,
            isFeatured,
            ingredients: ingredients ? ingredients.split(',').map(i => i.trim()) : [],
            isVegetarian,
            isGlutenFree,
            isAvailable,
            image: req.file ? `/api/uploads/products/${req.file.filename}` : '',
            thumbnail: req.file && req.file.thumbnail ? `/api/uploads/products/${req.file.thumbnail}` : '',

        });

        await newProduct.save();
        return res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (e) {
        return res.status(500).json({ error: 'Error adding product: ' + e.message });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
        updateData.image = '/api/uploads/products/' + req.file.filename;
        if (req.file.thumbnail) {
            updateData.thumbnail = req.file.thumbnail;
        }
    }

    console.log('Update data:', updateData);

    try {
        const oldProduct = await Product.findById(id);
        if (!oldProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (req.file) {
            const filesToDelete = [];
            if (oldProduct.image) {
                filesToDelete.push(path.join(__dirname, '../public/uploads/products', path.basename(oldProduct.image)));
            }
            if (oldProduct.thumbnail) {
                filesToDelete.push(path.join(__dirname, '../public/uploads/products', path.basename(oldProduct.thumbnail)));
            }

            for (const filePath of filesToDelete) {
                try {
                    await fs.unlink(filePath);
                } catch (err) {
                    console.warn(`Could not delete old file ${filePath}:`, err.message);
                }
            }
        }

        return res.status(200).json(updatedProduct);
    } catch (err) {
        console.error('ERROR updating product:', err);
        return res.status(500).json({ error: 'Error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const filesToDelete = [];
        if (deletedProduct.image) {
            const filename = path.basename(deletedProduct.image);
            filesToDelete.push(path.join(__dirname, '../public/uploads/products', filename));
        }
        if (deletedProduct.thumbnail) {
            const thumbFilename = path.basename(deletedProduct.thumbnail);
            filesToDelete.push(path.join(__dirname, '../public/uploads/products', thumbFilename));
        }

        for (const filePath of filesToDelete) {
            try {
                await fs.unlink(filePath);
            } catch (err) {
                console.warn(`Could not delete file ${filePath}:`, err.message);
            }
        }

        return res.status(200).json({ message: 'Product and images deleted successfully' });
    } catch (err) {
        console.error('ERROR deleting product:', err);
        return res.status(500).json({ error: 'Error deleting product' });
    }
};

