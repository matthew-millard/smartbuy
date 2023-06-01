const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// Finds all categories including associations
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product }],
    });
    // Checks if the categories array is empty
    if (categories.length === 0) {
      res.status(404).json({ message: 'No categories found.' });
      return;
    }

    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Finds a single category and its associated Products by its 'id' value
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findByPk(categoryId, {
      include: [{ model: Product }],
    });
    // Checks if category is null
    if (!category) {
      res.status(404).json({
        message: `No categories were found with the id: ${categoryId}`,
      });
      return;
    }

    res.status(200).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// create a new category
router.post('/', async (req, res) => {
  try {
    const { category_name } = req.body;

    // Checks if category_name is a string and exists
    if (
      typeof category_name !== 'string' ||
      category_name.trim().length === 0
    ) {
      res.status(400).json({ message: 'Invalid category name.' });
      return;
    }
    await Category.create({ category_name });
    res.status(200).json({
      message: `The category ${category_name} was created successfully.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// update a category by its `id` value
router.put('/:id', async (req, res) => {
  try {
    const { category_name } = req.body;
    const categoryId = Number(req.params.id);

    if (
      typeof category_name !== 'string' ||
      category_name.trim().length === 0 ||
      isNaN(categoryId)
    ) {
      res.status(400).json({ message: 'Invalid category name or id.' });
      return;
    }
    const affectedRows = await Category.update(
      { category_name },
      {
        where: {
          id: categoryId,
        },
      }
    );

    if (affectedRows[0] === 0) {
      res
        .status(404)
        .json({ message: `No category found with the id: ${categoryId}.` });
      return;
    }

    // Get update category
    const updatedCategory = await Category.findByPk(categoryId);

    res.status(200).json({
      message: `${affectedRows[0]} row has been successfully updated.`,
      category: updatedCategory, // Display updated category to user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a category by its 'id' value
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    // Checks if categoryId is a number
    if (isNaN(categoryId)) {
      res.status(400).json({ message: 'Invalid category id.' });
      return;
    }
    const deletedRows = await Category.destroy({ where: { id: categoryId } });

    if (deletedRows === 0) {
      res
        .status(404)
        .json({ message: `No category found with the id: ${categoryId}` });
      return;
    }

    res
      .status(200)
      .json({ message: `Category with id: ${categoryId} was deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
