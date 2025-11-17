 "use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';

// تعريف الألوان النيونية
const NEON_COLORS = {
  DARK_BG: '#030307',
  DARK_CARD: '#0a0a13',
  NEON_BLUE: '#00f6ff',
  NEON_PINK: '#ff00aa',
  MEDIUM_GRAY: '#a0a0a0',
};

// --- Three.js Background Component ---

const NeonBackground: React.FC<{ isLoaded: boolean }> = ({ isLoaded }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // ✅ تم التصحيح: يجب توفير قيمة أولية لـ useRef (مثل null)
  const animationFrameRef = useRef<number | null>(null);

  const initThree = useCallback((THREE: any) => {
    if (!mountRef.current) return;

    const WIDTH = 10;
    const HEIGHT = 10;
    const SEGMENTS = 40;
    const COLOR_PINK = NEON_COLORS.NEON_PINK.replace('#', '0x');
    const COLOR_BLUE = NEON_COLORS.NEON_BLUE.replace('#', '0x');

    let scene: any, camera: any, renderer: any, clothMesh: any;
    const clock = new THREE.Clock();
    const container = mountRef.current;

    const createCloth = () => {
      const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, SEGMENTS, SEGMENTS);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(parseInt(COLOR_PINK, 16)),
        wireframe: true,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });

      clothMesh = new THREE.Mesh(geometry, material);
      clothMesh.rotation.x = -Math.PI / 2;
      clothMesh.position.y = 0;
      clothMesh.position.z = -5;

      scene.add(clothMesh);
    };

    const updateCloth = (elapsedTime: number) => {
      if (!clothMesh) return;

      const positions = clothMesh.geometry.attributes.position.array as Float32Array;
      const waveSpeed = 0.5;
      const waveIntensity = 1.0;

      for (let i = 0; i < positions.length; i += 3) {
        const zOffset = Math.sin(positions[i] * 0.7 + elapsedTime * waveSpeed) * Math.cos(positions[i + 1] * 0.7 + elapsedTime * waveSpeed * 0.8) * waveIntensity * 0.3;
        positions[i + 2] = zOffset;
      }

      clothMesh.geometry.attributes.position.needsUpdate = true;

      const colorBlend = (Math.sin(elapsedTime * 0.2) + 1) / 2;
      const startColor = new THREE.Color(parseInt(COLOR_BLUE, 16));
      const endColor = new THREE.Color(parseInt(COLOR_PINK, 16));
      const color = startColor.lerp(endColor, colorBlend);
      clothMesh.material.color.set(color);
    };

    const onWindowResize = () => {
      if (camera && renderer && container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    };

    // 1. إعداد المشهد
    scene = new THREE.Scene();
    // 2. إعداد الكاميرا
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 1;
    camera.rotation.x = -0.1;

    // 3. إعداد المخرج (Renderer)
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    createCloth();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      updateCloth(elapsedTime);
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // دالة التنظيف (Cleanup function)
    return () => {
      if (animationFrameRef.current !== null) { // التحقق من القيمة
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', onWindowResize);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
      scene.children.forEach((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
        scene.remove(child);
      });
    };
  }, []);

  // استخدام useEffect لتشغيل دالة التهيئة فقط بعد تحميل المكتبة
  useEffect(() => {
    let cleanupFunc: () => void = () => {};
    if (isLoaded && typeof (window as any).THREE !== 'undefined') {
      try {
        cleanupFunc = initThree((window as any).THREE) as () => void;
      } catch (e) {
        console.error("Failed to initialize Three.js:", e);
      }
    }
    
    return () => cleanupFunc();

  }, [initThree, isLoaded]);

  // لا نعرض الخلفية إذا لم تكن المكتبة محملة بعد لمنع الأخطاء
  if (!isLoaded) {
    return null;
  }

  return (
    <div 
      ref={mountRef} 
      id="three-container" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 0.4,
      }}
    />
  );
};

// --- Icons (Lucide-inspired) ---

const IconZap = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);

const IconEye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const IconShieldCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check">
        <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7c0 4.7 3 7.8 8 9-5-1.2-8-4.3-8-9"/>
        <path d="m9 12 2 2 4-4"/>
    </svg>
);

// --- Card Component ---

const Card = ({ icon: Icon, title, description, iconColor }: { icon: React.FC, title: string, description: string, iconColor: string }) => (
    <article className="rounded-xl p-6 md:p-8 hover:bg-[#151525] transition-colors duration-300"
        style={{
            backgroundColor: NEON_COLORS.DARK_CARD,
            borderColor: '#1a1a2e',
            borderWidth: '1px',
            boxShadow: `0 0 1px #1a1a2e`,
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}
        // إضافة تأثير التوهج عند التمرير
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = NEON_COLORS.NEON_PINK;
            e.currentTarget.style.boxShadow = `0 0 15px rgba(255, 0, 170, 0.3)`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1a1a2e';
            e.currentTarget.style.boxShadow = `0 0 1px #1a1a2e`;
        }}
    >
        <div className={`text-4xl mb-4`} style={{ color: iconColor }}>
            <Icon />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="leading-relaxed" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
            {description}
        </p>
    </article>
);


// --- Main App Component ---

