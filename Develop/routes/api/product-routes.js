const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// GET all products
router.get('/', async (req, res) => {
  try {
    // Get all products and includes its associated Category and Tag data
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    // Checks if products array is empty or null
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found.' });
    }

    return res.status(200).json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// GET one product
router.get('/:id', async (req, res) => {
  try {
    // Gets a single product by its `id` including its associated Category and Tag data
    const productId = Number(req.params.id);
    const productData = await Product.findByPk(productId, {
      include: [{ model: Category }, { model: Tag }],
    });

    // Checks if productData is null or undefined
    if (!productData) {
      return res
        .status(404)
        .json({ message: 'No products found with that id.' });
    }

    const product = productData.get({ plain: true });
    return res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const { product_name, price, stock, tagIds } = req.body;

    // Create the product first
    const newProduct = await Product.create({
      product_name,
      price,
      stock,
    });

    // If there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    // Respond with the new product information, regardless of whether tags were added
    const resultProduct = await Product.findOne({
      where: { id: newProduct.id },
      include: [{ model: Category }, { model: Tag }],
    });

    return res.status(200).json(resultProduct);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { product_name, price, stock, tagIds } = req.body;

    // Validate inputs
    if (
      !productId ||
      !product_name ||
      !price ||
      !stock ||
      !Array.isArray(tagIds)
    ) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    // Update the product first
    const updatedCount = await Product.update(
      {
        product_name,
        price,
        stock,
      },
      {
        where: {
          id: productId,
        },
      }
    );

    // Checks if updatedCount is 0
    if (updatedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({
      where: { product_id: productId },
    });

    // Get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    // Create filtered list of new tag_ids
    const newProductTags = tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: productId,
          tag_id,
        };
      });

    // Figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !tagIds.includes(tag_id))
      .map(({ id }) => id);

    // Run both actions
    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    // Respond with the updated product information
    const resultProduct = await Product.findOne({
      where: { id: productId },
      include: [{ model: Category }, { model: Tag }],
    });

    return res.status(200).json(resultProduct);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productId = req.params.id;
    const deletedCount = await Product.destroy({
      where: {
        id: productId,
      },
    });

    // Checks if deletedCount is 0
    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: 'No product found with that id.' });
    }

    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
