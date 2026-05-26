// Cloudinary Configuration
// ============================================================================
// This file configures the Cloudinary cloud storage service for image uploads.
//
// WHY USE CLOUDINARY INSTEAD OF STORING IMAGES IN MONGODB?
//
// ❌ DON'T store images in MongoDB:
//    - Binary data makes documents very large
//    - Slows down database queries
//    - Increases storage costs
//    - Difficult to scale
//    - Poor performance
//
// ✅ DO use external cloud storage (Cloudinary):
//    - Images stored separately from database
//    - Fast CDN delivery (worldwide)
//    - Automatic optimization (resize, compress)
//    - Only store URLs in MongoDB (lightweight)
//    - Easy to scale and maintain
//    - Built-in security features
//
// ============================================================================

import cloudinary from 'cloudinary';

// Configure Cloudinary with API credentials from environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * deleteImageFromCloudinary - Deletes an image from Cloudinary by public_id
 * 
 * @param {string} publicId - The public_id of the image to delete
 *                           Example: "saree-products/abc123xyz"
 *                           This matches what was stored in MongoDB
 * 
 * @returns {Promise} Deletion result from Cloudinary API
 * 
 * WHEN IS THIS CALLED:
 * 1. Admin deletes a saree product
 *    - Called for each image in saree.images[]
 *    - Removes image from Cloudinary + MongoDB
 * 
 * 2. Saree update with image removal
 *    - Admin removes an image while editing
 *    - Calls deleteImageFromCloudinary() for removed images
 * 
 * 3. Error handling during create/update
 *    - If MongoDB save fails after Cloudinary upload
 *    - Cleanup handler calls this to prevent garbage accumulation
 * 
 * IMPORTANT - PUBLIC_ID STRUCTURE:
 * - When uploaded: multer returns file.filename = 'saree-products/xyz'
 * - Store in DB: { url, public_id: 'saree-products/xyz' }
 * - When deleting: pass the public_id to this function
 * - Cloudinary finds the image in saree-products folder and deletes it
 * 
 * EXAMPLE USAGE:
 * const saree = await Saree.findById(id);
 * for (let image of saree.images) {
 *   await deleteImageFromCloudinary(image.public_id);
 * }
 * 
 * ERROR HANDLING:
 * - If public_id doesn't exist: Cloudinary returns success anyway
 * - Network failure: throws error (should be caught and logged)
 * - Invalid credentials: throws error (check .env variables)
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    
    return await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.error(`✗ Error deleting image from Cloudinary: ${error.message}`);
    throw error;
  }
};

export default cloudinary;
