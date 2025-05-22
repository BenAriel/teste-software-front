'use client'

import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { Suspense, useState, useEffect, useMemo } from 'react'
import { TextureLoader, DoubleSide, PerspectiveCamera, Vector3 } from 'three'
import Ouro from './ouro'
import Criatura from './criatura'
import { CriaturaDTO, DadosSimulacao } from '@/api'

interface SimulacaoCanvasProps {
  dados: DadosSimulacao[]
  onNovaSimulacao: () => void
}

function PlanoDeFundo() {
  const texturaFundo = useLoader(TextureLoader, '/cenario.jpg')
  const { camera, size } = useThree()

  // Calcula as dimensões do plano para preencher exatamente a vista da câmera
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

  // Posiciona o plano exatamente na frente da câmera
  const position = useMemo(() => {
    return new Vector3(0, 0, 0)
  }, [])

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial 
        map={texturaFundo} 
        side={DoubleSide}
      />
    </mesh>
  )
}

export default function SimulacaoCanvas({ dados, onNovaSimulacao }: SimulacaoCanvasProps) {
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
    if (!dados || dados.length === 0) return;
    if (iteracao >= dados.length - 1) return;
    const timer = setTimeout(() => {
      setIteracao((prev) => prev + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [iteracao, dados, dados.length]);

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

  return (
    <div className="w-full h-[80vh] flex">
      <div className="w-[300px] bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-white text-xl font-bold mb-4">Informações das Criaturas</h2>
        <div className="space-y-4">
          {iter.criaturas.map((c: CriaturaDTO) => (
            <div key={c.id} className="bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${c.id * 30}, 70%, 50%)` }}></div>
                <span className="text-white font-bold">Criatura {c.id}</span>
              </div>
              <div className="text-gray-300 text-sm space-y-1">
                <p className="flex justify-between">
                  <span>Posição:</span>
                  <span className="font-mono">{c.posicaox.toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Ouro:</span>
                  <span className="font-mono">{c.ouro}</span>
                </p>
                <p className="flex justify-between">
                  <span>Roubou de:</span>
                  <span className="font-mono">{c.idCriaturaRoubada || 'Ninguém'}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <Canvas 
          camera={{ 
            position: [0, 0, 10],
            fov: 50,
            near: 0.1,
            far: 1000
          }}
        >
          <ambientLight intensity={1.5} />
          <Suspense fallback={null}>
            <PlanoDeFundo />
            {iter.criaturas.map((c: CriaturaDTO) => {
              const proximaIteracao = dados[iteracao + 1]
              const proximaCriatura = proximaIteracao?.criaturas.find(
                (nextC: CriaturaDTO) => nextC.id === c.id
              )
              return (
                <Criatura
                  key={c.id}
                  criatura={c}
                  minX={minX}
                  maxX={maxX}
                  iteracao={iter.iteracao}
                  proximaPosicao={proximaCriatura?.posicaox}
                />
              )
            })}
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

        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={onNovaSimulacao}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Nova Simulação
          </button>
        </div>
      </div>
    </div>
  )
}
