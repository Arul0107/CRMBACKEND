// quotationController.js
const Quotation = require('../models/Quotation');
const Business = require('../models/BusinessAccount'); // Ensure BusinessAccount is imported if used by getActiveBusinesses

// Helper function to format currency (for internal use if needed, but not directly for saving)
const formatCurrency = (amount) => {
  return parseFloat(Number(amount || 0).toFixed(2));
};

// Helper function to calculate sub-total
const calculateSubTotal = (items) => {
  return items.reduce((sum, i) => sum + (i.quantity || 0) * (i.rate || 0), 0);
};

// Helper function to calculate GST breakdown
const calculateTotalGst = (items, gstType) => {
  let totalCalculatedGst = items.reduce((sum, i) => {
    const itemTotal = (i.quantity || 0) * (i.rate || 0);
    const gstRate = (i.gstPercentage || 0) / 100; // Convert percentage to decimal
    return sum + itemTotal * gstRate;
  }, 0);

  let sgst = 0;
  let cgst = 0;
  let igst = 0;

  if (gstType === "intrastate") {
    sgst = totalCalculatedGst / 2;
    cgst = totalCalculatedGst / 2;
  } else if (gstType === "interstate") {
    igst = totalCalculatedGst;
  }

  return {
    totalGst: formatCurrency(totalCalculatedGst),
    sgst: formatCurrency(sgst),
    cgst: formatCurrency(cgst),
    igst: formatCurrency(igst),
  };
};

// Helper function to calculate the final total, applying manual overrides
const calculateTotal = (subTotal, gstBreakdown, gstType, manualGstAmount, manualSgstPercentage, manualCgstPercentage) => {
  let taxToUse = 0;

  if (manualGstAmount !== null && manualGstAmount !== undefined) {
      // If overall manual total GST (absolute amount) is set, use it directly (highest precedence)
      taxToUse = manualGstAmount;
  } else if (gstType === "intrastate" && (manualSgstPercentage !== null || manualCgstPercentage !== null)) {
      // If intrastate and manual SGST/CGST percentages are set, calculate their absolute values
      const manualSgstValue = manualSgstPercentage !== null && manualSgstPercentage !== undefined ? (subTotal * (manualSgstPercentage / 100)) : gstBreakdown.sgst;
      const manualCgstValue = manualCgstPercentage !== null && manualCgstPercentage !== undefined ? (subTotal * (manualCgstPercentage / 100)) : gstBreakdown.cgst;
      taxToUse = manualSgstValue + manualCgstValue;
  } else {
      // Otherwise, use the automatically calculated total GST
      taxToUse = gstBreakdown.totalGst;
  }

  return formatCurrency(subTotal + taxToUse);
};


// GET all quotations
exports.getAll = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate('businessId', 'contactName email phone address gstin mobileNumber businessName')
      .populate('followUps.addedBy', 'name email') // Ensure addedBy in followUps is populated
      .sort({ createdAt: -1 });
    res.json(quotations);
  } catch (err) {
    console.error("Error fetching all quotations:", err);
    res.status(500).json({ error: 'Failed to fetch quotations. Please try again later.' });
  }
};

// POST create a quotation with auto-generated quotation number
exports.create = async (req, res) => {
  try {
    const lastQuotation = await Quotation.findOne().sort({ createdAt: -1 });
    let nextNumber = "Q-0001";

    if (lastQuotation && lastQuotation.quotationNumber) {
      const lastNumber = parseInt(lastQuotation.quotationNumber.split('-')[1], 10);
      const newNumber = lastNumber + 1;
      nextNumber = `Q-${String(newNumber).padStart(4, '0')}`;
    }

    // Extract necessary fields for calculation from req.body
    const { items, gstType, manualGstAmount, manualSgstPercentage, manualCgstPercentage, ...otherFields } = req.body;

    // Perform calculations on the backend
    const subTotal = calculateSubTotal(items);
    const gstBreakdown = calculateTotalGst(items, gstType);
    const total = calculateTotal(subTotal, gstBreakdown, gstType, manualGstAmount, manualSgstPercentage, manualCgstPercentage);

    // Construct the gstDetails object to save
    const gstDetails = {
      sgst: gstBreakdown.sgst,
      cgst: gstBreakdown.cgst,
      igst: gstBreakdown.igst,
      calculatedTotalGst: gstBreakdown.totalGst,
      manualGstAmount: manualGstAmount !== undefined ? manualGstAmount : null,
      manualSgstPercentage: manualSgstPercentage !== undefined ? manualSgstPercentage : null,
      manualCgstPercentage: manualCgstPercentage !== undefined ? manualCgstPercentage : null,
      finalTaxAmountUsed: formatCurrency(total - subTotal), // The actual tax amount used in final total
    };

    const newQuotation = new Quotation({
      ...otherFields,
      quotationNumber: nextNumber,
      items, // Include items
      subTotal: formatCurrency(subTotal),
      tax: gstDetails.finalTaxAmountUsed, // Store the final tax amount used
      total: formatCurrency(total),
      gstType,
      gstDetails, // Store the detailed GST breakdown
    });

    const saved = await newQuotation.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      console.error("Duplicate quotation number attempt or race condition:", err);
      return res.status(409).json({ error: 'A quotation with this number was just created. Please try generating a new one or refresh.' });
    }
    console.error("Error creating quotation:", err);
    res.status(400).json({ error: 'Failed to create quotation. Please check your input and try again.' });
  }
};

