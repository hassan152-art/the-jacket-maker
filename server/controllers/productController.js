import { DataStore } from '../data/dataStore.js';

// @desc    Fetch all products with query filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, subCategory, search, sort, minPrice, maxPrice, featured, bestSeller } = req.query;
    const products = await DataStore.getProducts({
      category,
      subCategory,
      search,
      sort,
      minPrice,
      maxPrice,
      featured,
      bestSeller
    });
    return res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Error retrieving catalog products' });
  }
};

// @desc    Fetch single product by slug or id
// @route   GET /api/products/:identifier
// @access  Public
export const getProductByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    let product = await DataStore.getProductBySlug(identifier);
    if (!product) {
      product = await DataStore.getProductById(identifier);
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found in atelier catalog' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Error retrieving product details' });
  }
};

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const product = await DataStore.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(400).json({ message: 'Failed to create product item' });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const updated = await DataStore.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update product details' });
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await DataStore.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ message: 'Product successfully removed from atelier catalog' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product' });
  }
};
