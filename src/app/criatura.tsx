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
  targetMin: number
  targetMax: number
  scale?: number
  displayText?: string
}

function normalizarX(x: number, minX: number, maxX: number, targetMin: number, targetMax: number) {
  if (maxX === minX) return 0;
  return ((x - minX) / (maxX - minX)) * (targetMax - targetMin) + targetMin;
}

const JUMP_FRAMES = [
  'Jump (1).png',
  'Jump (2).png',
  'Jump (3).png',
  'Jump (4).png',
  'Jump (5).png', 
  'Jump (6).png',
  'Jump (7).png', 
  'Jump (8).png',
  'Jump (9).png',
  'Jump (10).png',
  'Jump (11).png',
  'Jump (12).png'
];

export default function Criatura({ criatura, minX, maxX, iteracao, targetMin, targetMax, scale = 3, displayText }: CriaturaProps) {
  const ref = useRef<THREE.Sprite>(null)
  const groupRef = useRef<Group>(null)
  const [texture, setTexture] = useState<Texture | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [jumpStartTime, setJumpStartTime] = useState(0)
  const [lastIteracao, setLastIteracao] = useState(iteracao)
  const jumpDuration = 0.8

  useEffect(() => {
    
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
      ref.current.scale.set(scale, scale, 1)
    }
  }, [texture, scale])

  useFrame(({ clock }) => {
    if (!groupRef.current || !criatura) return

    const groundY = -3;
    const posicaoBaseY = groundY + (scale / 2);


    const posicaoAtual = normalizarX(criatura.posicaox, minX, maxX, targetMin, targetMax)
    groupRef.current.position.x = posicaoAtual

    if (isJumping) {
      const currentTime = Date.now()
      const jumpElapsed = (currentTime - jumpStartTime) / 1000
      const jumpProgress = Math.min(jumpElapsed / jumpDuration, 1)

      const jumpHeight = Math.sin(Math.PI * jumpProgress) * 1.5
      groupRef.current.position.y = posicaoBaseY + jumpHeight

      const frameIndex = Math.min(
        Math.floor(jumpProgress * JUMP_FRAMES.length),
        JUMP_FRAMES.length - 1
      )

      if (frameIndex !== currentFrame) {
        setCurrentFrame(frameIndex)
        loadFrame(JUMP_FRAMES[frameIndex])
      }

      if (jumpProgress >= 1) {
        setIsJumping(false)
        loadFrame('Idle1.png')
      }
    } else {

      const idleMovement = Math.sin(clock.getElapsedTime() * 2) * 0.1
      groupRef.current.position.y = posicaoBaseY + idleMovement
    }
  })
  return texture ? (
    <group ref={groupRef}>
      <sprite ref={ref} scale={[scale, scale, 1]}>
        <spriteMaterial map={texture} />
      </sprite>
      <Text
        position={[0, scale / 2 + 0.5, 0]}
        fontSize={0.8}
        color={displayText ? "white" : `hsl(${criatura.id * 30}, 70%, 50%)`}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.15}
        outlineColor="#FFFFFF"
        strokeWidth={0.5}
        strokeColor={displayText ? "white" : `hsl(${criatura.id * 30}, 70%, 50%)`}

        
      >
        {displayText ?? criatura.id}
      </Text>
    </group>
  ) : null
}