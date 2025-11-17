 "use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';

// تعريف الألوان النيونية الجديدة (الأخضر والبرتقالي)
const NEON_COLORS = {
  DARK_BG: '#05050a', // خلفية داكنة جديدة
  DARK_CARD: '#10101a',
  NEON_GREEN: '#66ff00', // اللون الأساسي الجديد
  NEON_ORANGE: '#ffaa00', // اللون الثانوي الجديد
  MEDIUM_GRAY: '#a0a0a0',
};

// --- Three.js AI Agent Background Component ---

const AIAgentBackground: React.FC<{ isLoaded: boolean }> = ({ isLoaded }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const initThree = useCallback((THREE: any) => {
    if (!mountRef.current) return;

    let scene: any, camera: any, renderer: any, agentMesh: any, light: any;
    const clock = new THREE.Clock();
    const container = mountRef.current;
    
    // تحويل الألوان النيونية للتعامل مع Three.js
    const COLOR_PRIMARY = NEON_COLORS.NEON_GREEN.replace('#', '0x');
    const COLOR_SECONDARY = NEON_COLORS.NEON_ORANGE.replace('#', '0x');

    // دالة لإنشاء وكيل الذكاء الاصطناعي (AI Agent)
    const createAgent = () => {
      // استخدام Icosahedron (عشرون الأوجه) لإضفاء مظهر مستقبلي
      const geometry = new THREE.IcosahedronGeometry(2, 1);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(parseInt(COLOR_PRIMARY, 16)),
        wireframe: true,
        transparent: true,
        opacity: 0.7,
        shininess: 100,
        flatShading: true,
      });
      agentMesh = new THREE.Mesh(geometry, material);
      agentMesh.position.set(0, 0, 0);
      scene.add(agentMesh);

      // إضافة ضوء نقطي نابض باللون الثانوي
      light = new THREE.PointLight(new THREE.Color(parseInt(COLOR_SECONDARY, 16)), 1.5, 100);
      light.position.set(0, 0, 0); // في نفس موضع الوكيل
      scene.add(light);
    };

    const updateAgent = (elapsedTime: number) => {
      if (agentMesh) {
        // دوران
        agentMesh.rotation.x = elapsedTime * 0.05;
        agentMesh.rotation.y = elapsedTime * 0.1;
        
        // تأثير النبض (Scale)
        const pulseScale = 0.05 * Math.sin(elapsedTime * 2.5) + 1; // ينبض بين 1.0 و 1.1
        agentMesh.scale.set(pulseScale, pulseScale, pulseScale);
      }
      
      if (light) {
        // نبض شدة الضوء (Agent Light)
        light.intensity = 1.0 + 1.5 * Math.sin(elapsedTime * 3); // ينبض من 1.0 إلى 2.5
      }
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
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 0;

    // 3. إعداد المخرج (Renderer)
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    createAgent();

    // إضافة إضاءة محيطة خفيفة
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      updateAgent(elapsedTime);
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
        opacity: 0.3, // شفافية أقل للتركيز على المحتوى
      }}
    />
  );
};

// --- Icons (Lucide-inspired) for Contact Details ---

const IconMail = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const IconPhone = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-5.6-5.6A19.79 19.79 0 0 1 2 4.18V2a2 2 0 0 1 2-2h3.18a2 2 0 0 1 1.74.82l.63 2.5a2 2 0 0 1-.4 1.87l-1.3 1.3a15 15 0 0 0 7.3 7.3l1.3-1.3a2 2 0 0 1 1.87-.4l2.5.63a2 2 0 0 1 .82 1.74Z"/>
    </svg>
);

const IconMapPin = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
);

// --- Contact Detail Card ---

const ContactDetailCard = ({ icon: Icon, title, value, color }: { icon: React.FC, title: string, value: string, color: string }) => (
    <div className="flex items-start p-6 rounded-xl border"
        style={{
            backgroundColor: NEON_COLORS.DARK_CARD,
            borderColor: '#252535',
            transition: 'border-color 0.4s ease',
        }}
    >
        <div className="p-3 rounded-lg flex-shrink-0" style={{ color: color, backgroundColor: `${color}1A` }}>
            <Icon />
        </div>
        <div className="mr-4">
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-base" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>{value}</p>
        </div>
    </div>
);


