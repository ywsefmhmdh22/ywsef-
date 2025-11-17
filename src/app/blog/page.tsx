"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';

// تعريف الألوان النيونية الجديدة (الأزرق السماوي والبنفسجي)
const NEON_COLORS = {
  DARK_BG: '#030308', // خلفية أكثر قتامة
  DARK_CARD: '#0a0a15',
  NEON_CYAN: '#00FFFF', // اللون الأساسي الجديد (الأزرق السماوي)
  NEON_MAGENTA: '#FF00FF', // اللون الثانوي الجديد (البنفسجي)
  MEDIUM_GRAY: '#c0c0d0',
};

// --- Three.js Hyper-Consciousness Grid Background Component ---

const HyperGridBackground: React.FC<{ isLoaded: boolean }> = ({ isLoaded }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const initThree = useCallback((THREE: any) => {
    if (!mountRef.current) return;

    let scene: any, camera: any, renderer: any, points: any, lines: any;
    const clock = new THREE.Clock();
    const container = mountRef.current;
    
    // تحويل الألوان النيونية للتعامل مع Three.js
    const COLOR_CYAN = new THREE.Color(NEON_COLORS.NEON_CYAN);
    const COLOR_MAGENTA = new THREE.Color(NEON_COLORS.NEON_MAGENTA);

    // متغيرات الشبكة
    const numPoints = 1500;
    const distanceThreshold = 2.5; // المسافة القصوى لربط النقاط
    const bounds = 30; // حجم مجال الشبكة

    // دالة التدرج اللوني (Cyan to Magenta)
    const lerpColor = (color1: any, color2: any, factor: number) => {
        const result = new THREE.Color();
        result.r = color1.r + (color2.r - color1.r) * factor;
        result.g = color1.g + (color2.g - color1.g) * factor;
        result.b = color1.b + (color2.b - color1.b) * factor;
        return result;
    };

    const createGrid = () => {
      // 1. إنشاء النقاط (Particles)
      const positions = new Float32Array(numPoints * 3);
      const colors = new Float32Array(numPoints * 3);
      const sizes = new Float32Array(numPoints);

      for (let i = 0; i < numPoints; i++) {
        // توزيع النقاط بشكل عشوائي في مجال ثلاثي الأبعاد
        positions[i * 3 + 0] = (Math.random() - 0.5) * bounds;
        positions[i * 3 + 1] = (Math.random() - 0.5) * bounds;
        positions[i * 3 + 2] = (Math.random() - 0.5) * bounds;

        // تعيين لون مبدئي وحجم
        COLOR_CYAN.toArray(colors, i * 3);
        sizes[i] = Math.random() * 0.3 + 0.1;
      }

      const pointGeometry = new THREE.BufferGeometry();
      pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      pointGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      const pointMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true,
      });

      points = new THREE.Points(pointGeometry, pointMaterial);
      scene.add(points);

      // 2. إنشاء الخطوط (Lines) - يتم تحديثها في حلقة الرسوم المتحركة
      const maxLines = numPoints * 10;
      const linePositions = new Float32Array(maxLines * 3 * 2); // 2 نقطة (بداية ونهاية) * 3 إحداثيات لكل خط
      const lineColors = new Float32Array(maxLines * 3 * 2);
      
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
      lineGeometry.setDrawRange(0, 0);

      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.5,
        linewidth: 1,
      });

      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);
    };

    const updateGrid = (elapsedTime: number) => {
        const positions = points.geometry.attributes.position.array;
        const colors = points.geometry.attributes.color.array;
        const linePositions = lines.geometry.attributes.position.array;
        const lineColors = lines.geometry.attributes.color.array;
        let lineIndex = 0;
        
        const cameraPos = camera.position;

        // تحديث ألوان النقاط (توهج دوري)
        for (let i = 0; i < numPoints; i++) {
            const timeFactor = (elapsedTime * 0.1) + i * 0.01;
            const pulse = 0.5 + 0.5 * Math.sin(timeFactor * 5); // نبض التوهج
            
            // تدرج لوني بين Cyan و Magenta
            const mixedColor = lerpColor(COLOR_CYAN, COLOR_MAGENTA, 0.5 + 0.5 * Math.sin(elapsedTime * 0.5));
            const finalColor = lerpColor(mixedColor, COLOR_CYAN, pulse);

            finalColor.toArray(colors, i * 3);
        }
        points.geometry.attributes.color.needsUpdate = true;

        // 2. تحديث الخطوط بناءً على القرب
        for (let i = 0; i < numPoints; i++) {
            const p1X = positions[i * 3];
            const p1Y = positions[i * 3 + 1];
            const p1Z = positions[i * 3 + 2];
            const p1Color = new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);

            // جعل الشبكة تتحرك ببطء
            positions[i * 3] += Math.sin(elapsedTime * 0.1 + i) * 0.001;
            positions[i * 3 + 1] += Math.cos(elapsedTime * 0.1 + i) * 0.001;
            
            for (let j = i + 1; j < numPoints; j++) {
                const p2X = positions[j * 3];
                const p2Y = positions[j * 3 + 1];
                const p2Z = positions[j * 3 + 2];

                const dx = p1X - p2X;
                const dy = p1Y - p2Y;
                const dz = p1Z - p2Z;

                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < distanceThreshold * distanceThreshold && lineIndex < linePositions.length / 6) {
                    // حساب عامل القرب (كلما اقتربت النقاط، أصبحت الخطوط أوضح)
                    const connectionFactor = 1.0 - Math.sqrt(distSq) / distanceThreshold;
                    const lineOpacity = connectionFactor * 0.5; // أقصى شفافية 0.5

                    // بداية الخط (النقطة i)
                    linePositions[lineIndex * 6 + 0] = p1X;
                    linePositions[lineIndex * 6 + 1] = p1Y;
                    linePositions[lineIndex * 6 + 2] = p1Z;
                    
                    // لون الخط
                    p1Color.multiplyScalar(1.0 + connectionFactor * 0.5).toArray(lineColors, lineIndex * 6);
                    
                    // نهاية الخط (النقطة j)
                    linePositions[lineIndex * 6 + 3] = p2X;
                    linePositions[lineIndex * 6 + 4] = p2Y;
                    linePositions[lineIndex * 6 + 5] = p2Z;
                    
                    // لون الخط (يتلاشى باتجاه النقطة الثانية)
                    p1Color.multiplyScalar(0.5 + connectionFactor * 0.5).toArray(lineColors, lineIndex * 6 + 3);

                    lineIndex++;
                }
            }
        }
        
        points.geometry.attributes.position.needsUpdate = true;

        // تحديث عدد الخطوط التي سيتم رسمها
        lines.geometry.setDrawRange(0, lineIndex * 2 * 3 / 3);
        lines.geometry.attributes.position.needsUpdate = true;
        lines.geometry.attributes.color.needsUpdate = true;


        // حركة الكاميرا (لتشعر بالتحليق داخل الشبكة)
        const cameraMovementSpeed = 0.05;
        camera.rotation.y = elapsedTime * 0.05;
        camera.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;

        // إضاءة المحيط (خفيفة)
        scene.rotation.y += 0.001;
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
    scene.fog = new THREE.Fog(NEON_COLORS.DARK_BG, 10, bounds * 0.8); // ضباب لإضافة عمق
    
    // 2. إعداد الكاميرا
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 20;
    camera.position.y = 0;

    // 3. إعداد المخرج (Renderer)
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setClearColor(NEON_COLORS.DARK_BG, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    createGrid();

    // إضافة إضاءة محيطة خفيفة
    const ambientLight = new THREE.AmbientLight(0x444444, 0.5);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      updateGrid(elapsedTime);
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
    if (isLoaded && typeof (window as any).THREE !== 'undefined') {
      try {
        cleanupFunc = initThree((window as any).THREE) as () => void;
      } catch (e) {
        console.error("Failed to initialize Three.js:", e);
      }
    }
    
    return () => cleanupFunc();

  }, [initThree, isLoaded]);

  // لا نعرض الخلفية إذا لم تكن المكتبة محملة بعد
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
        opacity: 0.8, // إظهار جمال الخلفية بشكل واضح
      }}
    />
  );
};

