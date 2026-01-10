import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { Mail, Save, TestTube } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const SMTPSettings = () => {
    const [settings, setSettings] = useState({
        sendgrid_api_key: '',
        sender_email: '',
        sender_name: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await adminAPI.getSMTPSettings();
            if (response.data) {
                setSettings({
                    sendgrid_api_key: response.data.sendgrid_api_key || '',
                    sender_email: response.data.sender_email || '',
                    sender_name: response.data.sender_name || ''
                });
            }
        } catch (error) {
            toast.error('Failed to load SMTP settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Only send API key if it's been changed (not masked)
            const updateData = {
                sender_email: settings.sender_email,
                sender_name: settings.sender_name
            };
            
            if (settings.sendgrid_api_key && !settings.sendgrid_api_key.includes('...')) {
                updateData.sendgrid_api_key = settings.sendgrid_api_key;
            }

            await adminAPI.updateSMTPSettings(updateData);
            toast.success('SMTP settings updated');
            fetchSettings(); // Refresh to get masked key
        } catch (error) {
            toast.error('Failed to update settings');
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
        <div className="space-y-6 fade-in" data-testid="smtp-settings">
            <div>
                <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">SMTP Settings</h1>
                <p className="text-[#5c706a]">Configure SendGrid for password reset and notification emails</p>
            </div>

            <Card className="card-haven max-w-2xl">
                <CardHeader>
                    <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        SendGrid Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sendgrid_api_key">SendGrid API Key</Label>
                            <Input
                                id="sendgrid_api_key"
                                type="password"
                                value={settings.sendgrid_api_key}
                                onChange={(e) => setSettings({ ...settings, sendgrid_api_key: e.target.value })}
                                placeholder="Enter your SendGrid API key"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="api-key-input"
                            />
                            <p className="text-xs text-[#5c706a]">
                                Get your API key from{' '}
                                <a 
                                    href="https://app.sendgrid.com/settings/api_keys" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#d97757] hover:underline"
                                >
                                    SendGrid Dashboard
                                </a>
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sender_email">Sender Email</Label>
                            <Input
                                id="sender_email"
                                type="email"
                                value={settings.sender_email}
                                onChange={(e) => setSettings({ ...settings, sender_email: e.target.value })}
                                placeholder="noreply@yourdomain.com"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="sender-email-input"
                            />
                            <p className="text-xs text-[#5c706a]">
                                This email must be verified in your SendGrid account
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sender_name">Sender Name</Label>
                            <Input
                                id="sender_name"
                                value={settings.sender_name}
                                onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                                placeholder="HavenWelfare"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="sender-name-input"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                            data-testid="save-smtp-btn"
                        >
                            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="card-haven max-w-2xl border-[#d97757]/30 bg-[#d97757]/5">
                <CardContent className="p-6">
                    <h3 className="font-manrope font-semibold text-[#0f392b] mb-2">Important Notes</h3>
                    <ul className="space-y-2 text-sm text-[#5c706a]">
                        <li>• SendGrid is used for sending password reset emails</li>
                        <li>• Make sure to verify your sender email in SendGrid</li>
                        <li>• Use an API key with "Mail Send" permission</li>
                        <li>• Without SMTP configuration, password reset emails won't be sent</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default SMTPSettings;