// --- Main Contact App Component ---

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
    '--neon-green': NEON_COLORS.NEON_GREEN,
    '--neon-orange': NEON_COLORS.NEON_ORANGE,
    '--dark-bg': NEON_COLORS.DARK_BG,
    '--medium-gray': NEON_COLORS.MEDIUM_GRAY,
    fontFamily: 'Inter, sans-serif'
  } as React.CSSProperties;

  // كلاس التوهج للنص (باستخدام الألوان الجديدة)
  const neonGlowClass = 'drop-shadow-[0_0_10px_rgba(102,255,0,0.5)] drop-shadow-[0_0_20px_rgba(255,170,0,0.4)]';
  
  // كلاسات زر التوهج (باستخدام الألوان الجديدة)
  const btnNeonClass = `transition-all duration-300 ease-in-out hover:scale-[1.05] shadow-[0_0_10px_var(--neon-green),_0_0_4px_var(--neon-green)] hover:shadow-[0_0_20px_var(--neon-green),_0_0_8px_var(--neon-green)]`;

  return (
    <div style={{ backgroundColor: NEON_COLORS.DARK_BG, minHeight: '100vh', ...customStyles }} dir="rtl">
        
      {/* تضمين خلفية وكيل الذكاء الاصطناعي (AI Agent) */}
      <AIAgentBackground isLoaded={isThreeLoaded} />
      
      {/* المحتوى الرئيسي */}
      <main className="relative z-10 container mx-auto max-w-5xl px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        
        {/* قسم العنوان الرئيسي (Hero) */}
        <section className="text-center mb-16">
          <h1 className={`text-5xl md:text-6xl font-black mb-4 text-white ${neonGlowClass}`}>
            تواصل معنا الآن
          </h1>
          <p className="text-xl md:text-2xl mb-2 max-w-4xl mx-auto leading-relaxed" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
            وكيلنا الرقمي جاهز لتلقي استفساراتك على مدار الساعة.
          </p>
          <p className="text-lg font-semibold" style={{ color: NEON_COLORS.NEON_ORANGE }}>
            لنجعل رؤيتك التقنية حقيقة.
          </p>
        </section>

        {/* قسم محتوى التواصل (نموذج ومفتاح الاتصال) */}
        <section className="grid lg:grid-cols-3 gap-10">
            
            {/* العمود الأيمن: تفاصيل الاتصال */}
            <div className="lg:col-span-1 space-y-6">
                <h2 className="text-3xl font-bold mb-4 text-white" style={{ color: NEON_COLORS.NEON_GREEN }}>
                    طرق سريعة للتواصل
                </h2>
                
                <ContactDetailCard
                    icon={IconMail}
                    title="البريد الإلكتروني"
                    value="ahmedsherife888@gmail.com  "
                    color={NEON_COLORS.NEON_GREEN}
                />
                
                <ContactDetailCard
                    icon={IconPhone}
                    title="هاتف الدعم"
                    value="+201125571077"
                    color={NEON_COLORS.NEON_ORANGE}
                />
                
                <ContactDetailCard
                    icon={IconMapPin}
                    title="المكتب الرئيسي"
                    value="  الاسكندريه مدينه برج العرب الجديده  "
                    color={NEON_COLORS.NEON_GREEN}
                />
                
                <p className="pt-4 text-sm" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
                    نحن نعمل على توفير دعم مستمر لجميع استفساراتكم التقنية.
                </p>
            </div>

            {/* العمود الأيسر: نموذج الاتصال */}
            <div className="lg:col-span-2 p-8 md:p-10 rounded-2xl border shadow-xl" 
                 style={{ backgroundColor: NEON_COLORS.DARK_CARD, 
                          borderColor: NEON_COLORS.NEON_ORANGE, 
                          borderWidth: '1px', 
                          boxShadow: `0 0 10px ${NEON_COLORS.NEON_ORANGE}2A` }}>
                
                <h2 className="text-3xl font-bold mb-8 text-white">
                    أرسل لنا رسالة
                </h2>

                <form className="space-y-6">
                    {/* حقل الاسم */}
                    <input 
                        type="text" 
                        placeholder="اسمك الكامل" 
                        className="w-full p-4 rounded-lg bg-[#181825] border border-gray-700 text-white focus:border-[var(--neon-green)] focus:ring focus:ring-[var(--neon-green)]/30 outline-none transition-colors"
                        style={{'--neon-green': NEON_COLORS.NEON_GREEN} as React.CSSProperties}
                    />
                    
                    {/* حقل البريد الإلكتروني */}
                    <input 
                        type="email" 
                        placeholder="بريدك الإلكتروني" 
                        className="w-full p-4 rounded-lg bg-[#181825] border border-gray-700 text-white focus:border-[var(--neon-green)] focus:ring focus:ring-[var(--neon-green)]/30 outline-none transition-colors"
                        style={{'--neon-green': NEON_COLORS.NEON_GREEN} as React.CSSProperties}
                    />

                    {/* حقل الموضوع */}
                    <input 
                        type="text" 
                        placeholder="موضوع الرسالة" 
                        className="w-full p-4 rounded-lg bg-[#181825] border border-gray-700 text-white focus:border-[var(--neon-green)] focus:ring focus:ring-[var(--neon-green)]/30 outline-none transition-colors"
                        style={{'--neon-green': NEON_COLORS.NEON_GREEN} as React.CSSProperties}
                    />

                    {/* حقل الرسالة */}
                    <textarea 
                        placeholder="رسالتك..." 
                        rows={5}
                        className="w-full p-4 rounded-lg bg-[#181825] border border-gray-700 text-white focus:border-[var(--neon-green)] focus:ring focus:ring-[var(--neon-green)]/30 outline-none transition-colors"
                        style={{'--neon-green': NEON_COLORS.NEON_GREEN} as React.CSSProperties}
                    ></textarea>

                    {/* زر الإرسال */}
                    <button 
                        type="submit"
                        className={`w-full py-4 font-extrabold rounded-lg tracking-wider border-2 border-transparent text-[var(--dark-bg)] ${btnNeonClass}`}
                        style={{ backgroundColor: NEON_COLORS.NEON_GREEN, color: NEON_COLORS.DARK_BG }}>
                        إرسال الرسالة
                    </button>
                </form>
            </div>
        </section>

      </main>

      {/* التذييل */}
      <footer className="relative z-10 text-center py-8 border-t border-gray-900 mt-16">
        <p className="text-sm" style={{ color: NEON_COLORS.MEDIUM_GRAY }}>
          © 2014 -  a.m sherif  . شريكك الدائم في عالم التكنولوجيا.
        </p>
      </footer>

    </div>
  );
}