// --- Blog Card Component ---

interface BlogArticle {
    id: number;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    imagePlaceholder: string;
}

const mockArticles: BlogArticle[] = [
    {
        id: 1,
        title: "ما وراء الأفق: مستقبل الذكاء الاصطناعي التوليدي",
        excerpt: "نستكشف كيف يعيد الذكاء الاصطناعي التوليدي تشكيل الصناعات الإبداعية والبرمجية، وتأثيره على سوق العمل.",
        date: "2024-10-27",
        category: "ذكاء اصطناعي",
        imagePlaceholder: "200x120/000000/00FFFF?text=AI",
    },
    {
        id: 2,
        title: "الويب 5.0: هل نحن مستعدون لعصر الواقع المندمج؟",
        excerpt: "تحليل معمق للتطورات القادمة في بنية الإنترنت وكيف ستغير تجربة المستخدمين مع الفضاء الرقمي.",
        date: "2024-10-25",
        category: "تكنولوجيا",
        imagePlaceholder: "200x120/000000/FF00FF?text=Web5",
    },
    {
        id: 3,
        title: "الأمن السيبراني الكمي: الدفاع ضد هجمات المستقبل",
        excerpt: "مناقشة أهمية تطوير خوارزميات مقاومة للكمبيوترات الكمية وكيفية حماية البيانات الحساسة اليوم.",
        date: "2024-10-22",
        category: "أمن",
        imagePlaceholder: "200x120/000000/00FFFF?text=Security",
    },
    {
        id: 4,
        title: "لغة البرمجة التي ستحكم عام 2025",
        excerpt: "نظرة على أحدث لغات البرمجة الصاعدة وتوقعاتنا حول اللغة الأكثر طلباً في سوق العمل التقني.",
        date: "2024-10-20",
        category: "برمجة",
        imagePlaceholder: "200x120/000000/FF00FF?text=Code",
    },
];

