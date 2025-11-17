 "use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';

// --- الألوان الجديدة: نيون سيان وماجنتا (لأفخم وأفشخ إحساس) ---
const NEON_COLORS = {
  DARK_BG: '#000003', // خلفية سوداء فائقة العمق
  DARK_CARD: '#0d031c', // خلفية بطاقة داكنة جداً
  HYPER_CYAN: '#00FFFF', // سيان نيون فائق
  VIBRANT_MAGENTA: '#FF00FF', // ماجنتا نيون نابض بالحياة
  TEXT_LIGHT: '#b3e0ff', // لون نص فاتح
};

// --- Three.js Liquid Energy Field Background Component ---

const LiquidEnergyField: React.FC<{ isLoaded: boolean }> = ({ isLoaded }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // دالة تهيئة Three.js
  const initThree = useCallback(() => {
    if (!mountRef.current) return;

    // التصريح بنوع البيانات عبر window.THREE كحل مؤقت
    const THREE = (window as any).THREE; 
    if (!THREE) {
        console.error("THREE.js is not available on window.");
        return;
    }

    let scene: any, camera: any, renderer: any, particleSystem: any;
    const clock = new THREE.Clock();
    const container = mountRef.current;
    
    // تحويل الألوان
    const COLOR_CYAN = new THREE.Color(NEON_COLORS.HYPER_CYAN);
    const COLOR_MAGENTA = new THREE.Color(NEON_COLORS.VIBRANT_MAGENTA);

    // متغيرات النظام
    const numParticles = 25000; 
    const fieldSize = 600; 
    const speedFactor = 0.03; // تم تقليل السرعة لتخفيف الحركة
    const particleData: { offset: number, velocity: any }[] = []; 

    const createParticleSystem = () => {
      const positions = new Float32Array(numParticles * 3);
      const colors = new Float32Array(numParticles * 3);
      const sizes = new Float32Array(numParticles);

      for (let i = 0; i < numParticles; i++) {
        const i3 = i * 3;
        // توزيع الجزيئات في مجال واسع
        positions[i3 + 0] = (Math.random() - 0.5) * fieldSize;
        positions[i3 + 1] = (Math.random() - 0.5) * fieldSize;
        positions[i3 + 2] = (Math.random() - 0.5) * fieldSize;
        
        // تلوين الجزيئات بمزيج من السيان والماجنتا
        const factor = Math.random();
        const color = COLOR_CYAN.clone().lerp(COLOR_MAGENTA, factor);
        color.toArray(colors, i * 3);
        
        sizes[i] = Math.random() * 2 + 0.5; // أحجام أقل وأكثر واقعية
        
        // بيانات الحركة السائلة
        particleData.push({ 
            offset: Math.random() * 100,
            velocity: new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().multiplyScalar(0.01)
        });
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      const material = new THREE.PointsMaterial({
        size: 3, 
        vertexColors: true,
        blending: THREE.AdditiveBlending, 
        transparent: true,
        sizeAttenuation: true,
        depthWrite: false,
        opacity: 0.6, // تقليل الأوباسيتي لتخفيف التوهج العام
      });

      particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);
    };

    const updateSystem = (elapsedTime: number) => {
        if (!particleSystem) return;

        // دوران المشهد الكلي ببطء
        scene.rotation.y = elapsedTime * 0.005; // أبطأ بكثير
        
        // حركة الكاميرا الطفيفة
        camera.position.x = Math.sin(elapsedTime * 0.1) * 30; // حركة أقل
        camera.position.y = Math.cos(elapsedTime * 0.1) * 30;
        camera.lookAt(scene.position);

        const positions = particleSystem.geometry.attributes.position.array;
        
        // تطبيق الحركة السائلة المعقدة
        for (let i = 0; i < numParticles; i++) {
            const i3 = i * 3;
            const data = particleData[i];

            // تطبيق "تموج" متزايد يعتمد على الوقت والإزاحة
            const wave = Math.sin(elapsedTime * 0.8 + data.offset) * 0.3; // قوة تموج أقل

            // تحديث الموضع بناءً على السرعة الأصلية والتموج
            positions[i3 + 0] += data.velocity.x * wave * speedFactor;
            positions[i3 + 1] += data.velocity.y * wave * speedFactor;
            positions[i3 + 2] += data.velocity.z * wave * speedFactor;
            
            // إعادة تدوير الجزيئات التي تخرج عن الحدود
            if (positions[i3 + 0] > fieldSize / 2) positions[i3 + 0] = -fieldSize / 2;
            if (positions[i3 + 0] < -fieldSize / 2) positions[i3 + 0] = fieldSize / 2;
            if (positions[i3 + 1] > fieldSize / 2) positions[i3 + 1] = -fieldSize / 2;
            if (positions[i3 + 1] < -fieldSize / 2) positions[i3 + 1] = fieldSize / 2;
            if (positions[i3 + 2] > fieldSize / 2) positions[i3 + 2] = -fieldSize / 2;
            if (positions[i3 + 2] < -fieldSize / 2) positions[i3 + 2] = fieldSize / 2;
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // تأثير نبض خفيف على الإضاءة (التوهج الكوني يتنفس)
        const pulse = 0.5 + 0.5 * Math.sin(elapsedTime * 0.3);
        particleSystem.material.opacity = 0.5 + 0.2 * pulse; // تقليل النبض
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
    scene.fog = new THREE.FogExp2(NEON_COLORS.DARK_BG, 0.003); 

    // 2. إعداد الكاميرا
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 300; 

    // 3. إعداد المخرج (Renderer)
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setClearColor(NEON_COLORS.DARK_BG, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    createParticleSystem();

    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      updateSystem(elapsedTime);
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // دالة التنظيف
    return () => {
      if (animationFrameRef.current !== null) {
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

  // استخدام useEffect لتشغيل دالة التهيئة بعد تحميل المكتبة
  useEffect(() => {
    let cleanupFunc: () => void = () => {};
    // التحقق من أن المكتبة محملة وموجودة على كائن window
    if (isLoaded && typeof (window as any).THREE !== 'undefined') {
      try {
        // لا يتم تمرير أي معامل هنا
        cleanupFunc = initThree() as () => void;
      } catch (e) {
        console.error("Failed to initialize Three.js:", e);
      }
    }
    
    return () => cleanupFunc();

  }, [initThree, isLoaded]); 

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
        opacity: 0.7, // تقليل الشفافية الكلية للخلفية
      }}
    />
  );
};

// --- Product Data Mockup (بيانات منتجات بلهجة عادية) ---

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    tag: 'جديد' | 'خاص' | 'محدود';
    imagePlaceholder: string;
}

const mockProducts: Product[] = [
    {
        id: 1,
        name: "معالج الذاكرة السري (Q-Processor)",
        description: "أقوى شريحة لتشغيل البرامج الثقيلة والألعاب الجديدة بدون تعليق.",
        price: "9,999 $",
        tag: 'خاص',
        imagePlaceholder: "200x200/000000/00FFFF?text=QPU",
    },
    {
        id: 2,
        name: "نظارة الواقع الافتراضي الفخمة (VR7)",
        description: "تجربة بصرية خرافية ودقة ألوان غير طبيعية، بتحس إنك جوا اللعبة.",
        price: "3,450 $",
        tag: 'جديد',
        imagePlaceholder: "200x200/000000/FF00FF?text=VR7",
    },
    {
        id: 3,
        name: "ساعة متابعة النشاط (Link)",
        description: "بتربط كل أجهزتك ببعض وبتخليك دايماً في المود، شكلها تحفة و عملية.",
        price: "1,200 $",
        tag: 'محدود',
        imagePlaceholder: "200x200/000000/00FFFF?text=Link",
    },
    {
        id: 4,
        name: "الروبوت المساعد للمنزل (A-100)",
        description: "بيساعدك في كل مهام البيت و بيحلل بياناتك عشان تعرف إيه اللي محتاجه بيتك بالظبط.",
        price: "5,800 $",
        tag: 'خاص',
        imagePlaceholder: "200x200/000000/FF00FF?text=A-100",
    },
];

// --- Product Card Component (Dimensional Shift / Fantastical) ---

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    // تحديد لون التوهج بناءً على الـ Tag
    const tagColor = product.tag === 'خاص' ? NEON_COLORS.VIBRANT_MAGENTA : 
                     product.tag === 'جديد' ? NEON_COLORS.HYPER_CYAN : 
                     '#ff9900'; 

    
    // كلاس زر الشراء المتوهج
    const buyBtnClass = `mt-4 py-3 px-8 w-full font-bold rounded-xl tracking-wider transition-all duration-300 ease-in-out border-2 hover:scale-[1.02]`;
    const buyBtnStyle = { 
        borderColor: tagColor, 
        color: NEON_COLORS.DARK_BG, 
        backgroundColor: tagColor,
        textShadow: `0 0 3px ${NEON_COLORS.DARK_BG}`
    };

    return (
        <div 
            className="relative rounded-3xl p-1 overflow-hidden transform hover:scale-[1.05] transition-transform duration-500 group" 
            style={{ 
                // إطار خارجي متوهج بسيط لإبراز التميز
                boxShadow: `0 0 5px ${tagColor}80`,
                // إزالة الشفافية من هنا ونقلها للطبقة الداخلية
                backgroundColor: 'transparent'
            }}
        >
            {/* 1. طبقة تأثير "البوابة الخيالية" الدوارة - (The Fantastical Layer) */}
            <div 
                className="absolute inset-[-100%] z-0 opacity-50 transition-opacity duration-300 group-hover:opacity-100" 
                style={{
                    background: `conic-gradient(from 0deg at 50% 50%, ${tagColor} 0%, transparent 10%, transparent 90%, ${tagColor} 100%)`,
                    animation: 'spin-portal 8s linear infinite', // اسم الأنيميشن الجديد
                    filter: 'blur(35px) brightness(1.5)', // تأثير ضبابي قوي جداً
                }}
            />
            
            {/* 2. الطبقة الداخلية للمحتوى (Glassmorphism Content Layer) */}
            <div 
                className="relative z-10 p-6 rounded-3xl flex flex-col h-full transition-all duration-300"
                style={{
                    backgroundColor: `${NEON_COLORS.DARK_CARD}E8`, // خلفية داكنة شفافة أكثر
                    backdropFilter: 'blur(15px) saturate(150%)', // تأثير Glassmorphism 
                    border: `1px solid ${tagColor}50`,
                }}
            >

                <span 
                    className="absolute top-4 left-4 text-sm font-black px-4 py-1 rounded-full uppercase"
                    style={{ backgroundColor: tagColor, color: NEON_COLORS.DARK_BG, boxShadow: `0 0 8px ${tagColor}` }}
                >
                    {product.tag}
                </span>

                <div className="flex justify-center mb-6 pt-4">
                    <img 
                        src={`https://placehold.co/${product.imagePlaceholder}`} 
                        alt={product.name} 
                        className="w-44 h-44 object-cover rounded-full border-4 shadow-lg transition-all duration-300 group-hover:shadow-[0_0_20px_var(--vibrant-magenta)]" 
                        style={{ borderColor: tagColor + 'A0', boxShadow: `0 0 15px ${tagColor}A0` }}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://placehold.co/200x200/000003/b3e0ff?text=PRODUCT`; }}
                    />
                </div>

                <h3 className="text-3xl font-extrabold mb-2 text-white drop-shadow-[0_0_5px_var(--hyper-cyan)]" style={{ color: NEON_COLORS.HYPER_CYAN }}>
                    {product.name}
                </h3>
                <p className="text-base flex-grow mb-4" style={{ color: NEON_COLORS.TEXT_LIGHT }}>
                    {product.description}
                </p>
                
                <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: tagColor + '40' }}>
                    <span className="text-4xl font-black" style={{ color: tagColor }}>
                        {product.price}
                    </span>
                    
                    <button 
                        className={buyBtnClass}
                        style={buyBtnStyle}
                        onClick={() => console.log(`Attempting to buy ${product.name}`)}
                    >
                        اطلب دلوقتي
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---

export default function App() {
  // الحالة المسؤولة عن تتبع تحميل مكتبة Three.js
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);

  // useEffect لتحميل مكتبة Three.js بشكل ديناميكي 
  useEffect(() => {
    if ((window as any).THREE) {
      setIsThreeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => { setIsThreeLoaded(true); };
    script.onerror = () => { console.error("Failed to load Three.js script."); };

    document.head.appendChild(script);

    return () => {
        if (document.head.contains(script)) {
           document.head.removeChild(script);
        }
    };
  }, []); 

  // تعريف الأنماط المخصصة
  const customStyles: React.CSSProperties = {
    '--hyper-cyan': NEON_COLORS.HYPER_CYAN,
    '--vibrant-magenta': NEON_COLORS.VIBRANT_MAGENTA,
    '--dark-bg': NEON_COLORS.DARK_BG,
    '--text-light': NEON_COLORS.TEXT_LIGHT,
    fontFamily: 'Inter, sans-serif'
  } as React.CSSProperties;

  // كلاس التوهج للنص (تم تقليله)
  const neonGlowClass = 'drop-shadow-[0_0_10px_var(--hyper-cyan)]'; 
  

  return (
    <div style={{ backgroundColor: NEON_COLORS.DARK_BG, minHeight: '100vh', ...customStyles }} dir="rtl">
        
        {/* CSS للأنيميشن الخيالي الخاص بالبوابات الدوارة */}
        <style>
            {`
                @keyframes spin-portal {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}
        </style>

      {/* تضمين خلفية مجال الطاقة السائل */}
      <LiquidEnergyField isLoaded={isThreeLoaded} />
      
      {/* المحتوى الرئيسي */}
      <main className="relative z-20 container mx-auto max-w-7xl px-4 pt-16 pb-24 md:pt-28 md:pb-40">
        
        {/* قسم العنوان الرئيسي (Hero) */}
        <section className="text-center mb-16 relative">
          <h1 className={`text-6xl md:text-8xl font-black mb-4 text-white ${neonGlowClass}`} style={{ color: NEON_COLORS.HYPER_CYAN, textShadow: `0 0 5px ${NEON_COLORS.VIBRANT_MAGENTA}` }}>
            أحدث وأفخم تقنية وصلت
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-5xl mx-auto leading-relaxed" style={{ color: NEON_COLORS.TEXT_LIGHT }}>
            جبنالك أجهزة مش هتلاقيها في أي مكان تاني. كل اللي محتاجه عشان تكون سابق الكل.
          </p>
          
          {/* تم حذف شريط الإشعارات المتوهج بناءً على طلبك */}
          {/* <div className="inline-block ..."> ... </div> */}

        </section>

        {/* قسم شبكة المنتجات */}
        <section>
            <h2 className="text-4xl font-extrabold mb-12 text-white text-right" style={{ borderRight: `6px solid ${NEON_COLORS.HYPER_CYAN}`, paddingRight: '15px', textShadow: `0 0 8px ${NEON_COLORS.HYPER_CYAN}` }}>
                منتجات لازم تجربها
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {mockProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            
            <div className="text-center mt-16">
                 <button 
                    className={`py-4 px-12 text-xl font-black rounded-xl tracking-widest text-[var(--dark-bg)] transform hover:scale-[1.05] transition-all duration-500 ease-in-out shadow-[0_0_15px_var(--hyper-cyan),_0_0_8px_var(--vibrant-magenta)] hover:shadow-[0_0_30px_var(--hyper-cyan),_0_0_15px_var(--vibrant-magenta)]`}
                    style={{ backgroundColor: NEON_COLORS.HYPER_CYAN, color: NEON_COLORS.DARK_BG }}
                    onClick={() => console.log('Viewing all products...')}
                    >
                    شوف كل المنتجات
                  </button>
            </div>
        </section>

      </main>

      {/* التذييل */}
      <footer className="relative z-20 text-center py-12 border-t" style={{ borderColor: NEON_COLORS.VIBRANT_MAGENTA + '60' }}>
        <p className="text-base" style={{ color: NEON_COLORS.TEXT_LIGHT }}>
          تقدر تكلمنا على طول لو محتاج أي مساعدة!
        </p>
      </footer>

    </div>
  );
}