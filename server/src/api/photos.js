import { rds } from '../utils/rds.js';
import { ml_group_lookup } from './groups.js';

export const createPhotoEntry = async (req, res) => {
  console.log("received request to upload photo");
  const { memory_id, photo_title, photo_date, photo_caption, photo_url } = req.body;
  if (!memory_id || !photo_url || !photo_title || !photo_date) {
    console.log("missing required fields");
    return res.status(400).json({ error: 'missing required fields.' });
  }

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }
  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const caption = photo_caption ? photo_caption : null;

  // Insert the photo entry into the database.
  const result = await rds.query(
    `INSERT INTO ml_photos (group_id, photo_url, photo_title, photo_date, photo_caption) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [group_id, photo_url, photo_title, photo_date, caption]
  );
  if (result.rowCount === 0) {
    console.log("failed to upload photo to database");
    return res.status(400).json({ error: 'Failed to upload photo to database.' });
  }

  res.status(200).json({
    message: 'Photo entry inserted successfully',
    photo_entry: {
      photo_id: result.rows[0].photo_id,
      photo_url: result.rows[0].photo_url,
      photo_title: result.rows[0].photo_title,
      photo_date: result.rows[0].photo_date,
      photo_caption: result.rows[0].photo_caption,
    },
  });
};


export const editPhotoEntry = async (req, res) => {
  const { memory_id, photo_id, photo_title, photo_date, photo_caption } = req.body;

  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }

  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  const update_result = await rds.query(
    `UPDATE ml_photos SET photo_title = $1, photo_date = $2, photo_caption = $3 WHERE photo_id = $4 AND group_id = $5 RETURNING *`,
    [photo_title, photo_date, photo_caption, photo_id, group_id]
  );

  if (update_result.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to update photo.' });
  }

  return res.status(200).json({
    message: 'Photo updated successfully.',
    updated_photo: update_result.rows[0]
  });
}


export const deletePhotoEntry = async (req, res) => {
  const { memory_id, photo_id } = req.body;

  if (!memory_id || !photo_id) {
    return res.status(400).json({ error: 'Memory lane and photo ID are required.' });
  }
  console.log(`Deleting photo with id: ${photo_id}`);
  const lookup_result = await ml_group_lookup(memory_id);
  if (lookup_result.rowCount === 0) {
    return res.status(400).json({ error: `Memory lane does not exist for ${memory_id}.` });
  }
  const group_lookup = lookup_result.rows[0];
  const group_id = group_lookup.group_id;

  // Delete the photo
  const deleteResult = await rds.query(
    `DELETE FROM ml_photos WHERE photo_id = $1 AND group_id = $2 RETURNING *`,
    [photo_id, group_id]
  );

  if (deleteResult.rowCount === 0) {
    return res.status(400).json({ error: 'Failed to delete photo.' });
  }

  // Step 4: Return the deleted photo
  return res.status(200).json({
    message: 'Photo deleted successfully.',
    deleted_photo: deleteResult.rows[0],
  });
};
