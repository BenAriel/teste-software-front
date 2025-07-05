import axios from "axios"

export const API_URL = 'http://testesoftware.onrender.com/api/v1' // Changed port to 8080, the default for Spring Boot

export interface CriaturaDTO {
    id: number
    ouro: number
    posicaox: number
    idCriaturaRoubada: number
}

export interface GuardiaoDTO {
  id: number;
  ouro: number;
  posicaox: number;
  idClusterEliminado: number;
}

export interface ClusterDTO {
  id: number;
  ouro: number;
  posicaox: number;
}

export interface DadosSimulacao {
    iteracao: number
    criaturas: CriaturaDTO[]
    clusters: ClusterDTO[];
    guardiao: GuardiaoDTO;
    simulacaoBemSucedida: boolean;
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

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/v1',
  validateStatus: (status) => status >= 200 && status < 500, // Aceita respostas com erro
});

export async function fetchdadosSimulacao(parametros: { quantidade: number; iteracoes: number; loginUsuario: string }): Promise<DadosSimulacao[]> {
    try {
        const response = await api.post('/simular', parametros);

        if (response.status >= 400) {
            // Se a resposta for texto (erro), lança um erro com a mensagem
            if (typeof response.data === 'string') {
                throw new Error(response.data);
            }
            // Se for um objeto de erro JSON, extrai a mensagem
            throw new Error(response.data.message || 'Erro na simulação');
        }

        return response.data;
    } catch (error) {
        console.error('Erro ao chamar a API de simulação:', error);
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

export interface EstatisticasDTO {
  totalOuroSistema: number;
  totalCriaturas: number;
  totalClusters: number;
  totalSimulacoes: number;
  totalTurnos: number;
}

export interface UsuarioDTO {
  login: string;
  avatar: string; // Adicionado o campo avatar
  pontuacao: number;
  totalSimulacoes: number;
  taxaSucesso: number;
}

// Define a estrutura da resposta completa do endpoint de estatísticas
export interface EstatisticasComRankingDTO {
  pontuacaoUsuarios: UsuarioDTO[];
  quantidadeTotalSimulacoes: number;
  mediaSimulacoesSucessoUsuario: number;
  mediaTotalSimulacoesSucesso: number;
  totalUsuarios: number;
}

// Função para buscar o ranking de usuários
export async function fetchRanking(): Promise<UsuarioDTO[]> {
  try {
    // O endpoint correto é /usuarios/estatisticas
    const response = await api.get<EstatisticasComRankingDTO>('/usuarios/estatisticas');
    if (response.status >= 400) {
      throw new Error('Erro ao buscar o ranking');
    }
    // Retorna apenas a lista de usuários da resposta
    return response.data.pontuacaoUsuarios;
  } catch (error) {
    console.error('Erro ao chamar a API de ranking:', error);
    throw error;
  }
}
