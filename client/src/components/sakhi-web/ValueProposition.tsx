import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';

interface ValuePropositionProps {
    onCtaClick?: () => void;
}

export function ValueProposition({ onCtaClick }: ValuePropositionProps) {
    const { t } = useLanguage();
    return (
        <section className="relative py-20 md:py-32 bg-white overflow-hidden">


            <div className="max-w-5xl mx-auto px-6 relative">
                <motion.div
                    className="text-center max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Benefit-Driven Headline */}
                    <motion.h2
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 font-serif"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {t('Sakhi_Landing_Page.Value_Proposition.sakhi_vp_title1')}
                        <motion.span
                            className="block bg-gradient-to-r from-primary via-[#EC4899] to-primary bg-clip-text text-transparent bg-[length:200%_auto]"
                            animate={{
                                backgroundPosition: ['0% center', '200% center', '0% center'],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            {t('Sakhi_Landing_Page.Value_Proposition.sakhi_vp_title2')}
                        </motion.span>
                    </motion.h2>

                    {/* Outcome-Centric Description */}
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
                        {t('Sakhi_Landing_Page.Value_Proposition.sakhi_vp_desc')}
                    </p>

                    {/* Single Dominant Action */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.button
                            onClick={onCtaClick}
                            className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-[#EC4899] text-white rounded-full font-semibold text-lg shadow-lg overflow-hidden flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-[#EC4899] to-primary"
                                initial={{ x: "100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                            <span className="relative flex items-center gap-2">
                                {t('Sakhi_Landing_Page.Value_Proposition.sakhi_vp_cta')}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </motion.button>
                    </div>

                    {/* Trust Signal - Minimal */}
                    <motion.p
                        className="mt-8 text-sm text-gray-500"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        {t('Sakhi_Landing_Page.Value_Proposition.sakhi_vp_trust')}
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
