import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { CreditCard, Upload, Save, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PaymentSettings = () => {
    const [settings, setSettings] = useState({
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        account_holder_name: '',
        upi_id: '',
        qr_code_url: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await adminAPI.getPaymentSettings();
            if (response.data) {
                setSettings({
                    bank_name: response.data.bank_name || '',
                    account_number: response.data.account_number || '',
                    ifsc_code: response.data.ifsc_code || '',
                    account_holder_name: response.data.account_holder_name || '',
                    upi_id: response.data.upi_id || '',
                    qr_code_url: response.data.qr_code_url || ''
                });
            }
        } catch (error) {
            toast.error('Failed to load payment settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await adminAPI.updatePaymentSettings({
                bank_name: settings.bank_name,
                account_number: settings.account_number,
                ifsc_code: settings.ifsc_code,
                account_holder_name: settings.account_holder_name,
                upi_id: settings.upi_id
            });
            toast.success('Payment settings updated');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleQRUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await adminAPI.uploadQRCode(file);
            setSettings({ ...settings, qr_code_url: response.data.qr_code_url });
            toast.success('QR code uploaded');
        } catch (error) {
            toast.error('Failed to upload QR code');
        } finally {
            setUploading(false);
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
        <div className="space-y-6 fade-in" data-testid="payment-settings">
            <div>
                <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">Payment Settings</h1>
                <p className="text-[#5c706a]">Configure bank details and UPI for receiving donations</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Bank Details */}
                <Card className="card-haven">
                    <CardHeader>
                        <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Bank Account Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bank_name">Bank Name</Label>
                                <Input
                                    id="bank_name"
                                    value={settings.bank_name}
                                    onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                                    placeholder="e.g., State Bank of India"
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="bank-name-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_holder_name">Account Holder Name</Label>
                                <Input
                                    id="account_holder_name"
                                    value={settings.account_holder_name}
                                    onChange={(e) => setSettings({ ...settings, account_holder_name: e.target.value })}
                                    placeholder="Account holder name"
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="holder-name-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_number">Account Number</Label>
                                <Input
                                    id="account_number"
                                    value={settings.account_number}
                                    onChange={(e) => setSettings({ ...settings, account_number: e.target.value })}
                                    placeholder="Enter account number"
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="account-number-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ifsc_code">IFSC Code</Label>
                                <Input
                                    id="ifsc_code"
                                    value={settings.ifsc_code}
                                    onChange={(e) => setSettings({ ...settings, ifsc_code: e.target.value })}
                                    placeholder="e.g., SBIN0001234"
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="ifsc-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="upi_id">UPI ID</Label>
                                <Input
                                    id="upi_id"
                                    value={settings.upi_id}
                                    onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                                    placeholder="e.g., havenwelfare@upi"
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="upi-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                                data-testid="save-payment-btn"
                            >
                                {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* QR Code */}
                <Card className="card-haven">
                    <CardHeader>
                        <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            Payment QR Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {settings.qr_code_url ? (
                                <div className="flex flex-col items-center">
                                    <img 
                                        src={`${BACKEND_URL}${settings.qr_code_url}`}
                                        alt="Payment QR Code"
                                        className="max-w-[250px] rounded-xl border-4 border-[#f4f1ea]"
                                    />
                                    <p className="text-sm text-[#5c706a] mt-2">Current QR Code</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8">
                                    <QrCode className="w-16 h-16 text-[#5c706a] mb-4" />
                                    <p className="text-[#5c706a]">No QR code uploaded</p>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="qr_upload" className="cursor-pointer">
                                    <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#e0e6e4] rounded-xl hover:border-[#0f392b] transition-colors">
                                        <Upload className="w-5 h-5 text-[#5c706a]" />
                                        <span className="text-[#5c706a]">
                                            {uploading ? 'Uploading...' : 'Upload new QR code'}
                                        </span>
                                    </div>
                                    <Input
                                        id="qr_upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleQRUpload}
                                        className="hidden"
                                        disabled={uploading}
                                        data-testid="qr-upload-input"
                                    />
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Card */}
            <Card className="card-haven">
                <CardHeader>
                    <CardTitle className="font-manrope text-lg text-[#0f392b]">Donor View Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-[#5c706a] mb-4">This is how donors will see the payment information:</p>
                    <div className="p-6 bg-[#f8f9fa] rounded-xl space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[#5c706a]">Bank Name</p>
                                <p className="font-semibold text-[#0f392b]">{settings.bank_name || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#5c706a]">Account Holder</p>
                                <p className="font-semibold text-[#0f392b]">{settings.account_holder_name || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#5c706a]">Account Number</p>
                                <p className="font-semibold text-[#0f392b]">{settings.account_number || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#5c706a]">IFSC Code</p>
                                <p className="font-semibold text-[#0f392b]">{settings.ifsc_code || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#5c706a]">UPI ID</p>
                                <p className="font-semibold text-[#0f392b]">{settings.upi_id || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSettings;
