const PORT = Number.parseInt(process.env.PORT, 10) || 3000;

const MONGODB_URI =
    process.env.MONGODB_URI ||
    process.env.MONGO_PUBLIC_URL ||
    process.env.MONGO_URL ||
    'mongodb://localhost:27017/fca_refugee_support';

const PUBLIC_API_BASE_URL = process.env.PUBLIC_API_BASE_URL || '';

module.exports = {
    PORT,
    MONGODB_URI,
    PUBLIC_API_BASE_URL
};
