const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// Find all tags including its associated Product data
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({ include: [{ model: Product }] });

    // Checks if the tags array is empty
    if (tags.length === 0) {
      return res.status(404).json({ message: 'No tags found.' });
    }

    return res.status(200).json(tags);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// Find a single tag by its `id` including its associated Product data
router.get('/:id', async (req, res) => {
  try {
    const tagId = Number(req.params.id);
    const tagData = await Tag.findByPk(tagId, {
      include: [{ model: Product }],
    });

    // Checks if tagData is null or undefined
    if (!tagData) {
      return res.status(404).json({ message: 'No tags found with that id.' });
    }

    // Returns the tag data as a plain object
    const tag = tagData.get({ plain: true });
    return res.status(200).json(tag);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// create a new tag
router.post('/', async (req, res) => {
  try {
    const { tag_name } = req.body;

    // Checks if tag_name is a string and exists
    if (typeof tag_name !== 'string' || tag_name.trim().length === 0) {
      return res.status(400).json({ message: 'Tag name is invalid.' });
    }

    // Creates a new tag
    await Tag.create({ tag_name });
    return res.status(200).json({
      message: `The tag ${tag_name} was created successfully.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
});

// delete on tag by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const tagId = Number(req.params.id);
    const deletedTag = await Tag.destroy({ where: { id: tagId } });

    // Checks if deletedTag is 0
    if (deletedTag === 0) {
      return res.status(404).json({ message: 'No tag found with that id.' });
    }

    return res.status(200).json({ message: 'Tag deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
