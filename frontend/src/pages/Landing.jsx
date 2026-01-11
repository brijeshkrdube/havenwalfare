import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, Building2, HandCoins, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { publicAPI } from '../lib/api';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3463593f-4cba-425e-a575-89c0d925427c/artifacts/n1f21t65_unnamed-removebg-preview.png";

const Landing = () => {
    const [events, setEvents] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await publicAPI.getEvents();
                setEvents(response.data);
            } catch (error) {
                console.error('Failed to load events');
            }
        };
        fetchEvents();
    }, []);

    // Auto-slide every 5 seconds
    useEffect(() => {
        if (events.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % events.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [events.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % events.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
    };

    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    const features = [
        {
            icon: Shield,
            title: 'Verified Doctors',
            description: 'All medical professionals are verified and approved by our admin team.'
        },
        {
            icon: Building2,
            title: 'Trusted Rehab Centers',
            description: 'Partner with certified rehabilitation facilities across the region.'
        },
        {
            icon: HandCoins,
            title: 'Transparent Donations',
            description: 'Every donation is manually verified and tracked for complete transparency.'
        },
        {
            icon: Users,
            title: 'Community Support',
            description: 'Join a supportive community on the journey to recovery.'
        }
    ];

    const stats = [
        { value: '500+', label: 'Patients Helped' },
        { value: '50+', label: 'Verified Doctors' },
        { value: '25+', label: 'Rehab Centers' },
        { value: '$100K+', label: 'Donations Received' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#e0e6e4]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 sm:gap-3" data-testid="logo-link">
                        <img src={LOGO_URL} alt="HavenWelfare" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                        <span className="font-manrope text-lg sm:text-xl font-bold text-[#0f392b] hidden xs:inline">HavenWelfare</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/donate" data-testid="donate-link">
                            <Button variant="ghost" className="text-[#0f392b] hover:bg-[#f4f1ea] text-sm sm:text-base px-2 sm:px-4">
                                Donate
                            </Button>
                        </Link>
                        <Link to="/login" data-testid="login-link" className="hidden sm:block">
                            <Button variant="outline" className="border-[#0f392b] text-[#0f392b] hover:bg-[#0f392b] hover:text-white rounded-full px-4 sm:px-6">
                                Login
                            </Button>
                        </Link>
                        <Link to="/register" data-testid="register-link">
                            <Button className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full px-4 sm:px-6 text-sm sm:text-base">
                                <span className="sm:hidden">Join</span>
                                <span className="hidden sm:inline">Get Started</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div {...fadeUp} className="space-y-8">
                            <span className="inline-block px-4 py-2 bg-[#0f392b]/10 rounded-full text-sm font-medium text-[#0f392b] tracking-widest uppercase">
                                Rehabilitation & Welfare
                            </span>
                            <h1 className="font-manrope text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f392b] tracking-tight leading-none">
                                Your Journey to Recovery Starts Here
                            </h1>
                            <p className="text-lg text-[#5c706a] leading-relaxed max-w-xl">
                                HavenWelfare connects patients with verified doctors and rehabilitation centers. 
                                Our platform ensures transparent donations and comprehensive care for those on the path to recovery.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/register" data-testid="hero-get-started">
                                    <Button className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                                        Get Started <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link to="/donate" data-testid="hero-donate">
                                    <Button variant="outline" className="border-2 border-[#0f392b] text-[#0f392b] rounded-full px-8 py-6 text-lg font-semibold hover:bg-[#0f392b] hover:text-white transition-all duration-300">
                                        Make a Donation
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute -top-4 -left-4 w-full h-full bg-[#d97757]/20 rounded-3xl"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&h=600&fit=crop"
                                alt="Doctor consulting patient"
                                className="relative rounded-3xl shadow-2xl w-full object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-[#0f392b]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <p className="font-manrope text-4xl lg:text-5xl font-bold text-white">{stat.value}</p>
                                <p className="text-white/70 mt-2">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-[#d97757] font-semibold tracking-widest uppercase text-sm">Why Choose Us</span>
                        <h2 className="font-manrope text-3xl lg:text-4xl font-bold text-[#0f392b] mt-4 tracking-tight">
                            Comprehensive Care & Support
                        </h2>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="card-haven p-8 text-center group hover:bg-gradient-to-br hover:from-white hover:to-[#f4f1ea]"
                            >
                                <div className="w-16 h-16 bg-[#f4f1ea] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d97757] transition-colors duration-300">
                                    <feature.icon className="w-8 h-8 text-[#0f392b] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="font-manrope text-xl font-semibold text-[#0f392b] mb-3">{feature.title}</h3>
                                <p className="text-[#5c706a] leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 bg-[#f4f1ea]">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-[#d97757] font-semibold tracking-widest uppercase text-sm">How It Works</span>
                        <h2 className="font-manrope text-3xl lg:text-4xl font-bold text-[#0f392b] mt-4 tracking-tight">
                            Simple Steps to Get Started
                        </h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Register & Verify', desc: 'Create your account as a patient or doctor. Admin will verify your profile.' },
                            { step: '02', title: 'Connect & Choose', desc: 'Patients can browse verified doctors and rehab centers to start their journey.' },
                            { step: '03', title: 'Begin Recovery', desc: 'Start your treatment with professional support and community backing.' }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <span className="font-manrope text-8xl font-bold text-[#0f392b]/5 absolute -top-4 left-0">{item.step}</span>
                                <div className="relative pt-12">
                                    <h3 className="font-manrope text-xl font-semibold text-[#0f392b] mb-3">{item.title}</h3>
                                    <p className="text-[#5c706a] leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 bg-[#0f392b]">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-manrope text-3xl lg:text-5xl font-bold text-white tracking-tight mb-6">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of individuals who have found hope and support through HavenWelfare.
                            Your path to recovery begins with a single step.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/register" data-testid="cta-register">
                                <Button className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full px-8 py-6 text-lg font-semibold">
                                    Register Now
                                </Button>
                            </Link>
                            <Link to="/donate" data-testid="cta-donate">
                                <Button variant="outline" className="border-2 border-white text-white rounded-full px-8 py-6 text-lg font-semibold hover:bg-white hover:text-[#0f392b]">
                                    Support a Patient
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0a2a1f] py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col gap-8">
                        {/* Top Row */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-3">
                                <img src={LOGO_URL} alt="HavenWelfare" className="w-10 h-10 object-contain" />
                                <span className="font-manrope text-xl font-bold text-white">HavenWelfare</span>
                            </div>
                            {/* Footer Links */}
                            <div className="flex flex-wrap justify-center gap-6">
                                <Link to="/about" className="text-white/70 hover:text-white transition-colors text-sm">
                                    About Us
                                </Link>
                                <Link to="/contact" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Contact Us
                                </Link>
                                <Link to="/donate" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Donate
                                </Link>
                                <Link to="/privacy-policy" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>
                        {/* Bottom Row */}
                        <div className="border-t border-white/10 pt-6 text-center">
                            <p className="text-white/50 text-sm">
                                © {new Date().getFullYear()} HavenWelfare. All rights reserved. Empowering recovery, one step at a time.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
