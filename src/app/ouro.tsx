'use client'
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { TextureLoader, Texture, Vector3, Sprite } from 'three'
import { CriaturaDTO } from '@/api'

interface OuroProps {
  de: number | null
  para: number
  iter: CriaturaDTO[]
  minX: number
  maxX: number
  targetMin: number
  targetMax: number
}

function normalizarX(x: number, minX: number, maxX: number, targetMin: number, targetMax: number) {
  if (maxX === minX) return 0;
  return ((x - minX) / (maxX - minX)) * (targetMax - targetMin) + targetMin;
}

export default function Ouro({ de, para, iter, minX, maxX, targetMin, targetMax }: OuroProps) {
  const ref = useRef<Sprite>(null)
  const [start, setStart] = useState<Vector3 | null>(null)
  const [end, setEnd] = useState<Vector3 | null>(null)
  const [, setT] = useState(0)
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    if (!Array.isArray(iter) || iter.length === 0) {
      console.log("Array de criaturas vazio ou inválido")
      return
    }

    if (de === null || de === undefined) {
      return
    }

    const origem = iter.find((c) => c.id === de)
    const destino = iter.find((c) => c.id === para)

    if (origem && destino) {
      setStart(new Vector3(normalizarX(origem.posicaox, minX, maxX, targetMin, targetMax), -1.5, 0))
      setEnd(new Vector3(normalizarX(destino.posicaox, minX, maxX, targetMin, targetMax), -1.5, 0))
    } else {
      console.log(`Criatura de origem (${de}) ou destino (${para}) não encontrada`)
    }

    new TextureLoader().load('/Gold/Gold_1.png', 
      (loadedTexture) => setTexture(loadedTexture),
      undefined,
      (error) => {
        console.error("Erro ao carregar textura de ouro:", error)
        const canvas = document.createElement('canvas')
        canvas.width = 16
        canvas.height = 16
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = 'gold'
          ctx.fillRect(0, 0, 16, 16)
          const fallbackTexture = new TextureLoader().load(canvas.toDataURL())
          setTexture(fallbackTexture)
        }
      }
    )
    
    setT(0)
  }, [de, para, iter, minX, maxX, targetMin, targetMax])

  useEffect(() => {
    if (ref.current) {
      ref.current.scale.set(0.75, 0.75 , 1)
    }
  }, [texture])

  useFrame((_, delta) => {
    if (start && end && ref.current) {
      // Move a lógica de animação para fora do setState
      // e usa o delta para uma animação mais suave e independente de frame rate
      const t = ref.current.userData.t || 0;
      const novoT = Math.min(t + delta * 2, 1); // Ajuste a velocidade multiplicando delta
      ref.current.userData.t = novoT;

      const atual = start.clone().lerp(end, novoT);
      ref.current.position.copy(atual);
    }
  });

  if (!start || !end || !texture) return null

  return (
    <sprite ref={ref}>
      <spriteMaterial map={texture} />
    </sprite>
  )
}