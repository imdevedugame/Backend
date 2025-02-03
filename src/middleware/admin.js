import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export const verifyTokenAdmin = (req, res, next) =>{
    const token = req.headers.authorization?.split('Bearer ')[1];
    const secret = process.env.JWT_SECREET;
    console.log("auth header: ", req.headers.authorization);
    console.log('extracted token: ', token)
    if(!token){
        return res.status(401).json({
            status: 'error',
            message: 'token tidak ditemukan'            
        })
    }

    try {
        const decoded = jwt.verify(token, secret)

        if(decoded.role !== 'admin'){
            return res.status(403).json({
                status: 'error',
                message: 'Akses ditolak',
            })
        }

        req.user = decoded
        next()
    }catch(error){
        return res.status(401).json({
            status: 'error',
            message: 'Token tidak valid'
        })
    }
}