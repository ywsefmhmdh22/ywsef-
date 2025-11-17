 // app/page.tsx - الكود المُعدّل بتصميم فاخر لمتجر إلكتروني تقني

"use client"; // 👈🏼 يجب أن يبقى هنا

import Link from 'next/link';
import { 
    Briefcase, 
    ArrowRight, 
    Code, 
    Zap, 
    Menu, 
    X, 
    Globe, 
    Shield, 
    Info, 
    ShoppingBag,
    Star, // أيقونة جديدة للجمالية
    Cpu, // أيقونة جديدة لتمثيل التقنية
} from 'lucide-react'; 
import { motion, Variants } from 'framer-motion'; 
import { useState } from 'react'; 
// 🔴 يجب التأكد من وجود هذا المكون ومحتواه الثلاثي الأبعاد في مسار './components/CubeModel'
import CubeModel from './components/CubeModel'; 

// 1. تعريف بيانات المنتج/المشروع (TypeScript Interface)
interface Project {
    id: number;
    title: string;
    description: string;
    category: 'منتجات ذكية' | 'ملحقات احترافية' | 'مراجعات تقنية'; // تحديث الفئات لـ E-Commerce
    imageUrl: string;
    link: string;
}

// 2. شريط التنقل (Navigation Links)
const navLinks = [
    { name: 'المنتجات', href: '/products', icon: <ShoppingBag className="w-5 h-5 ml-2" /> },
    { name: 'المدونة', href: '/blog', icon: <Globe className="w-5 h-5 ml-2" /> },
    { name: 'من نحن', href: '/about', icon: <Info className="w-5 h-5 ml-2" /> },
    { name: 'تواصل', href: '/contact', icon: <Star className="w-5 h-5 ml-2" /> },
];

// 3. البيانات الوهمية للمنتجات
const featuredProjects: Project[] = [
    {
        id: 1,
        title: 'سماعة أذن X10 اللاسلكية',
        description: 'صوت محيطي نقي وتقنية إلغاء ضوضاء فائقة، تصميم مريح يناسب الاستخدام الطويل.',
        category: 'منتجات ذكية',
        imageUrl: 'https://placehold.co/800x600/0F172A/FFFFFF?text=Wireless+Headphones', 
        link: '#',
    },
    {
        id: 2,
        title: 'لوحة مفاتيح ميكانيكية احترافية',
        description: 'تجربة كتابة سريعة ودقيقة مع إضاءة خلفية RGB قابلة للتخصيص للمحترفين.',
        category: 'ملحقات احترافية',
        imageUrl: 'https://placehold.co/800x600/0F172A/FFFFFF?text=Mechanical+Keyboard', 
        link: '#',
    },
    {
        id: 3,
        title: 'مراجعة شاشة الألعاب Ultra-Gear',
        description: 'أداء خيالي بمعدل 240Hz ووقت استجابة 1ms. تحليل شامل لتقنيات الشاشة.',
        category: 'مراجعات تقنية',
        imageUrl: 'https://placehold.co/800x600/0F172A/FFFFFF?text=Gaming+Monitor', 
        link: '#',
    },
];

// متغيرات حركية لـ Framer Motion - تم تحديثها لجمالية أكبر
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15, // تأخير أكبر
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        transition: { 
            type: "spring", 
            stiffness: 120, 
            damping: 15 
        } 
    },
};


