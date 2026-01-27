import jwt from 'jsonwebtoken';

export const verifyToken =(req,res,next)=>{
    const authHeader = req.headers['authorization'];
    if(!authHeader|| !authHeader.startsWith('Bearer ')){
        return res.status(403).json({message:'token no proporcionado o mal formateado'})
    }
    const token = authHeader.split(' ')[1];
    if(!token){
        return res.status(403).json({message:'token no proporcionado'})
    }
    jwt.verify(token,process.env.SECRET_KEY,(err,payload)=>{
        if(err){
            return res.status(401).json({message:'token no valido o expirado'})
        }
        req.user=payload;
        next();
    })
}