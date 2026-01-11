import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Building2, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { publicAPI } from '../lib/api';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3463593f-4cba-425e-a575-89c0d925427c/artifacts/n1f21t65_unnamed-removebg-preview.png";

const AboutUs = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await publicAPI.getSiteSettings();
                setSettings(response.data);
            } catch (error) {
                console.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const features = [
        {
            icon: Shield,
            title: 'Verified Professionals',
            description: 'All doctors and rehab centers are thoroughly verified and approved.'
        },
        {
            icon: Heart,
            title: 'Compassionate Care',
            description: 'We believe in treating every individual with dignity and respect.'
        },
        {
            icon: Users,
            title: 'Community Support',
            description: 'Join a supportive community on the journey to recovery.'
        },
        {
            icon: Building2,
            title: 'Trusted Facilities',
            description: 'Partner with certified rehabilitation facilities across the region.'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4]">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-lg border-b border-[#e0e6e4] sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 sm:gap-3">
                        <img src={LOGO_URL} alt="HavenWelfare" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                        <span className="font-manrope text-lg sm:text-xl font-bold text-[#0f392b]">HavenWelfare</span>
                    </Link>
                    <Link to="/">
                        <Button variant="ghost" className="text-[#0f392b]">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-[#0f392b] text-white py-16 sm:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <h1 className="font-manrope text-4xl sm:text-5xl font-bold mb-4">About Us</h1>
                    <p className="text-xl text-white/80">Empowering recovery, one step at a time</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 mb-8">
                    <h2 className="font-manrope text-2xl font-bold text-[#0f392b] mb-6">Our Mission</h2>
                    
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="prose prose-lg max-w-none">
                            <p className="text-[#5c706a] leading-relaxed whitespace-pre-line">
                                {settings?.about_us || 
                                    `Welcome to HavenWelfare.

We are dedicated to supporting rehabilitation and de-addiction programs, connecting patients with verified doctors and trusted rehab centers.

Our platform facilitates transparent donations, ensuring every contribution reaches those in need. We believe in the power of community support and professional care in the journey to recovery.

At HavenWelfare, we maintain the highest standards of privacy and confidentiality, treating every individual with dignity and respect.`
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-[#d97757]" />
                            </div>
                            <h3 className="font-manrope text-lg font-bold text-[#0f392b] mb-2">{feature.title}</h3>
                            <p className="text-[#5c706a]">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="bg-[#0f392b] rounded-2xl p-8 text-center text-white">
                    <h3 className="font-manrope text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
                    <p className="text-white/80 mb-6">Join our community and take the first step towards recovery.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register">
                            <Button className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full px-8">
                                Get Started
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-[#5c706a]">
                    <p>© {new Date().getFullYear()} HavenWelfare. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