// 4. مكون شريط التنقل الاحترافي (Professional Navbar Component)
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-950 shadow-2xl sticky top-0 z-50 border-b-4 border-blue-500/80">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* الشعار (Logo) - تصميم أكثر فخامة */}
                <Link href="/" className="flex items-center text-3xl font-black text-white tracking-widest uppercase">
                    <Cpu className="w-7 h-7 text-yellow-500 mr-2" />
                    <span className='text-blue-400'>[ a.m sherif ]</span> a.m
                </Link>

                {/* روابط سطح المكتب */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name}
                            href={link.href}
                            className="text-gray-300 hover:text-yellow-400 font-bold transition duration-300 flex items-center p-2 rounded-lg hover:bg-gray-800"
                        >
                            {link.icon}
                            {link.name}
                        </Link>
                    ))}
                    <Link href="#products" className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105 border-2 border-blue-600">
                        تسوق الآن
                    </Link>
                </div>

                {/* زر القائمة المتجاوبة (Mobile Menu Button) */}
                <button 
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* قائمة الهاتف المتجاوبة (Mobile Menu) */}
            <motion.div
                initial={false}
                animate={isOpen ? "open" : "closed"}
                variants={{
                    open: { opacity: 1, height: "auto" },
                    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } }
                }}
                className="md:hidden overflow-hidden bg-gray-900 border-t border-gray-800"
            >
                {navLinks.map((link) => (
                    <Link 
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="block px-6 py-4 text-gray-300 hover:bg-gray-700 hover:text-yellow-400 font-medium transition duration-300 flex items-center border-b border-gray-800"
                    >
                        {link.icon}
                        {link.name}
                    </Link>
                ))}
                <Link href="#products" className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-6 m-4 rounded-full transition duration-300">
                    تسوق الآن
                </Link>
            </motion.div>
        </nav>
    );
};

// 5. المكون الرئيسي (Home Page)
export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-900 font-sans text-gray-200 scroll-smooth">

            {/* 🔴 شريط التنقل الاحترافي */}
            <Navbar />

            {/* 🔴 1. قسم البطل (Hero Section) - تصميم التكنولوجيا الفاخر */}
            <motion.header 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="py-24 md:py-40 bg-gray-950 text-white shadow-2xl overflow-hidden relative min-h-[700px] flex items-center justify-center"
            >
                {/* 🔴 العنصر ثلاثي الأبعاد: الأورب الديناميكي - يجب أن يظهر كشبكة إلكترونية */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                   <CubeModel /> 
                </div>
                
                <div className="container mx-auto px-6 text-center z-10 relative">
                    
                    <h1 className="text-6xl md:text-8xl font-black mb-6 leading-snug text-white drop-shadow-xl tracking-tighter">
                        مستقبلك يبدأ <span className="text-yellow-400">هنا</span>
                    </h1>
                    <p className="text-xl md:text-3xl text-gray-300 mb-12 max-w-5xl mx-auto font-light leading-relaxed">
                        نحن نقدم لك أرقى المنتجات الإلكترونية وأعمق المراجعات التقنية. **جودة، فخامة، وأداء** لا مثيل له.
                    </p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex justify-center space-x-6"
                    >
                        <Link href="#products" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-2xl shadow-blue-500/50 transition duration-300 transform hover:scale-105 flex items-center text-lg">
                            <ShoppingBag className="w-6 h-6 mr-3" />
                            اكتشف المنتجات
                        </Link>
                        <Link href="/contact" className="bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 font-bold py-4 px-10 rounded-full transition duration-300 flex items-center text-lg">
                            <ArrowRight className="w-6 h-6 mr-3" />
                            تواصل مع فريق الدعم
                        </Link>
                    </motion.div>
                </div>
            </motion.header>

            {/* 🔴 2. قسم الميزات (Value Proposition) */}
            <section className="py-24 bg-gray-800">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-16 text-white border-b-4 border-yellow-500/50 pb-2 inline-block">
                        لماذا تختار ** a.m sherif**؟ 👑
                    </h2>
                    
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-12"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        <motion.div variants={itemVariants} className="p-8 rounded-xl shadow-2xl transition duration-500 bg-gray-900 border-t-4 border-blue-500/70 hover:border-yellow-500">
                            <Star className="w-12 h-12 text-yellow-400 mb-4 mx-auto" />
                            <h3 className="font-extrabold text-2xl mb-2 text-white">جودة معتمدة</h3>
                            <p className="text-gray-400 text-base">جميع المنتجات والمراجعات تمر باختبارات صارمة لضمان أعلى مستويات الجودة.</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="p-8 rounded-xl shadow-2xl transition duration-500 bg-gray-900 border-t-4 border-blue-500/70 hover:border-yellow-500">
                            <Shield className="w-12 h-12 text-yellow-400 mb-4 mx-auto" />
                            <h3 className="font-extrabold text-2xl mb-2 text-white">ضمان وأمان</h3>
                            <p className="text-gray-400 text-base">نظام تسوق آمن، وسياسات واضحة تضمن حقوقك بالكامل كعميل.</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="p-8 rounded-xl shadow-2xl transition duration-500 bg-gray-900 border-t-4 border-blue-500/70 hover:border-yellow-500">
                            <Zap className="w-12 h-12 text-yellow-400 mb-4 mx-auto" />
                            <h3 className="font-extrabold text-2xl mb-2 text-white">شحن سريع</h3>
                            <p className="text-gray-400 text-base">خدمة توصيل ممتازة لضمان وصول طلبك بأسرع وقت ممكن وبأمان تام.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 🔴 3. قسم عرض المنتجات والمراجعات (E-Commerce Grid) */}
            <section id="products" className="py-28 bg-gray-900">
                <div className="container mx-auto px-6">
                    
                    <h2 className="text-5xl font-extrabold text-center mb-4 text-white">
                        🛍️ منتجاتنا ومراجعاتنا المميزة
                    </h2>
                    <p className="text-center text-2xl text-gray-400 mb-20 font-light">
                        استعرض آخر ما تم إضافته إلى المتجر أو اطلع على أعمق التحليلات.
                    </p>

                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {featuredProjects.map((project) => (
                            <ProductCard key={project.id} project={project} />
                        ))}
                    </motion.div>

                    <div className="text-center mt-20">
                        <Link href="/all-products" className="text-xl text-yellow-400 font-extrabold hover:text-yellow-500 transition duration-300 border-b-2 border-blue-500/50 hover:border-yellow-500 p-2">
                            تصفح كل المنتجات والمدونات <ArrowRight className="inline-block w-5 h-5 mr-1" />
                        </Link>
                    </div>
                </div>
            </section>
            
            {/* 🔴 4. قسم ختامي/دعوة للعمل (Footer/CTA) - تصميم فاخر */}
            <footer id="contact" className="bg-gray-950 text-white py-16 text-center border-t-4 border-blue-600">
                <p className="text-4xl font-black mb-6">هل أنت مستعد للانتقال للمستوى التالي من التقنية؟</p>
                <Link href="/contact" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black py-4 px-12 rounded-full shadow-3xl shadow-yellow-500/50 transition duration-300 transform hover:scale-105 text-lg uppercase tracking-wider">
                    تواصل معنا أو ابدأ التسوق الآن
                </Link>
                <p className="mt-10 text-sm text-gray-500">
                 © 2014 جميع الحقوق محفوظة. <span className='text-blue-400'> </span>   
                </p>
            </footer>
        </div>
    );
}