const BlogCard: React.FC<{ article: BlogArticle }> = ({ article }) => {
    // كلاسات توهج البطاقة
    const glowBorderClass = `relative overflow-hidden group transition-all duration-500 ease-in-out hover:scale-[1.03] border-2 border-transparent`;
    
    // توليد التوهج الديناميكي بناءً على الألوان الجديدة
    const cardStyle: React.CSSProperties = {
        backgroundColor: NEON_COLORS.DARK_CARD,
        boxShadow: `0 0 5px ${NEON_COLORS.NEON_CYAN}1A, 0 0 10px ${NEON_COLORS.NEON_MAGENTA}1A`,
    };

    return (
        <a 
            href={`#article-${article.id}`} 
            className={`block p-4 rounded-xl ${glowBorderClass}`} 
            style={cardStyle}
        >
            {/* تأثير الإطار المتوهج عند التحويم */}
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style={{
                    boxShadow: `0 0 15px 1px ${NEON_COLORS.NEON_CYAN}, 0 0 25px 5px ${NEON_COLORS.NEON_MAGENTA}50`,
                    zIndex: -1,
                 }}
            ></div>
            
            <img 
                src={`https://placehold.co/${article.imagePlaceholder}`} 
                alt={article.title} 
                className="w-full h-auto object-cover rounded-lg mb-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://placehold.co/200x120/000000/c0c0d0?text=Placeholder`; }}
            />
            
            <p className="text-sm font-semibold mb-2" style={{ color: NEON_COLORS.NEON_MAGENTA }}>
                {article.category}
            </p>
            <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-[var(--neon-cyan)] transition-colors">
                {article.title}
            </h3>
            <p className="text-sm" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
                {article.excerpt}
            </p>
            <p className="text-xs mt-3 opacity-60" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
                نشر في: {article.date}
            </p>
        </a>
    );
};


// --- Main Blog App Component ---

