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
}

function normalizarX(x: number, minX: number, maxX: number, targetMin = -10, targetMax = 10) {
  if (maxX === minX) return 0;
  return ((x - minX) / (maxX - minX)) * (targetMax - targetMin) + targetMin;
}

export default function Ouro({ de, para, iter, minX, maxX }: OuroProps) {
  const ref = useRef<Sprite>(null)
  const [start, setStart] = useState<Vector3 | null>(null)
  const [end, setEnd] = useState<Vector3 | null>(null)
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    // Proteção contra undefined
    if (!Array.isArray(iter) || iter.length === 0) {
      console.log("Array de criaturas vazio ou inválido")
      return
    }

    // Não exibir ouro quando não há roubo
    if (de === null || de === undefined) {
      return
    }

    const origem = iter.find((c) => c.id === de)
    const destino = iter.find((c) => c.id === para)

    if (origem && destino) {
      setStart(new Vector3(normalizarX(origem.posicaox, minX, maxX), -1.5, 0))
      setEnd(new Vector3(normalizarX(destino.posicaox, minX, maxX), -1.5, 0))
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
  }, [de, para, iter, minX, maxX])

  useEffect(() => {
    if (ref.current) {
      ref.current.scale.set(0.75, 0.75 , 1) // Diminuindo a escala das moedas para 0.5
    }
  }, [texture])

  useFrame(() => {
    if (start && end && ref.current) {
      // Animação da posição da sprite pode ser feita aqui se necessário
    }
  })

  if (!start || !end || !texture) return null

  return (
    <sprite ref={ref}>
      <spriteMaterial map={texture} />
    </sprite>
  )
}