// 6. مكون بطاقة المنتج (Product Card Component)
const ProductCard: React.FC<{ project: Project }> = ({ project }) => {
    return (
        <motion.div 
            variants={itemVariants} 
            className="bg-gray-950 rounded-2xl shadow-3xl shadow-gray-700/20 border border-gray-800 overflow-hidden group hover:shadow-blue-500/30 transition duration-500 transform hover:-translate-y-3 cursor-pointer"
        >
            
            {/* صورة المنتج */}
            <div className="relative h-72 overflow-hidden bg-gray-800 flex items-center justify-center">
                <img 
                    src={project.imageUrl} 
                    alt={`صورة المنتج ${project.title}`} 
                    className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                    width={800}
                    height={600}
                    onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/800x600/1F2937/FFFFFF?text=Product+Image'; 
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent"></div>
            </div>

            <div className="p-8">
                <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 bg-blue-600/20 rounded-full px-4 py-1 mb-3 inline-block shadow-lg">
                    {project.category}
                </span>
                <h3 className="text-3xl font-extrabold mb-3 text-white">
                    {project.title}
                </h3>
                <p className="text-gray-400 mb-6 text-base">
                    {project.description}
                </p>
                
                <Link href={project.link} className="text-blue-500 font-bold hover:text-blue-600 transition duration-300 flex items-center group/link text-lg">
                    شاهد التفاصيل 
                    <ArrowRight className="w-6 h-6 ml-3 transition duration-300 group-hover/link:translate-x-1" />
                </Link>
            </div>
        </motion.div>
    );
};