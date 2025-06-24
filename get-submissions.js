const { MongoClient } = require('mongodb');

// يقرأ رابط الاتصال من متغيرات البيئة في Vercel
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// كلمة المرور الخاصة بالمدير
const ADMIN_PASSWORD = "admin123"; 

module.exports = async (req, res) => {
    // التأكد من أن الطلب هو من نوع POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // قراءة كلمة المرور من الطلب
    const { password } = req.body;

    // التأكد من صحة كلمة المرور
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // الاتصال بقاعدة البيانات
        await client.connect();
        const database = client.db('khotab_db');
        const collection = database.collection('assignments');

        // جلب جميع البيانات وفرزها من الأحدث إلى الأقدم
        const submissions = await collection.find({}).sort({ submissionDate: -1 }).toArray();
        
        // إرسال البيانات بنجاح
        res.status(200).json(submissions);

    } catch (error) {
        // --- هذا هو الجزء الهام لتشخيص المشكلة ---
        // في حال حدوث أي خطأ أثناء الاتصال أو جلب البيانات، سيتم تنفيذ هذا الكود

        // طباعة الخطأ في سجلات Vercel
        console.error("A detailed error occurred:", error);

        // إرسال رسالة خطأ مفصلة إلى المتصفح مباشرة
        res.status(500).json({
            message: "An internal server error occurred.",
            error_details: error.toString(), // رسالة الخطأ الحقيقية
            error_stack: error.stack // تفاصيل إضافية عن مكان الخطأ
        });
        // ------------------------------------------
    } finally {
        // التأكد من إغلاق الاتصال بقاعدة البيانات في كل الحالات
        if(client) await client.close();
    }
};