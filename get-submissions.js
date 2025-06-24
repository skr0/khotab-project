const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// المفتاح السري الذي يجب أن يتطابق مع المفتاح في صفحة المدير
const SECRET_API_KEY = "THIS_IS_A_VERY_SECRET_KEY_12345"; 

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // قراءة المفتاح السري من الطلب
    const { apiKey } = req.body;

    // التأكد من صحة المفتاح السري
    if (apiKey !== SECRET_API_KEY) {
        return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    }

    try {
        await client.connect();
        const database = client.db('khotab_db');
        const collection = database.collection('assignments');
        const submissions = await collection.find({}).sort({ submissionDate: -1 }).toArray();
        res.status(200).json(submissions);
    } catch (error) {
        console.error("A detailed error occurred:", error);
        res.status(500).json({
            message: "An internal server error occurred.",
            error_details: error.toString()
        });
    } finally {
        if(client) await client.close();
    }
};
