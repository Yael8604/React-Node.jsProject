const jwt = require('jsonwebtoken')
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization ||
        req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({
                message:
                    'Forbidden'
            })
            req.user = decoded
            next()
        }
    )
}
module.exports = verifyJWT

// const jwt = require('jsonwebtoken');

// const verifyJWT = (req, res, next) => {
//     // 1. קריאת הטוקן מהקוקי
//     const token = req.cookies.accessToken; // 'accessToken' הוא השם שנתת לקוקי ב-login

//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized - No token provided in cookie' });
//     }

//     jwt.verify(
//         token,
//         process.env.ACCESS_TOKEN_SECRET,
//         (err, decoded) => {
//             if (err) {
//                 // אם הטוקן פג תוקף או לא תקין, מומלץ למחוק אותו מהדפדפן
//                 if (err.name === 'TokenExpiredError') {
//                     res.clearCookie('accessToken', {
//                         httpOnly: true,
//                         sameSite: 'lax', // או 'none' אם נדרש, ואז secure: true חובה
//                         secure: process.env.NODE_ENV === 'production' // חובה true ב-production עם HTTPS
//                     });
//                     return res.status(401).json({ message: 'Unauthorized - Token expired' });
//                 }
//                 // במקרה של טוקן לא תקין אחר
//                 res.clearCookie('accessToken', {
//                     httpOnly: true,
//                     sameSite: 'lax',
//                     secure: process.env.NODE_ENV === 'production'
//                 });
//                 return res.status(403).json({ message: 'Forbidden - Invalid token' });
//             }
//             // שמירת פרטי המשתמש המפוענחים מהטוקן באובייקט הבקשה
//             // בפונקציית login, שמרת את האובייקט userInfo בטוקן
//             req.user = decoded; // decoded מכיל את userInfo {_id, name, username, email}
//             next();
//         }
//     );
// };

// module.exports = verifyJWT;