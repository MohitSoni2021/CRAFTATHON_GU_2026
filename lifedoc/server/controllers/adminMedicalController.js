const Medicine = require('../models/Medicine');
const LabTest = require('../models/LabTest');

// --- Medicine Management ---

// Add a new medicine
exports.addMedicine = async (req, res) => {
    try {
        const { name, brand, dosageInfo, manufacturer, description, category, uses, sideEffects } = req.body;

        // Validation for required fields
        if (!name || !description) {
            return res.status(400).json({ message: "Name and Description are required" });
        }

        const medicine = new Medicine({
            name,
            brand,
            dosageInfo,
            manufacturer,
            description,
            category,
            uses: uses ? uses.split(',').map(s => s.trim()) : [],
            sideEffects: sideEffects ? sideEffects.split(',').map(s => s.trim()) : []
        });

        await medicine.save();
        res.status(201).json({ message: 'Medicine added successfully', medicine });
    } catch (error) {
        res.status(500).json({ message: 'Error adding medicine', error: error.message });
    }
};

// Get all medicines (searchable)
exports.getMedicines = async (req, res) => {
    try {
        const { search } = req.query;
        const query = search ? { name: { $regex: search, $options: 'i' } } : {};
        const medicines = await Medicine.find(query).limit(50); // Limit results for performance
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching medicines', error: error.message });
    }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
    try {
        await Medicine.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting medicine', error: error.message });
    }
};

// --- Lab Test Management ---

// Add a new lab test
exports.addLabTest = async (req, res) => {
    try {
        const { name, description, normalRange, preparation, clinicalSignificance, category } = req.body;
        // Basic validation
        if (!name || !description) {
            return res.status(400).json({ message: "Name and Description are required" });
        }

        const labTest = new LabTest({
            name,
            description,
            normalRange,
            preparation,
            clinicalSignificance,
            category
        });
        await labTest.save();
        res.status(201).json({ message: 'Lab Test added successfully', labTest });
    } catch (error) {
        res.status(500).json({ message: 'Error adding lab test', error: error.message });
    }
};


// Get all lab tests
exports.getLabTests = async (req, res) => {
    try {
        const tests = await LabTest.find();
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lab tests', error: error.message });
    }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
    try {
        const { name, brand, dosageInfo, manufacturer, description, category, uses, sideEffects } = req.body;

        const updateData = {
            name, brand, dosageInfo, manufacturer, description, category,
            uses: Array.isArray(uses) ? uses : (uses ? uses.split(',').map(s => s.trim()) : []),
            sideEffects: Array.isArray(sideEffects) ? sideEffects : (sideEffects ? sideEffects.split(',').map(s => s.trim()) : [])
        };

        const medicine = await Medicine.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json({ message: 'Medicine updated successfully', medicine });
    } catch (error) {
        res.status(500).json({ message: 'Error updating medicine', error: error.message });
    }
};

// Update lab test
exports.updateLabTest = async (req, res) => {
    try {
        const { name, description, normalRange, preparation, clinicalSignificance, category } = req.body;
        const updateData = { name, description, normalRange, preparation, clinicalSignificance, category };

        const labTest = await LabTest.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json({ message: 'Lab Test updated successfully', labTest });
    } catch (error) {
        res.status(500).json({ message: 'Error updating lab test', error: error.message });
    }
};
