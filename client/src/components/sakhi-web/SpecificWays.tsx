import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Activity, BookOpen } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';

const HeartIcon = ({ className, style }: { className?: string, style?: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);

const LanguageIcon = ({ className, style }: { className?: string, style?: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
    </svg>
);

export function SpecificWays() {
    const { t } = useLanguage();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const supportAreas = [
        {
            icon: Compass,
            title: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a1_title'),
            subtitle: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a1_sub'),
            examples: [t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a1_e1'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a1_e2'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a1_e3')],
            color: "#3B82F6", // Blue for Exploration
            angle: -90 // Top
        },
        {
            icon: HeartIcon,
            title: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a2_title'),
            subtitle: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a2_sub'),
            examples: [t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a2_e1'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a2_e2'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a2_e3')],
            color: "#EC4899", // Pink for Emotional
            angle: -18 // Top Right
        },
        {
            icon: Activity,
            title: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a3_title'),
            subtitle: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a3_sub'),
            examples: [t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a3_e1'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a3_e2'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a3_e3')],
            color: "#EF4444", // Red for Triage & Safety
            angle: 54 // Bottom Right
        },
        {
            icon: BookOpen,
            title: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a4_title'),
            subtitle: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a4_sub'),
            examples: [t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a4_e1'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a4_e2'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a4_e3')],
            color: "#8B5CF6", // Purple for Education
            angle: 126 // Bottom Left
        },
        {
            icon: LanguageIcon,
            title: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a5_title'),
            subtitle: t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a5_sub'),
            examples: [t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a5_e1'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a5_e2'), t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_a5_e3')],
            color: "#F59E0B", // Orange for Language
            angle: 198 // Top Left
        }
    ];

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <section className="py-16 md:py-24 lg:py-32 bg-[#FAFBFF] overflow-hidden min-h-[700px] lg:min-h-[800px] flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

                    {/* Left: Content Header */}
                    <div className="w-full lg:w-1/3 text-center lg:text-left z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-serif leading-tight">
                                {t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_title1')} <br />
                                <span className="text-primary italic">{t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_title2')}</span>
                            </h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto lg:mx-0">
                                {isMobile ? t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_desc_mobile') : t('Sakhi_Landing_Page.Specific_Ways.sakhi_ways_desc_desktop')}
                            </p>
                        </motion.div>
                    </div>

                    {/* Right: The Orbital Interface */}
                    <div className="relative w-full lg:w-2/3 h-[450px] md:h-[550px] lg:h-[600px] flex items-center justify-center">

                        {/* Background Glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />

                        {/* Orbiting Paths (Visual only) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[260px] h-[260px] md:w-[380px] md:h-[380px] lg:w-[450px] lg:h-[450px] border border-dashed border-primary/10 rounded-full" />
                            <div className="absolute w-[180px] h-[180px] md:w-[260px] md:h-[260px] lg:w-[320px] lg:h-[320px] border border-dashed border-[#EC4899]/10 rounded-full" />
                        </div>

                        {/* Central Hub */}
                        <motion.div
                            className="relative z-20 w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-primary/5 cursor-default"
                            animate={{
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    "0 20px 50px rgba(139, 92, 246, 0.1)",
                                    "0 20px 50px rgba(139, 92, 246, 0.2)",
                                    "0 20px 50px rgba(139, 92, 246, 0.1)"
                                ]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            <AnimatePresence mode="wait">
                                {hoveredIndex === null ? (
                                    <motion.span
                                        key="sakhi-text"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xl md:text-2xl lg:text-3xl font-bold font-serif bg-gradient-to-r from-primary to-[#EC4899] bg-clip-text text-transparent"
                                    >
                                        Sakhi
                                    </motion.span>
                                ) : (
                                    <motion.div
                                        key="active-info"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="text-center px-4"
                                    >
                                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: supportAreas[hoveredIndex]?.color }}>
                                            {supportAreas[hoveredIndex]?.subtitle.split(' ')[0]}
                                        </div>
                                        <div className="text-xs md:text-sm font-bold leading-tight text-gray-800">
                                            {supportAreas[hoveredIndex]?.title}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Orbiting Interaction Nodes */}
                        <div className="absolute inset-0 z-30 pointer-events-none">
                            {supportAreas.map((area, index) => {
                                const isSelected = hoveredIndex === index;
                                // Smaller radius on mobile to prevent overflow/overlap
                                const distance = isMobile ? 110 : 210;
                                const rad = (area.angle * Math.PI) / 180;
                                const x = Math.cos(rad) * distance;
                                const y = Math.sin(rad) * distance;

                                return (
                                    <motion.div
                                        key={index}
                                        className="absolute top-1/2 left-1/2 pointer-events-auto"
                                        initial={false}
                                        animate={{ x, y }}
                                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                        style={{
                                            // Precise centering of the node itself
                                            marginLeft: isMobile ? '-32px' : '-40px',
                                            marginTop: isMobile ? '-32px' : '-40px'
                                        }}
                                    >
                                        <div className="relative">
                                            <div
                                                className="cursor-pointer group"
                                                onMouseEnter={() => setHoveredIndex(index)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                                onClick={() => setHoveredIndex(isSelected ? null : index)}
                                            >
                                                {/* The Bubble Node */}
                                                <motion.div
                                                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-2 transition-all duration-300"
                                                    style={{ borderColor: isSelected ? area.color : "transparent" }}
                                                    whileHover={{ scale: 1.1, boxShadow: `0 10px 25px ${area.color}20` }}
                                                    whileTap={{ scale: 0.95 }}
                                                    animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
                                                >
                                                    <area.icon className="w-8 h-8 md:w-9 md:h-9" style={{ color: area.color }} />
                                                </motion.div>

                                                {/* Label - only on desktop */}
                                                {!isMobile && (
                                                    <div className={`absolute left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap text-center transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}>
                                                        <p className="font-bold text-gray-900 text-sm leading-none">{area.title}</p>
                                                    </div>
                                                )}

                                                {/* Connection line back to center */}
                                                <div
                                                    className="absolute w-12 h-0.5 origin-left -z-10 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none transition-opacity duration-300"
                                                    style={{
                                                        left: '50%',
                                                        top: '50%',
                                                        transform: `rotate(${area.angle + 180}deg)`,
                                                        width: `${distance - 40}px`,
                                                        opacity: isSelected ? 0.8 : 0.3
                                                    }}
                                                />
                                            </div>

                                            {/* Tooltip for Desktop - remains relative to icon */}
                                            {!isMobile && (
                                                <AnimatePresence>
                                                    {isSelected && (
                                                        <TooltipContent
                                                            area={area}
                                                            isMobile={false}
                                                            key={`desktop-tooltip-${index}`}
                                                        />
                                                    )}
                                                </AnimatePresence>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </div>

            {/* Tooltip for Mobile - outside any transformed layers to ensure fixed positioning works */}
            {isMobile && (
                <AnimatePresence>
                    {hoveredIndex !== null && (
                        <TooltipContent
                            area={supportAreas[hoveredIndex]}
                            isMobile={true}
                            key={`mobile-tooltip-${hoveredIndex}`}
                        />
                    )}
                </AnimatePresence>
            )}
        </section>
    );
}

function TooltipContent({ area, isMobile }: { area: any, isMobile: boolean }) {
    if (!area) return null;
    const isLeft = !isMobile && (area.angle > 90 && area.angle < 270);

    return (
        <motion.div
            className={`z-[110] bg-white shadow-2xl border border-gray-100 pointer-events-none
                ${isMobile
                    ? 'fixed left-1/2 bottom-8 -translate-x-1/2 w-[calc(100vw-48px)] max-w-sm p-6 rounded-3xl'
                    : `absolute ${isLeft ? 'right-full mr-6' : 'left-full ml-6'} top-1/2 -translate-y-1/2 w-72 p-6 rounded-[2rem]`
                }`}
            initial={{ opacity: 0, x: isMobile ? '-50%' : (isLeft ? -20 : 20), y: isMobile ? 20 : '-50%', scale: 0.9 }}
            animate={{ opacity: 1, x: isMobile ? '-50%' : 0, y: isMobile ? 0 : '-50%', scale: 1 }}
            exit={{ opacity: 0, x: isMobile ? '-50%' : (isLeft ? -20 : 20), y: isMobile ? 20 : '-50%', scale: 0.9 }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gray-50">
                    <area.icon className="w-5 h-5" style={{ color: area.color }} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: area.color }}>
                    {area.subtitle}
                </div>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 leading-tight">{area.title}</h4>
            <ul className="space-y-3">
                {area.examples.map((ex: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2 leading-tight">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: area.color }} />
                        {ex}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}
