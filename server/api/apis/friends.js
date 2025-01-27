/**
 * FRIENDS API WILL BE USED AFTER BETA.
 */

export const createFriends = async (req, res) => {
  /** TODO: Implement this.
   * 
   * This function is used to create friends in the database.
   * 
   * Parameters:
   * - group_id
   * - passcode
   * - friends: [{friend_name}]
   * 
   * Requirements:
   * 1. check if group_id exists in database.
   * 2. validate hashed passcode with the one in the database.
   * 3. create friends with empty friend_url in the database.
   * 4. return the new friends with its friend_id.
   */

  return res.status(200).json({
    status: 'success',
    message: 'Friends created successfully',
    friends: [{ friend_id: 1, friend_name: 'John Doe', friend_url: '' }],
  });
};

export const editFriend = async (req, res) => {
  /** TODO: Implement this.
   * 
   * This function is used to edit a single friend in the database.
   * 
   * Parameters:
   * - group_id
   * - passcode
   * - friend_id
   * - friend_name
   * - friend_url
   * 
   * Requirements:
   * 1. check if group_id exists in database.
   * 2. validate hashed passcode with the one in the database.
   * 3. update the friend in the database.
   * 4. return the updated friend.
   */

  return res.status(200).json({
    status: 'success',
    message: 'Friend edited successfully',
    friend_id: 1,
  });
}

export const deleteFriend = async (req, res) => {
  /** TODO: Implement this.
   * 
   * This function is used to delete a single friend in the database.
   * 
   * Parameters:
   * - group_id
   * - passcode
   * - friend_id
   * 
   * Requirements:
   * 1. check if group_id exists in database.
   * 2. validate hashed passcode with the one in the database.
   * 3. remove the friend from all ml_tagged rows.
   * 3. delete the friend in the database.
   * 5. return the deleted friend.
   */

  return res.status(200).json({
    status: 'success',
    message: 'Friend deleted successfully',
    friend_id: 1,
  });
}
