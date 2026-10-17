import { useEffect, useRef, useState } from 'react';
import { cakes, getCake } from '../data/cardapio';
import { usePrefersReducedMotion } from '../hooks';
import { CakeStage, supportsWebGL, type StageMode } from '../three/stage';

interface Props {
  cakeId: string;
  mode: StageMode;
  label: string;
  introDelay?: number;
  /** Monta os outros bolos em segundo plano para a troca ser instantânea. */
  prewarm?: boolean;
  className?: string;
}

export default function CakeCanvas({ cakeId, mode, label, introDelay, prewarm, className = '' }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<CakeStage | null>(null);
  const latestId = useRef(cakeId);
  const [supported] = useState(supportsWebGL);
  const [ready, setReady] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !supported) return;
    const stage = new CakeStage(host, {
      mode,
      reducedMotion,
      introDelay,
      onReady: () => setReady(true),
    });
    stageRef.current = stage;
    const id = latestId.current;
    stage.setCake(id, getCake(id).look);
    if (prewarm) stage.prewarm(cakes.filter((c) => c.id !== id).map((c) => ({ id: c.id, look: c.look })));
    return () => {
      stage.dispose();
      stageRef.current = null;
    };
  }, [mode, reducedMotion, introDelay, prewarm, supported]);

  useEffect(() => {
    latestId.current = cakeId;
    stageRef.current?.setCake(cakeId, getCake(cakeId).look);
  }, [cakeId]);

  if (!supported) {
    return (
      <div className={`cake-host cake-host--fallback ${className}`} role="img" aria-label={label}>
        <img src="/favicon-bolo.png" alt="" width={96} height={96} />
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={`cake-host ${ready ? 'is-ready' : ''} ${className}`}
      role="group"
      aria-roledescription="visualização 3D"
      aria-label={`${label}. Arraste ou use as setas para girar.`}
      tabIndex={0}
    />
  );
}
