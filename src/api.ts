import axios from "axios"

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
