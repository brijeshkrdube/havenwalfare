import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicAPI } from '../lib/api';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3463593f-4cba-425e-a575-89c0d925427c/artifacts/n1f21t65_unnamed-removebg-preview.png";

const EventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await publicAPI.getEvent(id);
                setEvent(response.data);
            } catch (error) {
                setError('Event not found');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0f392b] border-t-transparent"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4]">
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
                    <h1 className="font-manrope text-3xl font-bold text-[#0f392b] mb-4">Event Not Found</h1>
                    <p className="text-[#5c706a] mb-6">The event you're looking for doesn't exist or has been removed.</p>
                    <Link to="/">
                        <Button className="bg-[#d97757] hover:bg-[#c26649] text-white">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

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

            {/* Hero Image */}
            {event.image_url && (
                <div className="w-full h-64 sm:h-96 bg-[#0f392b]">
                    <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover opacity-90"
                    />
                </div>
            )}

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 -mt-20 relative">
                    {/* Event Date Badge */}
                    {event.event_date && (
                        <div className="inline-flex items-center gap-2 bg-[#d97757] text-white px-4 py-2 rounded-full text-sm mb-6">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.event_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="font-manrope text-3xl sm:text-4xl font-bold text-[#0f392b] mb-6">
                        {event.title}
                    </h1>

                    {/* Description */}
                    <div className="prose prose-lg max-w-none">
                        <p className="text-[#5c706a] leading-relaxed whitespace-pre-line text-lg">
                            {event.description}
                        </p>
                    </div>

                    {/* Posted Date */}
                    <div className="mt-8 pt-6 border-t border-[#e0e6e4]">
                        <p className="text-sm text-[#5c706a] flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Posted on {new Date(event.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 bg-[#0f392b] rounded-2xl p-8 text-center text-white">
                    <h3 className="font-manrope text-2xl font-bold mb-4">Want to Get Involved?</h3>
                    <p className="text-white/80 mb-6">Join our community and make a difference in someone's life.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/donate">
                            <Button className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full px-8">
                                Donate Now
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                                Join Us
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

export default EventDetail;
