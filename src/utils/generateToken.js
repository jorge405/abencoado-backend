import jwt from 'jsonwebtoken';

const secretkey = process.env.SECRET_KEY 

export const generateToken = (uid,correo,pass,cod_empresa) => {
    const expiresIn='30m'; // 1 hour	
    try {
        const token = jwt.sign({uid,correo,pass,cod_empresa},secretkey,{expiresIn});
        return {token,expiresIn};    
    } catch (error) {
        console.log('error al generar el token:',error)
    }
    
}