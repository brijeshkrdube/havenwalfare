import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Mail, Phone, Clock, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { publicAPI } from '../lib/api';
import { toast } from 'sonner';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3463593f-4cba-425e-a575-89c0d925427c/artifacts/n1f21t65_unnamed-removebg-preview.png";

const ContactUs = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now, just show a success message
        // In production, this would send to a backend endpoint
        toast.success('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

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
                    <h1 className="font-manrope text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
                    <p className="text-xl text-white/80">We're here to help you on your journey</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="font-manrope text-2xl font-bold text-[#0f392b] mb-6">Get in Touch</h2>
                            
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {settings?.contact_address && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-6 h-6 text-[#d97757]" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#0f392b] mb-1">Address</h3>
                                                <p className="text-[#5c706a] whitespace-pre-line">{settings.contact_address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {settings?.contact_email && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-6 h-6 text-[#d97757]" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#0f392b] mb-1">Email</h3>
                                                <a href={`mailto:${settings.contact_email}`} className="text-[#d97757] hover:underline">
                                                    {settings.contact_email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {settings?.contact_phone && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Phone className="w-6 h-6 text-[#d97757]" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#0f392b] mb-1">Phone</h3>
                                                <a href={`tel:${settings.contact_phone}`} className="text-[#d97757] hover:underline">
                                                    {settings.contact_phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {!settings?.contact_address && !settings?.contact_email && !settings?.contact_phone && (
                                        <p className="text-[#5c706a] text-center py-4">
                                            Contact information will be available soon.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Hours */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#0f392b]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-[#0f392b]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#0f392b] mb-2">Support Hours</h3>
                                    <p className="text-[#5c706a]">Monday - Friday: 9:00 AM - 6:00 PM</p>
                                    <p className="text-[#5c706a]">Saturday: 10:00 AM - 4:00 PM</p>
                                    <p className="text-[#5c706a]">Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="font-manrope text-2xl font-bold text-[#0f392b] mb-6">Send a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Your Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="border-[#e0e6e4] focus:border-[#d97757]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    className="border-[#e0e6e4] focus:border-[#d97757]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="How can we help?"
                                    className="border-[#e0e6e4] focus:border-[#d97757]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Your message..."
                                    rows={5}
                                    className="border-[#e0e6e4] focus:border-[#d97757] resize-none"
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-[#d97757] hover:bg-[#c26649] text-white"
                            >
                                <Send className="w-4 h-4 mr-2" /> Send Message
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-[#5c706a]">
                    <p>© {new Date().getFullYear()} HavenWelfare. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
