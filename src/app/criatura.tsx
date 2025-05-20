'use client'
import { CriaturaDTO } from '@/api'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import { Texture, TextureLoader, Group } from 'three'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

interface CriaturaProps {
  criatura: CriaturaDTO
  minX: number
  maxX: number
  iteracao: number
  proximaPosicao?: number
}

function normalizarX(x: number, minX: number, maxX: number, targetMin = -10, targetMax = 10) {
  if (maxX === minX) return 0;
  return ((x - minX) / (maxX - minX)) * (targetMax - targetMin) + targetMin;
}

// Sequência de frames para a animação de pulo
const JUMP_FRAMES = [
  'Jump (1).png',  // Preparação para o pulo
  'Jump (2).png',
  'Jump (3).png',
  'Jump (4).png',
  'Jump (5).png',  // Subindo
  'Jump (6).png',
  'Jump (7).png',  // Ponto mais alto
  'Jump (8).png',
  'Jump (9).png',  // Descendo
  'Jump (10).png',
  'Jump (11).png',
  'Jump (12).png'  // Aterrissagem
];

export default function Criatura({ criatura, minX, maxX, iteracao, proximaPosicao }: CriaturaProps) {
  const ref = useRef<THREE.Sprite>(null)
  const groupRef = useRef<Group>(null)
  const [texture, setTexture] = useState<Texture | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [jumpStartTime, setJumpStartTime] = useState(0)
  const [lastIteracao, setLastIteracao] = useState(iteracao)
  const jumpDuration = 0.5 // Reduzido para movimento mais rápido

  useEffect(() => {
    // Detecta mudança real de iteração
    if (iteracao !== lastIteracao) {
      setIsJumping(true)
      setJumpStartTime(Date.now())
      setCurrentFrame(0)
      setLastIteracao(iteracao)
    }
  }, [iteracao, lastIteracao])

  useEffect(() => {
    loadFrame('Idle1.png')
  }, [])

  const loadFrame = (frameName: string) => {
    const spritePath = `/freedinosprite/png/${frameName}`
    new TextureLoader().load(spritePath, (t) => setTexture(t))
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.scale.set(3, 3, 1)
    }
  }, [texture])

  useFrame(({ clock }) => {
    if (!groupRef.current || !criatura) return

    // Define a altura base das criaturas
    const posicaoBaseY = -1.5 // Ajuste este valor para mover as criaturas para cima (-) ou para baixo (+)

    // Sempre atualiza para a posição atual correta
    const posicaoAtual = normalizarX(criatura.posicaox, minX, maxX)
    groupRef.current.position.x = posicaoAtual

    if (isJumping) {
      const currentTime = Date.now()
      const jumpElapsed = (currentTime - jumpStartTime) / 1000
      const jumpProgress = Math.min(jumpElapsed / jumpDuration, 1)

      // Altura do pulo mais rápida e natural, partindo da posição base
      const jumpHeight = Math.sin(Math.PI * jumpProgress) * 1.5
      groupRef.current.position.y = posicaoBaseY + jumpHeight

      // Atualiza o frame da animação
      const frameIndex = Math.min(
        Math.floor(jumpProgress * JUMP_FRAMES.length),
        JUMP_FRAMES.length - 1
      )

      if (frameIndex !== currentFrame) {
        setCurrentFrame(frameIndex)
        loadFrame(JUMP_FRAMES[frameIndex])
      }

      // Finaliza o pulo
      if (jumpProgress >= 1) {
        setIsJumping(false)
        loadFrame('Idle1.png')
      }
    } else {
      // Movimento suave quando não está pulando, também partindo da posição base
      const idleMovement = Math.sin(clock.getElapsedTime() * 2) * 0.1
      groupRef.current.position.y = posicaoBaseY + idleMovement
    }
  })

  return texture ? (
    <group ref={groupRef}>
      <sprite ref={ref} scale={[3, 3, 1]}>
        <spriteMaterial map={texture} />
      </sprite>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.15}
        outlineColor="#FFFFFF"
        strokeWidth={0.5}
        strokeColor="#000000"
      >
        {criatura.id}
      </Text>
    </group>
  ) : null
}