export default function App() {
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);

  // useEffect لتحميل مكتبة Three.js بشكل ديناميكي
  useEffect(() => {
    // التحقق لمنع إعادة التحميل إذا كانت المكتبة موجودة بالفعل
    if ((window as any).THREE) {
      setIsThreeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => {
      setIsThreeLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Three.js script.");
    };

    document.head.appendChild(script);

    return () => {
      // التنظيف: إزالة السكريبت عند تفكيك المكون
      if (document.head.contains(script)) {
         document.head.removeChild(script);
      }
    };
  }, []);


  // تعريف الأنماط المخصصة
  const customStyles: React.CSSProperties = {
    '--neon-blue': NEON_COLORS.NEON_BLUE,
    '--neon-pink': NEON_COLORS.NEON_PINK,
    '--dark-bg': NEON_COLORS.DARK_BG,
    '--medium-gray': NEON_COLORS.MEDIUM_GRAY,
    fontFamily: 'Inter, sans-serif'
  } as React.CSSProperties;

  // كلاس التوهج للنص
  const neonGlowClass = 'drop-shadow-[0_0_10px_rgba(0,246,255,0.5)] drop-shadow-[0_0_20px_rgba(255,0,170,0.4)]';
  
  // كلاسات زر التوهج
  const btnNeonClass = 'transition-all duration-300 ease-in-out hover:scale-[1.05] shadow-[0_0_10px_rgba(0,246,255,0.8),_0_0_4px_rgba(0,246,255,0.5)] hover:shadow-[0_0_20px_var(--neon-blue),_0_0_8px_var(--neon-blue)]';

  return (
    <div style={{ backgroundColor: NEON_COLORS.DARK_BG, minHeight: '100vh', ...customStyles }} dir="rtl">
        
      {/* تضمين خلفية Three.js، يتم عرضها فقط بعد التحميل */}
      <NeonBackground isLoaded={isThreeLoaded} />
      
      {/* المحتوى الرئيسي */}
      <main className="relative z-10 container mx-auto max-w-6xl px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        
        {/* قسم الهوية الرئيسية (Hero) */}
        <section className="text-center mb-20">
          
          {/* الشعار */}
          <div className="mb-16">
            <a href="#" className={`text-5xl font-extrabold transition-colors text-white ${neonGlowClass}`} style={{ color: NEON_COLORS.NEON_BLUE }}>
                    a.m sherif      
            </a>
          </div>


          <p className="text-lg font-semibold mb-4" style={{ color: NEON_COLORS.NEON_PINK }}>
            | نحن نغير قواعد اللعبة |
          </p>
          <h1 className={`text-5xl md:text-7xl font-black mb-6 text-white ${neonGlowClass}`}>
            بناء الجيل القادم من التكنولوجيا
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto leading-relaxed" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
            "  a.m sherif " هو متجر إلكترونيات عملاق، ليس مجرد نقطة بيع، بل مركز للابتكار.
            نحن ملتزمون بتوفير أحدث وأندر الأجهزة، مدعومين بفريق من خبراء التقنية المستعدين لتوجيهك نحو المستقبل الرقمي الأمثل.
          </p>
          <div className="flex justify-center">
            {/* زر دعوة للعمل رئيسي */}
            <a href="#" 
               className={`px-10 py-3 font-extrabold rounded-full tracking-wider border-2 border-transparent ${btnNeonClass}`}
               style={{ backgroundColor: NEON_COLORS.NEON_BLUE, color: NEON_COLORS.DARK_BG }}>
              اكتشف مسيرتنا
            </a>
          </div>
        </section>

        {/* قسم مهمتنا ورؤيتنا وقيمنا (3 أعمدة شبكية) */}
        <section className="mt-24 grid md:grid-cols-3 gap-8">
          
          <Card 
            icon={IconZap} 
            title="مهمتنا: الريادة التقنية" 
            description="توفير أفضل تجربة تسوق تقنية لعملائنا عبر إتاحة أحدث المنتجات من مصادرها الأصلية وبأسعار تنافسية، مع ضمان الدعم الفني اللازم." 
            iconColor={NEON_COLORS.NEON_BLUE}
          />
          
          <Card 
            icon={IconEye} 
            title="رؤيتنا: مستقبل مُتاح" 
            description="أن نكون الخيار الأول والوجهة الموثوقة للتكنولوجيا في المنطقة، وأن نساهم في بناء مجتمع رقمي واع ومُتطور." 
            iconColor={NEON_COLORS.NEON_PINK}
          />

          <Card 
            icon={IconShieldCheck} 
            title="قيمنا: المصداقية والجودة" 
            description="الشفافية في التعامل، الجودة التي لا تقبل المساومة، والتركيز المطلق على إرضاء العميل وتحقيق توقعاته." 
            iconColor={NEON_COLORS.NEON_BLUE}
          />
        </section>

        {/* قسم موجز حول التأسيس والانتشار */}
        <section className="mt-24 p-8 md:p-16 rounded-2xl shadow-2xl" 
                 style={{ backgroundColor: NEON_COLORS.DARK_CARD, 
                          borderColor: NEON_COLORS.NEON_BLUE, 
                          borderWidth: '1px', 
                          boxShadow: `0 0 10px ${NEON_COLORS.NEON_BLUE}1A` }}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-6">
            قصة بدأت برؤية طموحة
          </h2>
          <p className="text-xl text-center max-w-4xl mx-auto leading-loose" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
            منذ التأسيس في عام 2014، كانت رحلتنا مدفوعة بشغف لا ينتهي بالتكنولوجيا. بدأنا بمتجر صغير، ووصلنا اليوم إلى شبكة واسعة من الفروع في عدة مدن، ومتجر إلكتروني يخدم الآلاف يومياً. نجاحنا هو انعكاس لالتزامنا الثابت بتقديم الأفضل.
          </p>
        </section>

      </main>

      {/* التذييل */}
      <footer className="relative z-10 text-center py-8 border-t border-gray-900 mt-16">
        <p className="text-sm" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
          © 2014 -  a.m sherif. شريكك الدائم في عالم التكنولوجيا.
        </p>
      </footer>

    </div>
  );
}