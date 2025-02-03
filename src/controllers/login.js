import { supabase } from "../supabaseClient.js";
import argon2 from "argon2";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const generateToken = (user) => {
    return jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECREET,
        { expiresIn: '24h'}
    )
    
    
}


async function hashedPassword(password) {
    try {
        const hash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 2,
        });
        return hash;
    } catch (error) {
        console.error('Error saat hashing password:', error);
        throw error;
    }
}

async function confirmPassword(hashedPassword, password) {
    try {
        const isMatch = await argon2.verify(hashedPassword,password);
        return isMatch;
    }catch (error){
        console.error('password tidak cocok: ',error);
        throw error;
    }
}



export const loginUser = async ( req, res,) => {
    const { email , password } = req.body; 
    
    if(!email || !password){
        return res.status(400).json({
            message: 'email dan password are required.'
        })
    }

    try{
        const {data,error} = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
        
        if(error || !data ){
            return res.status(400).json({
                message: 'invalid username or password'
            })
        }

        

        const isMatch = await confirmPassword(data.password, password);
        if(!isMatch){
            return res.status(401).json({
                message : 'pasword salah'
            });
            
        }
        
        const token = generateToken(data)
        console.log("generated token: ", token)

        res.json({
            status: 'succes',
            message: 'login berhasil',
            user: {
                id: data.id,
                email: data.email,
                role: data.role
            },
            token
        });
    }catch(error){
        res.status(500).json({
            status: 'succes',
            message: 'Terjadi kesalahan server'
        })
    }
}
