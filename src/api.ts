import axios from "axios"

export const API_URL = 'http://localhost:8080/api/v1' // Changed port to 8080, the default for Spring Boot

export interface CriaturaDTO {
    id: number
    ouro: number
    posicaox: number
    idCriaturaRoubada: number
    foiRoubado: boolean
}

export interface DadosSimulacao {
    iteracao: number
    criaturas: CriaturaDTO[]
}

export interface resquest {
    quantidade: number
    iteracoes: number
}

export interface CriarUsuarioDTO {
  login: string;
  senha: string;
  avatar: string;
}

export interface LoginDTO {
  login: string;
  senha: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/v1',
  validateStatus: (status) => status >= 200 && status < 300,
});

export async function fetchdadosSimulacao(resquest: resquest ): Promise<DadosSimulacao[]> {
    try {
        console.log('Requisição:', resquest);
        const response = await api.post('/simular', resquest);
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const login = async (loginDTO: LoginDTO) => {
  const response = await fetch(`${API_URL}/usuarios/login`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginDTO)
  })
  if (!response.ok) {
    throw new Error('Login failed')
  }
  return response.json()
}

export const registrar = async (criarUsuarioDTO: CriarUsuarioDTO) => {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(criarUsuarioDTO)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Registration failed')
  }
  return response.json()
}

export const deleteAccount = async (login: string) => {
  const response = await fetch(`${API_URL}/usuarios/${login}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Delete failed')
  }
  return response.text()
}