// PUT update a quotation (handles partial updates, especially for notes)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Contains the fields sent from the frontend

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found.' });
    }

    // 1. Handle notes update specifically if present
    if (updateData.notes !== undefined) {
      quotation.notes = updateData.notes;
    }

    // 2. Conditionally update and recalculate other fields if 'items' or GST-related fields are provided
    // This ensures that only relevant calculations happen and existing data is not overwritten
    if (updateData.items !== undefined || updateData.gstType !== undefined ||
        updateData.manualGstAmount !== undefined || updateData.manualSgstPercentage !== undefined ||
        updateData.manualCgstPercentage !== undefined) {

      // Use updateData's values if present, otherwise use existing quotation values for calculation
      const currentItems = updateData.items !== undefined ? updateData.items : quotation.items;
      const currentGstType = updateData.gstType !== undefined ? updateData.gstType : quotation.gstType;
      const currentManualGstAmount = updateData.manualGstAmount !== undefined ? updateData.manualGstAmount : quotation.gstDetails?.manualGstAmount;
      const currentManualSgstPercentage = updateData.manualSgstPercentage !== undefined ? updateData.manualSgstPercentage : quotation.gstDetails?.manualSgstPercentage;
      const currentManualCgstPercentage = updateData.manualCgstPercentage !== undefined ? updateData.manualCgstPercentage : quotation.gstDetails?.manualCgstPercentage;

      const subTotal = calculateSubTotal(currentItems);
      const gstBreakdown = calculateTotalGst(currentItems, currentGstType);
      const total = calculateTotal(subTotal, gstBreakdown, currentGstType, currentManualGstAmount, currentManualSgstPercentage, currentManualCgstPercentage);

      // Construct the updated gstDetails object
      const newGstDetails = {
        sgst: gstBreakdown.sgst,
        cgst: gstBreakdown.cgst,
        igst: gstBreakdown.igst,
        calculatedTotalGst: gstBreakdown.totalGst,
        manualGstAmount: currentManualGstAmount,
        manualSgstPercentage: currentManualSgstPercentage,
        manualCgstPercentage: currentManualCgstPercentage,
        finalTaxAmountUsed: formatCurrency(total - subTotal),
      };

      // Apply the calculated and updated values to the quotation object
      quotation.items = currentItems;
      quotation.subTotal = formatCurrency(subTotal);
      quotation.gstType = currentGstType;
      quotation.tax = newGstDetails.finalTaxAmountUsed;
      quotation.total = formatCurrency(total);
      quotation.gstDetails = newGstDetails;
    }

    // 3. Update any other fields present in updateData that are not explicitly handled above
    // This loop ensures that only provided fields are updated, preserving existing data
    for (const key in updateData) {
      if (updateData.hasOwnProperty(key) &&
          key !== 'notes' && // Handled above
          key !== 'items' && // Handled above in calculation block
          key !== 'gstType' && // Handled above in calculation block
          key !== 'manualGstAmount' && // Handled above in calculation block
          key !== 'manualSgstPercentage' && // Handled above in calculation block
          key !== 'manualCgstPercentage' && // Handled above in calculation block
          key !== 'gstDetails' // This is derived and set, not directly from updateData
         ) {
        // Only update if the key exists on the quotation model to prevent adding arbitrary fields
        if (quotation[key] !== undefined) {
          quotation[key] = updateData[key];
        }
      }
    }

    await quotation.save();

    // Re-populate if necessary for the response (e.g., to send back business name, populated follow-ups)
    const updatedQuotation = await Quotation.findById(id)
      .populate('businessId', 'contactName email phone address gstin mobileNumber businessName')
      .populate('followUps.addedBy', 'name email');

    res.status(200).json(updatedQuotation);
  } catch (err) {
    console.error("Error updating quotation:", err);
    res.status(400).json({ error: 'Failed to update quotation. Please check your input.' });
  }
};

