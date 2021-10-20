import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken"

interface Ipayload {
    sub: string
}
export function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
    const authToken = request.headers.authorization;

    if(!authToken) {
        return response.status(401).json({
            errorCode: "token.invalid",
        });
    }

    //verificar se o token é válido - [0] Bearer, [1] 12341lk4h14i2o1nacn9
    const [, token] = authToken.split(" "); // ignorando a primeira posicao "bearer"

    try {
        const { sub } = verify(token, process.env.JWT_SECRET) as Ipayload; //sub = id do usuario

        request.user_id = sub;

        return next();// para passar para frente
    } catch (error) {
        return response.status(401).json({ errorCode: "token.invalid"});
    }
    
}