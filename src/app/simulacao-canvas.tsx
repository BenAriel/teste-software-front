'use client'

import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { Suspense, useState, useEffect, useMemo } from 'react'
import { TextureLoader, DoubleSide, PerspectiveCamera, Vector3 } from 'three'
import Ouro from './ouro'
import Criatura from './criatura'
import { CriaturaDTO, DadosSimulacao, ClusterDTO, GuardiaoDTO } from '@/api'

interface SimulacaoCanvasProps {
  dados: DadosSimulacao[]
  onNovaSimulacao: () => void
}

function PlanoDeFundo({ width, height }: { width: number; height: number }) {
  const texturaFundo = useLoader(TextureLoader, '/cenario.jpg')

  return (
    <mesh position={new Vector3(0, 0, 0)}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial 
        map={texturaFundo} 
        side={DoubleSide}
      />
    </mesh>
  )
}

function Scene({
  dados,
  iteracao,
  minX,
  maxX
}: {
  dados: DadosSimulacao[]
  iteracao: number
  minX: number
  maxX: number
}) {
  const { camera } = useThree()

  const { width, height } = useMemo(() => {
    if ('fov' in camera) {
      const fov = (camera as PerspectiveCamera).fov
      const visibleHeight = 2 * Math.tan((fov * Math.PI / 180) / 2) * Math.abs(camera.position.z)
      const visibleWidth = visibleHeight * (camera as PerspectiveCamera).aspect
      return { width: visibleWidth, height: visibleHeight }
    }
    return { width: 20, height: 20 }
  }, [camera])

  const targetMin = -width / 2 + 1.5
  const targetMax = width / 2 - 1.5

  const iter = dados[iteracao]

  if (!iter) {
    console.error(`Iteração ${iteracao} não encontrada em:`, dados)
    return null
  }

  if (!Array.isArray(iter.criaturas)) {
    console.error("Criaturas não é um array:", iter)
    return null
  }

  const allEntities = useMemo(() => {
    const creatures = iter.criaturas.map(c => ({ ...c, type: 'criatura' }));
    const clusters = iter.clusters?.map(c => ({ ...c, type: 'cluster', idCriaturaRoubada: -1 })) || [];
    return [...creatures, ...clusters];
  }, [iter.criaturas, iter.clusters]);

  return (
    <>
      <PlanoDeFundo width={width} height={height} />
      {iter.criaturas.map((c: CriaturaDTO) => {
        const proximaIteracao = dados[iteracao + 1]
        const proximaCriatura = proximaIteracao?.criaturas.find(
          (nextC: CriaturaDTO) => nextC.id === c.id
        )
        return (
          <Criatura
            key={`criatura-${c.id}`}
            criatura={c}
            minX={minX}
            maxX={maxX}
            iteracao={iter.iteracao}
            proximaPosicao={proximaCriatura?.posicaox}
            targetMin={targetMin}
            targetMax={targetMax}
          />
        )
      })}

      {iter.clusters?.map((cluster: ClusterDTO) => {
        const proximaIteracao = dados[iteracao + 1]
        const proximoCluster = proximaIteracao?.clusters.find(
          (nextC: ClusterDTO) => nextC.id === cluster.id
        )
        const clusterAsCriatura = {
          ...cluster,
          idCriaturaRoubada: -1
        }
        return (
          <Criatura
            key={`cluster-${cluster.id}`}
            criatura={clusterAsCriatura}
            minX={minX}
            maxX={maxX}
            iteracao={iter.iteracao}
            proximaPosicao={proximoCluster?.posicaox}
            targetMin={targetMin}
            targetMax={targetMax}
            scale={5}
          />
        )
      })}

      {iter.guardiao && (() => {
        const guardiaoAsCriatura = {
          ...iter.guardiao,
          idCriaturaRoubada: -1, 
        };
        return (
          <Criatura
            key={`guardiao-${iter.guardiao.id}`}
            criatura={guardiaoAsCriatura}
            minX={minX}
            maxX={maxX}
            iteracao={iter.iteracao}
            proximaPosicao={dados[iteracao + 1]?.guardiao?.posicaox}
            targetMin={targetMin}
            targetMax={targetMax}
            scale={4}
          />
        );
      })()}

      {iter.criaturas.map((c: CriaturaDTO) => (
        <Ouro
          key={`ouro-${c.id}`}
          de={c.idCriaturaRoubada}
          para={c.id}
          iter={allEntities}
          minX={minX}
          maxX={maxX}
          targetMin={targetMin}
          targetMax={targetMax}
        />
      ))}
    </>
  )
}

export default function SimulacaoCanvas({ dados, onNovaSimulacao }: SimulacaoCanvasProps) {
  const [iteracao, setIteracao] = useState(0)

  const { minX, maxX } = useMemo(() => {
    let maxAbsX = 0;
    dados.forEach(iter => {
      iter.criaturas.forEach(c => {
        maxAbsX = Math.max(maxAbsX, Math.abs(c.posicaox));
      });
      iter.clusters?.forEach(cluster => {
        maxAbsX = Math.max(maxAbsX, Math.abs(cluster.posicaox));
      });
      if (iter.guardiao) {
        maxAbsX = Math.max(maxAbsX, Math.abs(iter.guardiao.posicaox));
      }
    });
    return { minX: -maxAbsX, maxX: maxAbsX };
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
        <h2 className="text-white text-xl font-bold mb-4">Informações da Iteração {iter.iteracao}</h2>
        <div className="space-y-4">
          <h3 className="text-white text-lg font-bold mb-2">Criaturas</h3>
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

          {iter.clusters && iter.clusters.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white text-lg font-bold mb-2">Clusters</h3>
              {iter.clusters.map((c: ClusterDTO) => (
                <div key={c.id} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-white font-bold">Cluster {c.id}</span>
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {iter.guardiao && (
            <div>
              <h3 className="text-white text-lg font-bold mb-2">Guardião</h3>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                    <span className="text-white font-bold">Guardião {iter.guardiao.id}</span>
                </div>
                <div className="text-gray-300 text-sm space-y-1">
                    <p className="flex justify-between">
                        <span>Posição:</span>
                        <span className="font-mono">{iter.guardiao.posicaox.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Ouro:</span>
                        <span className="font-mono">{iter.guardiao.ouro}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Cluster Eliminado:</span>
                        <span className="font-mono">{iter.guardiao.idClusterEliminado ?? 'N/A'}</span>
                    </p>
                </div>
              </div>
            </div>
          )}

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
            <Scene dados={dados} iteracao={iteracao} minX={minX} maxX={maxX} />
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