export default function App() {
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);

  // useEffect لتحميل مكتبة Three.js بشكل ديناميكي
  useEffect(() => {
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
        if (document.head.contains(script)) {
           document.head.removeChild(script);
        }
    };
  }, []);

  // تعريف الأنماط المخصصة
  const customStyles: React.CSSProperties = {
    '--neon-cyan': NEON_COLORS.NEON_CYAN,
    '--neon-magenta': NEON_COLORS.NEON_MAGENTA,
    '--dark-bg': NEON_COLORS.DARK_BG,
    '--medium-gray': NEON_COLORS.MEDIUM_GRAY,
    fontFamily: 'Inter, sans-serif'
  } as React.CSSProperties;

  // كلاس التوهج للنص
  const neonGlowClass = 'drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] drop-shadow-[0_0_20px_rgba(255,0,255,0.4)]';
  
  // كلاسات زر التوهج (للزاوية العلوية)
  const btnNeonClass = `transition-all duration-300 ease-in-out hover:scale-[1.05] shadow-[0_0_10px_var(--neon-cyan),_0_0_4px_var(--neon-cyan)] hover:shadow-[0_0_20px_var(--neon-cyan),_0_0_8px_var(--neon-cyan)]`;

  return (
    <div style={{ backgroundColor: NEON_COLORS.DARK_BG, minHeight: '100vh', ...customStyles }} dir="rtl">
        
      {/* تضمين خلفية شبكة الوعي الفائقة (Hyper-Consciousness Grid) */}
      <HyperGridBackground isLoaded={isThreeLoaded} />
      
      {/* المحتوى الرئيسي */}
      <main className="relative z-20 container mx-auto max-w-6xl px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        
        {/* قسم العنوان الرئيسي (Hero) */}
        <section className="text-center mb-16 relative">
          <h1 className={`text-5xl md:text-7xl font-black mb-4 text-white ${neonGlowClass}`}>
            مكتبة المستقبل المعرفية
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
            اكتشف أعمق الأسرار في الذكاء الاصطناعي، الأمن السيبراني، وتكنولوجيا الغد.
          </p>
          
          {/* زر البحث أو الاشتراك - بتصميم نيون أنيق */}
          <div className="flex justify-center items-center space-x-4 space-x-reverse">
              <input 
                    type="search" 
                    placeholder="ابحث في آلاف المقالات..." 
                    className="w-full max-w-lg p-3 rounded-xl bg-[#150a15] border border-gray-800 text-white focus:border-[var(--neon-magenta)] focus:ring focus:ring-[var(--neon-magenta)]/30 outline-none transition-colors"
                    style={{'--neon-magenta': NEON_COLORS.NEON_MAGENTA} as React.CSSProperties}
                />
              <button 
                className={`py-3 px-6 font-bold rounded-xl tracking-wider text-[var(--dark-bg)] ${btnNeonClass}`}
                style={{ backgroundColor: NEON_COLORS.NEON_CYAN, color: NEON_COLORS.DARK_BG }}>
                بحث متقدم
              </button>
          </div>
        </section>

        {/* قسم شبكة المدونات */}
        <section>
            <h2 className="text-4xl font-extrabold mb-10 text-white" style={{ borderRight: `5px solid ${NEON_COLORS.NEON_MAGENTA}`, paddingRight: '15px' }}>
                أحدث المقالات التقنية
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockArticles.map((article) => (
                    <BlogCard key={article.id} article={article} />
                ))}
                
                {/* إضافة المزيد من بطاقات وهمية لملء المساحة */}
                <BlogCard key={5} article={{...mockArticles[0], id: 5, title: "توجهات العملات المشفرة للربع الأخير", category: "اقتصاد رقمي", imagePlaceholder: "200x120/000000/FF00FF?text=Crypto"}} />
                <BlogCard key={6} article={{...mockArticles[1], id: 6, title: "دليل المطور الشامل للواقع المعزز", category: "برمجة", imagePlaceholder: "200x120/000000/00FFFF?text=AR"}} />
            </div>
        </section>

      </main>

      {/* التذييل */}
      <footer className="relative z-20 text-center py-8 border-t" style={{ borderColor: NEON_COLORS.NEON_MAGENTA + '30' }}>
        <p className="text-sm" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
          مدونات  a.m sherif    . حيث تلتقي المعرفة بالتطور.
        </p>
      </footer>

    </div>
  );
}