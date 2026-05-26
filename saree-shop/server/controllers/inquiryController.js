// Inquiry Controller
// Handles "Interested" leads - lightweight inquiry system
// No authentication required to submit (public endpoint)
// Admin-only endpoints for viewing and managing leads

import Inquiry from '../models/Inquiry.js';

/**
 * submitInquiry - PUBLIC endpoint to submit "Interested" inquiry
 * POST /api/inquiries
 * No authentication required
 * 
 * Body: {
 *   name: string (required),
 *   phone: string (required),
 *   email: string (optional),
 *   message: string (optional),
 *   productType: "saree" | "batch" (default: "saree"),
 *   productId: ObjectId (optional),
 *   source: "website" | "whatsapp" (default: "website")
 * }
 */
export const submitInquiry = async (req, res) => {
  try {
    const { name, phone, email, message, productType = 'saree', productId, source = 'website' } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required',
      });
    }

    // Check if phone already has recent inquiry (avoid duplicates)
    const recentInquiry = await Inquiry.findOne({
      phone: phone.trim(),
      createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) }, // Last 24 hours
    });

    if (recentInquiry) {
      return res.status(400).json({
        success: false,
        message: 'We already have your inquiry from today. Our team will contact you soon!',
      });
    }

    // Create new inquiry
    const inquiry = new Inquiry({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      message: message?.trim(),
      productType,
      productId,
      source,
    });

    await inquiry.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! We received your interest. Our team will contact you soon.',
      inquiryId: inquiry._id,
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * getInquiries - ADMIN ONLY endpoint to view all inquiries
 * GET /api/inquiries
 * Query params:
 *   - status: filter by status (new, contacted, interested, converted, archived)
 *   - page: pagination (default: 1)
 *   - limit: items per page (default: 20)
 *   - search: search by name or phone
 */
export const getInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch inquiries
    const inquiries = await Inquiry.find(filter)
      .populate('productId')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    // Get total count
    const total = await Inquiry.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: inquiries,
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * getInquiryById - ADMIN ONLY endpoint to view single inquiry details
 * GET /api/inquiries/:id
 */
export const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await Inquiry.findById(id).populate('productId');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * updateInquiry - ADMIN ONLY endpoint to update inquiry status
 * PUT /api/inquiries/:id
 * 
 * Body: {
 *   status: "new" | "contacted" | "interested" | "converted" | "archived",
 *   notes: string (admin notes)
 * }
 */
export const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, contactedAt, convertedAt } = req.body;

    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Update fields
    if (status) inquiry.status = status;
    if (notes !== undefined) inquiry.notes = notes;
    if (contactedAt) inquiry.contactedAt = contactedAt;
    if (convertedAt) inquiry.convertedAt = convertedAt;

    await inquiry.save();

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully',
      data: inquiry,
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * deleteInquiry - ADMIN ONLY endpoint to delete inquiry
 * DELETE /api/inquiries/:id
 */
export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await Inquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * getInquiryStats - ADMIN ONLY endpoint for inquiry analytics
 * GET /api/inquiries/stats/dashboard
 * Returns: count by status, total inquiries, conversion rate
 */
export const getInquiryStats = async (req, res) => {
  try {
    const stats = await Inquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const converted = stats.find(s => s._id === 'converted')?.count || 0;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        converted,
        conversionRate: parseFloat(conversionRate),
        byStatus: stats,
      },
    });
  } catch (error) {
    console.error('Error fetching inquiry stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
