import axios from "axios";
import prismaClient from "../prisma"
import { sign } from "jsonwebtoken"
/**
 * Receber code(string)
 * Recuperar o acess_token no github
 * Verificar se o usuário existe no DB
 * ----- Sim = Gera um token
 * ----- Não = Criar no DB, gera um token
 * Retorna o token com as informacoes do usuário
 */

interface IAccessTokenResponse {
  access_token: string
}

interface IUserResponse {
  avatar_url: string,
  login: string,
  id: number,
  name: string
}

class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";
    // acesse data com o nome 'accessTokenResponse'
    const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },

      headers: {
        "Accept": "application/json"
      }
    });

    const response = await axios.get<IUserResponse>("https://api.github.com/user", {
      headers: {
        authorization: `Bearer ${accessTokenResponse.access_token}`
      }
    })

    const { login, id, avatar_url, name} = response.data;

    let user = await prismaClient.user.findFirst({
      where: {
        github_id: id
      }
    })

    //se usuário nao existir, cria
    if(!user) {
      await prismaClient.user.create({
        data: { github_id: id, login, avatar_url, name }
      })
    }

    // criando um token
    const token = sign(
      {
        user: {
          name: user.name,
          avatar_url: user.avatar_url,
          id: user.id
        }
      },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: "1d" // 1 dia.
      }
    )

    return { token, user };
  }
}

export { AuthenticateUserService }