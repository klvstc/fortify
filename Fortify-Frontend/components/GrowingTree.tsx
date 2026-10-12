import React, { useMemo } from 'react';

interface GrowingTreeProps {
  streakDays: number;
}

const HyperRealisticTreeSVG: React.FC<{ growth: number }> = ({ growth }) => {
  // --- Growth Stages ---
  const trunkProgress = useMemo(() => Math.min(growth / 0.20, 1), [growth]);
  const mainBranchProgress = useMemo(() => Math.min(Math.max(0, growth - 0.15) / 0.35, 1), [growth]);
  const secondaryBranchProgress = useMemo(() => Math.min(Math.max(0, growth - 0.40) / 0.40, 1), [growth]);
  const leafProgress = useMemo(() => Math.min(Math.max(0, growth - 0.60) / 0.40, 1), [growth]);

  const branchStyle = (length: number, progress: number) => ({
    strokeDasharray: length,
    strokeDashoffset: length * (1 - progress),
    transition: `stroke-dashoffset 2s cubic-bezier(0.42, 0, 0.58, 1)`,
  });
  
  const leafStyle = (delayFraction: number) => ({
    opacity: leafProgress > delayFraction ? 1 : 0,
    transform: `scale(${leafProgress > delayFraction ? 1 : 0.1})`,
    transition: `opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`,
    transformOrigin: '50% 100%',
    transitionDelay: `${delayFraction * 1}s`,
  });

  // More detailed leaf positions including rotation and scale
  const leafPositions = [
    { x: 135, y: 150, r: 10, s: 0.9 }, { x: 100, y: 110, r: -5, s: 1 },
    { x: 45, y: 190, r: 20, s: 0.8 }, { x: 60, y: 140, r: 5, s: 1.1 },
    { x: 160, y: 60, r: -15, s: 1 }, { x: 230, y: 80, r: 15, s: 0.9 },
    { x: 280, y: 130, r: 0, s: 1.2 }, { x: 250, y: 180, r: -20, s: 1 },
    { x: 340, y: 220, r: 25, s: 0.8 }, { x: 200, y: 25, r: 0, s: 1.1 },
    { x: 255, y: 45, r: 10, s: 1 }, { x: 150, y: 200, r: 30, s: 1 },
    { x: 180, y: 240, r: -10, s: 0.9 }, { x: 290, y: 250, r: 5, s: 1.1 },
    { x: 120, y: 280, r: 15, s: 1 }, { x: 210, y: 310, r: -25, s: 0.8 },
    { x: 80, y: 240, r: 45, s: 1.2 }
  ];

  return (
    <svg viewBox="0 0 400 500" className="w-full h-full overflow-visible">
      <defs>
        {/* Bark Texture Filter */}
        <filter id="barkTexture" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.1" numOctaves="4" seed="10" result="turbulence"/>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="6" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
          <feGaussianBlur in="displaced" stdDeviation="1.5" result="blurred"/>
          <feComponentTransfer in="blurred" result="lighting">
            <feFuncA type="table" tableValues="0 1 1 1 1 1 1 1 1 1 1 1"/>
          </feComponentTransfer>
          <feDiffuseLighting in="turbulence" lightingColor="#bcaaa4" surfaceScale="4" result="diffuseLight">
            <feDistantLight azimuth="45" elevation="45"/>
          </feDiffuseLighting>
          <feComposite in="lighting" in2="diffuseLight" operator="in" result="textured"/>
          <feComposite in="textured" in2="SourceGraphic" operator="arithmetic" k1="1.2" k2="0" k3="0" k4="0"/>
        </filter>

        {/* Oak Leaf Symbol */}
        <symbol id="realisticLeaf" viewBox="0 0 40 40">
            <defs>
                <radialGradient id="leafGradientRealistic" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#606c38" />
                    <stop offset="70%" stopColor="#283618" />
                    <stop offset="100%" stopColor="#283618" />
                </radialGradient>
                <linearGradient id="leafVein" x1="0.5" y1="0" x2="0.5" y2="1">
                     <stop offset="0%" stopColor="#dda15e" stopOpacity="0.7"/>
                     <stop offset="100%" stopColor="#bc6c25" stopOpacity="0.5"/>
                </linearGradient>
            </defs>
            <path d="M20 0 C 10 5, 5 15, 10 25 C 0 30, 5 40, 20 40 C 35 40, 40 30, 30 25 C 35 15, 30 5, 20 0 Z" fill="url(#leafGradientRealistic)"/>
            <path d="M20 0 V 40 M20 10 L 30 5 M20 10 L 10 5 M20 20 L 35 15 M20 20 L 5 15 M20 30 L 30 25 M20 30 L 10 25 M20 35 L 25 32 M20 35 L 15 32" stroke="url(#leafVein)" strokeWidth="0.5" fill="none" />
        </symbol>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="200" cy="495" rx="150" ry="20" fill="black" opacity="0.3" filter="url(#feGaussianBlur)" style={{ opacity: growth * 0.3, transition: 'opacity 2s' }}/>

      {/* Ground */}
      <path d="M-50 500 Q200 480 450 500 H-50 Z" fill="#585149" />

      {/* Tree Structure */}
      <g stroke="#58412d" strokeLinecap="round" filter="url(#barkTexture)">
        {/* Trunk and Roots */}
        <path d="M200,500 C 180,495 150,498 130,500 M200,500 C 220,495 250,498 270,500 M200,500 V350 Q 190 250 200 100" strokeWidth="25" style={branchStyle(550, trunkProgress)} />
        
        {/* Main Branches */}
        <g style={branchStyle(1, mainBranchProgress)}>
          <path d="M200,340 C 150,320 80,250 60,180" strokeWidth="18" />
          <path d="M200,320 C 250,310 300,280 320,210" strokeWidth="20" />
          <path d="M200,180 C 180,160 150,120 160,70" strokeWidth="15" />
          <path d="M200,150 C 220,140 250,100 250,50" strokeWidth="13" />
        </g>

        {/* Secondary Branches */}
        <g style={branchStyle(1, secondaryBranchProgress)}>
           <path d="M70,200 C 40,150 90,130" strokeWidth="10" />
           <path d="M310,240 C 350,200 330,150" strokeWidth="12" />
           <path d="M165,80 C 130,40 180,30" strokeWidth="8" />
           <path d="M250,60 C 280,30 240,20" strokeWidth="7" />
        </g>
      </g>
      
      {/* Leaves */}
      <g>
        {leafPositions.map((p, i) => (
          <g key={i} style={leafStyle(i / leafPositions.length)} transform={`translate(${p.x}, ${p.y}) rotate(${p.r}) scale(${p.s})`}>
              <use href="#realisticLeaf" width="40" height="40"/>
          </g>
        ))}
      </g>
    </svg>
  );
};

const GrowingTree: React.FC<GrowingTreeProps> = ({ streakDays }) => {
  const growth = Math.min(streakDays / 365, 1);

  return (
    <div className="w-full bg-slate-800/50 rounded-xl p-6 flex flex-col items-center gap-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-radial-gradient from-slate-700/60 to-transparent" 
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0) 70%)', opacity: growth, transition: 'opacity 2s' }}
      ></div>
      <h3 className="text-lg font-semibold text-white z-10">The Oak of Resolve</h3>
      <p className="text-sm text-slate-300 text-center -mt-2 mb-2 z-10">A hyper-realistic oak, its growth mirroring your own resilience and strength.</p>
      <div className="w-full max-w-sm h-72 relative">
        <div className="absolute inset-0">
          <HyperRealisticTreeSVG growth={growth} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(GrowingTree);