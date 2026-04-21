const axios = require('axios');

// Local index for suggestions
let medicineIndex = [
    'Paracetamol', 'Ibuprofen', 'Aspirin', 'Metformin', 'Amoxicillin', 
    'Atorvastatin', 'Omeprazole', 'Lisinopril', 'Sertraline', 'Albuterol',
    'Cetirizine', 'Azithromycin', 'Amlodipine', 'Gabapentin', 'Losartan'
];

const FDA_API_URL = 'https://api.fda.gov/drug/label.json';

// Simple in-memory cache
const cache = {
    top: null,
    search: {},
    expiry: 1000 * 60 * 60 // 1 hour
};

/**
 * Normalizes OpenFDA response to handle missing fields safely
 */
const normalizeMedicine = (item) => {
    return {
        id: item.id,
        name: item.openfda?.generic_name?.[0] || item.openfda?.brand_name?.[0] || 'Unknown Medicine',
        brand: item.openfda?.brand_name?.[0] || 'Generic',
        uses: item.indications_and_usage?.[0] || 'No usage information available.',
        warnings: item.warnings?.[0] || 'No warnings provided.',
        generic_name: item.openfda?.generic_name?.[0] || 'N/A'
    };
};

/**
 * GET /api/medicines/top
 * Returns a list of predefined common medicines with details from OpenFDA
 */
exports.getTopMedicines = async (req, res) => {
    try {
        const topMedicines = ['paracetamol', 'ibuprofen', 'aspirin', 'metformin', 'amoxicillin', 'atorvastatin', 'omeprazole', 'lisinopril', 'sertraline', 'albuterol'];
        
        const results = await Promise.all(topMedicines.map(async (name) => {
            try {
                const response = await axios.get(`${FDA_API_URL}?search=openfda.generic_name:"${name}"&limit=1`);
                if (response.data.results && response.data.results.length > 0) {
                    return normalizeMedicine(response.data.results[0]);
                }
                return null;
            } catch (err) {
                console.error(`Error fetching ${name}:`, err.message);
                return null;
            }
        }));

        const filteredResults = results.filter(item => item !== null);
        res.json({ success: true, data: filteredResults });
    } catch (error) {
        console.error('Error in getTopMedicines:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch top medicines' });
    }
};

/**
 * GET /api/medicines/search?q=
 * Searches OpenFDA for medicines matching the query
 */
exports.searchMedicines = async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
    }

    try {
        const response = await axios.get(`${FDA_API_URL}?search=openfda.generic_name:"${query}"+OR+openfda.brand_name:"${query}"&limit=10`);
        
        if (!response.data.results) {
            return res.json({ success: true, data: [] });
        }

        const data = response.data.results.map(normalizeMedicine);
        
        // Update local index with new generic names found
        response.data.results.forEach(item => {
            const genericName = item.openfda?.generic_name?.[0];
            if (genericName && !medicineIndex.includes(genericName)) {
                medicineIndex.push(genericName);
            }
        });

        res.json({ success: true, data });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.json({ success: true, data: [] });
        }
        console.error('Error in searchMedicines:', error);
        res.status(500).json({ success: false, message: 'Failed to search medicines' });
    }
};

/**
 * GET /api/medicines/suggest?q=
 * Returns autocomplete suggestions from local index
 */
exports.getSuggestions = async (req, res) => {
    const query = req.query.q || '';
    
    try {
        const suggestions = medicineIndex
            .filter(name => name.toLowerCase().startsWith(query.toLowerCase()))
            .slice(0, 5);
            
        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error('Error in getSuggestions:', error);
        res.status(500).json({ success: false, message: 'Failed to get suggestions' });
    }
};

/**
 * GET /api/medicines/details/:id
 * Fetches full details for a specific medicine from OpenFDA
 */
exports.getMedicineDetails = async (req, res) => {
    const id = req.params.id;
    try {
        const response = await axios.get(`${FDA_API_URL}?search=id:"${id}"&limit=1`);
        
        if (!response.data.results || response.data.results.length === 0) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        const item = response.data.results[0];
        const data = {
            id: item.id,
            name: item.openfda?.generic_name?.[0] || item.openfda?.brand_name?.[0] || 'Unknown Medicine',
            brand: item.openfda?.brand_name?.[0] || 'Generic',
            category: item.openfda?.pharm_class_epc?.[0] || 'Pharmacology',
            manufacturer: item.openfda?.manufacturer_name?.[0] || 'N/A',
            description: item.description?.[0] || 'No description available.',
            uses: item.indications_and_usage || ['No usage information available.'],
            sideEffects: item.adverse_reactions || ['No side effects information available.'],
            dosageInfo: item.dosage_and_administration?.[0] || 'No dosage information available.',
            warnings: item.warnings?.[0] || 'No warnings provided.',
            activeIngredient: item.active_ingredient?.[0] || 'N/A',
            inactiveIngredient: item.inactive_ingredient?.[0] || 'N/A'
        };

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in getMedicineDetails:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch medicine details' });
    }
};
