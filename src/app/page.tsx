// app/page.tsx ou equivalente
'use client'

import { useEffect, useState } from 'react'
import SimulacaoCanvas from './simulacao-canvas'
import { fetchdadosSimulacao, DadosSimulacao } from '@/api'

export default function Home() {
  const [dados, setDados] = useState<DadosSimulacao[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [configuracao, setConfiguracao] = useState({
    quantidade: 10,
    iteracoes: 10
  })
  const [simulacaoIniciada, setSimulacaoIniciada] = useState(false)

  const iniciarSimulacao = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro(null)
    setSimulacaoIniciada(true)

    try {
      const resposta = await fetchdadosSimulacao(configuracao)
      setDados(resposta)
    } catch (e: unknown) {
      console.error(e)
      setErro('Erro ao carregar dados da simulação.')
    } finally {
      setLoading(false)
    }
  }

  const reiniciarSimulacao = () => {
    setSimulacaoIniciada(false)
    setDados(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mb-4 text-black">Carregando simulação...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-center text-2xl font-bold mb-8 text-white">Simulação de Criaturas Saltitantes</h1>
      
      {!simulacaoIniciada ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={iniciarSimulacao} className="space-y-4">
            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium text-black mb-1">
                Quantidade de Criaturas
              </label>
              <input
                type="number"
                id="quantidade"
                min="1"
                max="10"
                value={configuracao.quantidade}
                onChange={(e) => {
                  let value = parseInt(e.target.value);
                  if (value > 10) value = 10;
                  setConfiguracao(prev => ({ ...prev, quantidade: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            
            <div>
              <label htmlFor="iteracoes" className="block text-sm font-medium text-black mb-1">
                Número de Iterações
              </label>
              <input
                type="number"
                id="iteracoes"
                min="1"
                max="100"
                value={configuracao.iteracoes}
                onChange={(e) => setConfiguracao(prev => ({ ...prev, iteracoes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Iniciar Simulação
            </button>
          </form>
        </div>
      ) : (
        <>
          {erro ? (
            <div className="text-center mt-4">
              <div className="text-red-500 mb-4">{erro}</div>
              <button
                onClick={reiniciarSimulacao}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : dados && dados.length > 0 ? (
            <SimulacaoCanvas 
              dados={dados} 
              onNovaSimulacao={reiniciarSimulacao}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
