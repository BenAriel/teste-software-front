'use client'
import { CriaturaDTO } from '@/api'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import { Texture, TextureLoader } from 'three'
import * as THREE from 'three'

interface CriaturaProps {
  criatura: CriaturaDTO
  minX: number
  maxX: number
}

function normalizarX(x: number, minX: number, maxX: number, targetMin = -10, targetMax = 10) {
  if (maxX === minX) return 0;
  return ((x - minX) / (maxX - minX)) * (targetMax - targetMin) + targetMin;
}

export default function Criatura({ criatura, minX, maxX }: CriaturaProps) {
  const ref = useRef<THREE.Sprite>(null)
  const [texture, setTexture] = useState<Texture | null>(null)
  const spritePath = `/freedinosprite/png/Idle1.png`

  useEffect(() => {
    new TextureLoader().load(spritePath, (t) => setTexture(t))
  }, [spritePath])

  useEffect(() => {
    if (ref.current) {
      ref.current.scale.set(3, 3, 1) //ajuste do tamanho do dino é feito aqui
    }
  }, [texture])

  useFrame(({ clock }) => {
    if (ref.current && criatura) {
      const time = clock.getElapsedTime()
      const altura = Math.sin(time * 5 + criatura.id) * 0.2
      ref.current.position.x = normalizarX(criatura.posicaox, minX, maxX)
      ref.current.position.y = altura
    }
  })

  return texture ? (
    <sprite ref={ref}>
      <spriteMaterial map={texture} />
    </sprite>
  ) : null
}