// app/page.tsx ou equivalente
'use client'

import { useEffect, useState } from 'react'
import SimulacaoCanvas from './simulacao-canvas'
import { fetchdadosSimulacao, DadosSimulacao } from '@/api'

export default function Home() {
  const [dados, setDados] = useState<DadosSimulacao[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const resposta = await fetchdadosSimulacao({ quantidade: 10, iteracoes: 10 })
        setDados(resposta)
      } catch (e: unknown) {
        console.error(e)
        setErro('Erro ao carregar dados da simulação.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [])

  if (loading) return <div className="text-center mt-4">Carregando simulação...</div>
  if (erro) return <div className="text-center mt-4 text-red-500">{erro}</div>
  if (!dados || dados.length === 0) return null

  return (
    console.log(dados),
    <div>
      <h1 className="text-center text-2xl font-bold my-4">Simulação de Criaturas Saltitantes</h1>
      <SimulacaoCanvas dados={dados} />
    </div>
  )
}
