const express = require('express');
const router = express.Router();
const Beneficiary = require('../models/Beneficiary');

const toArrayParam = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap((v) => String(v).split(',')).map((v) => v.trim()).filter(Boolean);
    return String(value).split(',').map((v) => v.trim()).filter(Boolean);
};

const parseDateStart = (value) => {
    if (!value) return null;
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
};

const parseDateEnd = (value) => {
    if (!value) return null;
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(23, 59, 59, 999);
    return d;
};

const buildBeneficiaryFilter = (query) => {
    const {
        status,
        q,
        registeredFrom,
        registeredTo,
        dobFrom,
        dobTo,
        joiningFrom,
        joiningTo,
        gender,
        nationality,
        maritalStatus,
        settlementCamp
    } = query;

    const filter = {};

    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
        if (status === 'Pending') {
            filter.$or = [{ status: 'Pending' }, { status: { $exists: false } }];
        } else {
            filter.status = status;
        }
    }

    if (gender && ['Male', 'Female'].includes(gender)) {
        filter.gender = gender;
    }

    const nationalityValues = toArrayParam(nationality);
    if (nationalityValues.length > 0) {
        filter.nationality = { $in: nationalityValues };
    }

    const maritalValues = toArrayParam(maritalStatus);
    if (maritalValues.length > 0) {
        filter.maritalStatus = { $in: maritalValues };
    }

    const campValues = toArrayParam(settlementCamp);
    if (campValues.length > 0) {
        filter.settlementCamp = { $in: campValues };
    }

    const regFrom = parseDateStart(registeredFrom);
    const regTo = parseDateEnd(registeredTo);
    if (regFrom || regTo) {
        filter.registrationDate = {};
        if (regFrom) filter.registrationDate.$gte = regFrom;
        if (regTo) filter.registrationDate.$lte = regTo;
    }

    const birthFrom = parseDateStart(dobFrom);
    const birthTo = parseDateEnd(dobTo);
    if (birthFrom || birthTo) {
        filter.dateOfBirth = {};
        if (birthFrom) filter.dateOfBirth.$gte = birthFrom;
        if (birthTo) filter.dateOfBirth.$lte = birthTo;
    }

    const joinFrom = parseDateStart(joiningFrom);
    const joinTo = parseDateEnd(joiningTo);
    if (joinFrom || joinTo) {
        filter.dateOfJoining = {};
        if (joinFrom) filter.dateOfJoining.$gte = joinFrom;
        if (joinTo) filter.dateOfJoining.$lte = joinTo;
    }

    if (q && String(q).trim().length > 0) {
        const queryText = String(q).trim();
        const regex = new RegExp(queryText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const textFilter = [
            { firstName: regex },
            { lastName: regex },
            { placeOfBirth: regex },
            { nationality: regex },
            { maritalStatus: regex },
            { settlementCamp: regex }
        ];
        if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, { $or: textFilter }];
            delete filter.$or;
        } else {
            filter.$or = textFilter;
        }
    }

    return filter;
};

const buildBeneficiarySort = (sort) => {
    const allowedSortFields = new Set(['registrationDate', 'dateOfBirth', 'dateOfJoining', 'createdAt']);
    const sortValue = typeof sort === 'string' ? sort : '';
    let sortField = 'registrationDate';
    let sortDirection = -1;
    if (sortValue.includes(':')) {
        const [field, dir] = sortValue.split(':');
        if (allowedSortFields.has(field)) sortField = field;
        if (dir === 'asc') sortDirection = 1;
        if (dir === 'desc') sortDirection = -1;
    }
    return { [sortField]: sortDirection };
};

