const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { preacher, assignments } = req.body;
        
        // Validation
        if (!preacher || !Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        // Flatten the data: one document per assignment
        const documentsToInsert = assignments.map(assignment => ({
            preacher: preacher,
            mosque: assignment.mosque,
            type: assignment.type,
            dates: assignment.dates,
            submissionDate: new Date()
        }));

        await client.connect();
        const database = client.db('khotab_db');
        const collection = database.collection('assignments');
        
        await collection.insertMany(documentsToInsert);

        res.status(200).json({ message: 'Data saved successfully' });

    } catch (error) {
        console.error("Error in /api/submit:", error);
        res.status(500).json({ message: 'Error saving data' });
    } finally {
        // Ensure that the client will close when you finish/error
        if(client) await client.close();
    }
};