// DELETE a quotation
exports.remove = async (req, res) => {
  try {
    const deleted = await Quotation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Quotation not found.' });
    }
    res.json({ message: "Quotation deleted successfully." });
  } catch (err) {
    console.error("Error deleting quotation:", err);
    res.status(400).json({ error: 'Failed to delete quotation.' });
  }
};

// GET active businesses
exports.getActiveBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ status: 'Active' });
    res.json(businesses);
  } catch (err) {
    console.error("Error fetching active businesses:", err);
    res.status(500).json({ error: 'Failed to fetch active businesses.' });
  }
};

// GET quotations by business ID
exports.getQuotationsByBusinessId = async (req, res) => {
  try {
    const quotations = await Quotation.find({ businessId: req.params.id })
      .populate('items.productId') // Assuming product details might be needed here
      .populate('followUps.addedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(quotations);
  } catch (err) {
    console.error("Error fetching quotations by business ID:", err);
    res.status(500).json({ message: 'Failed to fetch quotations for the specified business.' });
  }
};

// Get follow-ups by quotation ID
exports.getFollowUpsByQuotationId = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('followUps.addedBy', 'name email');

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }
    // Directly return the followUps array or an empty array
    res.json(quotation.followUps || []);
  } catch (err) {
    console.error("Error fetching follow-ups for quotation:", err);
    res.status(500).json({ message: 'Failed to fetch follow-ups.', error: err.message });
  }
};

// Add a new follow-up to a specific quotation
exports.addFollowUp = async (req, res) => {
  const { id } = req.params;
  const { date, note, addedBy, status } = req.body;

  try {
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const newFollowUp = { date, note, addedBy };
    if (status !== undefined) { // Only set status if explicitly provided
      newFollowUp.status = status;
    }
    quotation.followUps.push(newFollowUp);
    await quotation.save();

    const updatedQuotation = await Quotation.findById(id)
      .populate('followUps.addedBy', 'name email');

    res.status(200).json({ message: 'Follow-up added successfully.', followUps: updatedQuotation.followUps });
  } catch (err) {
    console.error("Error adding follow-up to quotation:", err);
    res.status(500).json({ message: 'Failed to add follow-up.', error: err.message });
  }
};

// Update a specific follow-up by its index on a quotation
exports.updateFollowUp = async (req, res) => {
  try {
    const { id, index } = req.params;
    const { date, note, status } = req.body;

    const quotation = await Quotation.findById(id);
    if (!quotation || !quotation.followUps[index]) {
      return res.status(404).json({ message: 'Follow-up not found.' });
    }

    quotation.followUps[index].date = date;
    quotation.followUps[index].note = note;
    if (status !== undefined) { // Only update status if explicitly provided
      quotation.followUps[index].status = status;
    }
    await quotation.save();

    const updatedQuotation = await Quotation.findById(id)
      .populate('followUps.addedBy', 'name email');

    res.status(200).json({ message: 'Follow-up updated successfully.', followUps: updatedQuotation.followUps });
  } catch (err) {
    console.error("Error updating follow-up on quotation:", err);
    res.status(500).json({ message: 'Failed to update follow-up.', error: err.message });
  }
};

// Delete a follow-up by index on a quotation
exports.deleteFollowUp = async (req, res) => {
  try {
    const { id, index } = req.params;

    const quotation = await Quotation.findById(id);
    if (!quotation || !quotation.followUps[index]) {
      return res.status(404).json({ message: 'Follow-up not found.' });
    }

    quotation.followUps.splice(index, 1);
    await quotation.save();

    const updatedQuotation = await Quotation.findById(id)
      .populate('followUps.addedBy', 'name email');

    res.status(200).json({ message: 'Follow-up deleted successfully.', followUps: updatedQuotation.followUps });
  } catch (err) {
    console.error("Error deleting follow-up from quotation:", err);
    res.status(500).json({ message: 'Failed to delete follow-up.', error: err.message });
  }
};