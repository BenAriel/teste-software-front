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
  const { camera } = useThree()

  // Calcula as dimensões do plano para preencher exatamente a vista da câmera
  const { width, height } = useMemo(() => {
    if ('fov' in camera) {
      const fov = (camera as PerspectiveCamera).fov
      const distance = Math.abs(camera.position.z)
      
      // Calcula a altura visível na distância da câmera
      const visibleHeight = 2 * Math.tan((fov * Math.PI / 180) / 2) * distance
      // Calcula a largura baseada no aspect ratio da câmera
      const visibleWidth = visibleHeight * (camera as PerspectiveCamera).aspect

      return {
        width: visibleWidth,
        height: visibleHeight
      }
    }
    return { width: 20, height: 20 }
  }, [camera])

  // Posiciona o plano exatamente na frente da câmera
  const position = useMemo(() => {
    const distance = camera.position.z
    return new Vector3(0, 0, 0)
  }, [camera.position.z])

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
      setIteracao((prev) => Math.min(prev + 1, dados.length - 1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [iteracao, dados]);

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
    <div className="w-full h-[80vh]">
      <Canvas 
        camera={{ 
          position: [0, 0, 10],
          fov: 50, // Reduz o FOV para uma vista mais "achatada"
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
  )
}
