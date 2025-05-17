'use client'

import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { Suspense, useState, useEffect, useMemo } from 'react'
import { TextureLoader, DoubleSide, PerspectiveCamera } from 'three'
import Ouro from './ouro'
import Criatura from './criatura'
import { CriaturaDTO, DadosSimulacao } from '@/api'

const escala = 0.003

interface SimulacaoCanvasProps {
  dados: DadosSimulacao[]
}

function PlanoDeFundo() {
  const texturaFundo = useLoader(TextureLoader, '/cenario.jpg')
  const { camera, size } = useThree()

  const { width, height } = useMemo(() => {
    const aspect = size.width / size.height

    if ('fov' in camera) {
      const fov = (camera as PerspectiveCamera).fov
      const z = Math.abs(camera.position.z - (-1))
      const height = 2 * Math.tan((fov * Math.PI) / 360) * z
      const width = height * aspect
      return { width, height }
    }

    return { width: 10, height: 10 }
  }, [camera, size])

  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texturaFundo} side={DoubleSide} />
    </mesh>
  )
}

export default function SimulacaoCanvas({ dados }: SimulacaoCanvasProps) {
  const [iteracao, setIteracao] = useState(0)

  const { minX, maxX } = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    dados.forEach(iter => {
      iter.criaturas.forEach(c => {
        if (c.posicaox < minX) minX = c.posicaox;
        if (c.posicaox > maxX) maxX = c.posicaox;
      });
    });
    return { minX, maxX };
  }, [dados]);

  useEffect(() => {
    console.log("Dados recebidos:", dados)
  }, [dados])

  useEffect(() => {
    if (dados && iteracao >= dados.length) {
      setIteracao(0)
    }
  }, [dados, iteracao])

  if (!dados || dados.length === 0) {
    console.error("Dados não recebidos ou array vazio no SimulacaoCanvas")
    return <div>Aguardando dados da simulação...</div>
  }

  const iter = dados[iteracao]

  if (!iter) {
    console.error(`Iteração ${iteracao} não encontrada em:`, dados)
    return <div>Iteração não encontrada.</div>
  }

  if (!Array.isArray(iter.criaturas)) {
    console.error("Criaturas não é um array:", iter)
    return <div>Dados de criaturas inválidos.</div>
  }

  const proxIteracao = () => {
    if (iteracao < dados.length - 1) setIteracao(iteracao + 1)
  }

  const antIteracao = () => {
    if (iteracao > 0) setIteracao(iteracao - 1)
  }

  return (
    <div>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight />
        <Suspense fallback={null}>
          <PlanoDeFundo />
          {iter.criaturas.map((c: CriaturaDTO) => (
            <Criatura key={c.id} criatura={c} minX={minX} maxX={maxX} />
          ))}
          {iter.criaturas.map((c: CriaturaDTO) => (
            <Ouro
              key={`ouro-${c.id}`}
              de={c.idCriaturaRoubada}
              para={c.id}
              iter={iter.criaturas}
              minX={minX}
              maxX={maxX}
            />
          ))}
        </Suspense>
      </Canvas>

      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={antIteracao}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          disabled={iteracao === 0}
        >
          ◀ Anterior
        </button>
        <span className="py-2">Iteração: {iter.iteracao}</span>
        <button
          onClick={proxIteracao}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          disabled={iteracao === dados.length - 1}
        >
          Próxima ▶
        </button>
      </div>
    </div>
  )
}