const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    const s = String(value);
    if (/[",\r\n]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
};

const toCsv = (rows, columns) => {
    const header = columns.map((c) => escapeCsvValue(c.label)).join(',');
    const lines = rows.map((row) => columns.map((c) => escapeCsvValue(c.get(row))).join(','));
    return [header, ...lines].join('\r\n');
};

router.get('/beneficiaries', async (req, res) => {
    try {
        const {
            status,
            q,
            page = '1',
            limit = '50',
            sort,
            registeredFrom,
            registeredTo,
            dobFrom,
            dobTo,
            joiningFrom,
            joiningTo,
            gender,
            nationality,
            maritalStatus,
            settlementCamp
        } = req.query;
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
        const filter = buildBeneficiaryFilter({
            status,
            q,
            registeredFrom,
            registeredTo,
            dobFrom,
            dobTo,
            joiningFrom,
            joiningTo,
            gender,
            nationality,
            maritalStatus,
            settlementCamp
        });
        const sortQuery = buildBeneficiarySort(sort);

        const total = await Beneficiary.countDocuments(filter);
        const items = await Beneficiary.find(filter)
            .sort(sortQuery)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean();

        res.json({
            page: pageNumber,
            limit: limitNumber,
            total,
            items: items.map((item) => ({ ...item, status: item.status || 'Pending' }))
        });
    } catch (error) {
        console.error('Error fetching beneficiaries:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/beneficiaries/export', async (req, res) => {
    try {
        const { format = 'csv', page = '1', limit = '10000', sort } = req.query;
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10000, 1), 10000);

        const filter = buildBeneficiaryFilter(req.query);
        const sortQuery = buildBeneficiarySort(sort);

        const items = await Beneficiary.find(filter)
            .sort(sortQuery)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean();

        const normalizedItems = items.map((item) => ({ ...item, status: item.status || 'Pending' }));

        const now = new Date();
        const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

        if (format === 'json') {
            const filename = `beneficiaries_${stamp}.json`;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.status(200).send(JSON.stringify({ items: normalizedItems }, null, 2));
        }

        const columns = [
            { label: 'First Name', get: (r) => r.firstName || '' },
            { label: 'Last Name', get: (r) => r.lastName || '' },
            { label: 'Gender', get: (r) => r.gender || '' },
            { label: 'Date of Birth', get: (r) => r.dateOfBirth ? new Date(r.dateOfBirth).toISOString().slice(0, 10) : '' },
            { label: 'Nationality', get: (r) => r.nationality || '' },
            { label: 'Marital Status', get: (r) => r.maritalStatus || '' },
            { label: 'Location', get: (r) => r.settlementCamp || '' },
            { label: 'Joining Date', get: (r) => r.dateOfJoining ? new Date(r.dateOfJoining).toISOString().slice(0, 10) : '' },
            { label: 'Registered', get: (r) => r.registrationDate ? new Date(r.registrationDate).toISOString() : '' },
            { label: 'Status', get: (r) => r.status || 'Pending' }
        ];

        const csv = '\uFEFF' + toCsv(normalizedItems, columns);
        const filename = `beneficiaries_${stamp}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csv);
    } catch (error) {
        console.error('Error exporting beneficiaries:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /register
router.post('/register', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            placeOfBirth,
            dateOfBirth,
            gender,
            nationality,
            maritalStatus,
            settlementCamp,
            dateOfJoining
        } = req.body;

        // Create new beneficiary
        const newBeneficiary = new Beneficiary({
            firstName,
            lastName,
            placeOfBirth,
            dateOfBirth,
            gender,
            nationality,
            maritalStatus,
            settlementCamp,
            dateOfJoining,
            registrationDate: new Date() // Set registration date to now
        });

        // Save to database
        const savedBeneficiary = await newBeneficiary.save();
        
        res.status(201).json({
            message: 'Beneficiary registered successfully',
            data: savedBeneficiary
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Validation Error',
                errors: messages
            });
        }
        console.error('Error saving beneficiary:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

router.patch('/beneficiaries/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updated = await Beneficiary.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Beneficiary not found' });
        }

        res.json({ message: 'Status updated', data: updated });
    } catch (error) {
        console.error('Error updating beneficiary status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/beneficiaries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Beneficiary.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Beneficiary not found' });
        }

        res.json({ message: 'Beneficiary deleted' });
    } catch (error) {
        console.error('Error deleting beneficiary:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
