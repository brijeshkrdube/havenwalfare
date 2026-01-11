import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { Globe, FileText, MapPin, Mail, Phone, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const SiteSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        about_us: '',
        contact_address: '',
        contact_email: '',
        contact_phone: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await adminAPI.getSiteSettings();
            setSettings({
                about_us: response.data.about_us || '',
                contact_address: response.data.contact_address || '',
                contact_email: response.data.contact_email || '',
                contact_phone: response.data.contact_phone || ''
            });
        } catch (error) {
            toast.error('Failed to load site settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminAPI.updateSiteSettings(settings);
            toast.success('Site settings updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-manrope text-3xl font-bold text-[#0f392b]">Site Settings</h1>
                <p className="text-[#5c706a] mt-1">Manage About Us and Contact Us page content</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* About Us Section */}
                <Card className="border-[#e0e6e4]">
                    <CardHeader>
                        <CardTitle className="font-manrope text-xl text-[#0f392b] flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#d97757]" />
                            About Us Content
                        </CardTitle>
                        <CardDescription>
                            This content will appear on the public About Us page
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="about_us">About Us Text</Label>
                                <Textarea
                                    id="about_us"
                                    name="about_us"
                                    value={settings.about_us}
                                    onChange={handleChange}
                                    placeholder="Enter your organization's description, mission, vision..."
                                    rows={12}
                                    className="border-[#e0e6e4] focus:border-[#d97757] resize-none"
                                />
                                <p className="text-xs text-[#5c706a]">
                                    Tip: Use line breaks to create paragraphs
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border-[#e0e6e4]">
                    <CardHeader>
                        <CardTitle className="font-manrope text-xl text-[#0f392b] flex items-center gap-2">
                            <Globe className="w-5 h-5 text-[#d97757]" />
                            Contact Information
                        </CardTitle>
                        <CardDescription>
                            This information will appear on the Contact Us page
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact_address" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#5c706a]" />
                                    Address
                                </Label>
                                <Textarea
                                    id="contact_address"
                                    name="contact_address"
                                    value={settings.contact_address}
                                    onChange={handleChange}
                                    placeholder="123 Main Street&#10;City, State 12345&#10;Country"
                                    rows={3}
                                    className="border-[#e0e6e4] focus:border-[#d97757] resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_email" className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-[#5c706a]" />
                                    Email Address
                                </Label>
                                <Input
                                    id="contact_email"
                                    name="contact_email"
                                    type="email"
                                    value={settings.contact_email}
                                    onChange={handleChange}
                                    placeholder="contact@havenwelfare.com"
                                    className="border-[#e0e6e4] focus:border-[#d97757]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_phone" className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-[#5c706a]" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="contact_phone"
                                    name="contact_phone"
                                    value={settings.contact_phone}
                                    onChange={handleChange}
                                    placeholder="+1 (234) 567-8900"
                                    className="border-[#e0e6e4] focus:border-[#d97757]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Links */}
            <Card className="border-[#e0e6e4] bg-[#f4f1ea]/50">
                <CardContent className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-[#0f392b] mb-1">Preview Pages</h3>
                            <p className="text-sm text-[#5c706a]">View how your changes will appear to visitors</p>
                        </div>
                        <div className="flex gap-3">
                            <a href="/about" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="border-[#0f392b] text-[#0f392b]">
                                    View About Us
                                </Button>
                            </a>
                            <a href="/contact" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="border-[#0f392b] text-[#0f392b]">
                                    View Contact Us
                                </Button>
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#d97757] hover:bg-[#c26649] text-white px-8"
                >
                    {saving ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save All Settings
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default SiteSettings;
