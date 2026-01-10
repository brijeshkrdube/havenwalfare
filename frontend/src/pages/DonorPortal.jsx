import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationsAPI } from '../lib/api';
import { HandCoins, User, ArrowRight, CreditCard, QrCode, Upload, Search, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_heal-haven/artifacts/tlnpq5i2_Gemini_Generated_Image_92dtgl92dtgl92dt__1_-removebg-preview.png";

const DonorPortal = () => {
    const [patients, setPatients] = useState([]);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        patient_id: '',
        amount: '',
        transaction_id: '',
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        screenshot: null,
        disclaimer: false
    });
    const [trackingId, setTrackingId] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [patientsRes, paymentRes] = await Promise.all([
                donationsAPI.getPatients(),
                donationsAPI.getPaymentInfo()
            ]);
            setPatients(patientsRes.data);
            setPaymentInfo(paymentRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.disclaimer) {
            toast.error('Please accept the disclaimer');
            return;
        }

        if (!formData.patient_id || !formData.amount || !formData.transaction_id) {
            toast.error('Please fill all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('patient_id', formData.patient_id);
            data.append('amount', formData.amount);
            data.append('transaction_id', formData.transaction_id);
            if (formData.donor_name) data.append('donor_name', formData.donor_name);
            if (formData.donor_email) data.append('donor_email', formData.donor_email);
            if (formData.donor_phone) data.append('donor_phone', formData.donor_phone);
            if (formData.screenshot) data.append('screenshot', formData.screenshot);

            await donationsAPI.submit(data);
            toast.success('Donation submitted successfully! It will be verified by admin.');
            
            setFormData({
                patient_id: '',
                amount: '',
                transaction_id: '',
                donor_name: '',
                donor_email: '',
                donor_phone: '',
                screenshot: null,
                disclaimer: false
            });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to submit donation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTrack = async () => {
        if (!trackingId) {
            toast.error('Please enter a transaction ID');
            return;
        }

        try {
            const response = await donationsAPI.track(trackingId);
            setTrackingResult(response.data);
        } catch (error) {
            toast.error('Donation not found');
            setTrackingResult(null);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4]">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#e0e6e4]">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
                        <img src={LOGO_URL} alt="HavenWelfare" className="w-10 h-10 object-contain" />
                        <span className="font-manrope text-xl font-bold text-[#0f392b]">HavenWelfare</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/login" data-testid="login-link">
                            <Button variant="outline" className="border-[#0f392b] text-[#0f392b] rounded-full">
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 bg-[#d97757]/10 rounded-full text-sm font-medium text-[#d97757] tracking-widest uppercase mb-4">
                        Make a Difference
                    </span>
                    <h1 className="font-manrope text-4xl font-bold text-[#0f392b] tracking-tight mb-4">
                        Support Someone's Recovery
                    </h1>
                    <p className="text-[#5c706a] max-w-2xl mx-auto">
                        Your donation directly helps patients on their journey to recovery. 
                        All donations are manually verified for complete transparency.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0f392b] border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Patients List */}
                        <div className="lg:col-span-1">
                            <Card className="card-haven sticky top-24">
                                <CardHeader>
                                    <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Select Patient
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                        <Input
                                            placeholder="Search patients..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 border-[#e0e6e4] focus:border-[#0f392b]"
                                            data-testid="search-patients"
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {filteredPatients.length === 0 ? (
                                            <p className="text-center text-[#5c706a] py-4">No approved patients found</p>
                                        ) : (
                                            filteredPatients.map((patient) => (
                                                <div
                                                    key={patient.id}
                                                    onClick={() => setFormData({ ...formData, patient_id: patient.id })}
                                                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                                                        formData.patient_id === patient.id
                                                            ? 'bg-[#0f392b] text-white'
                                                            : 'bg-[#f8f9fa] hover:bg-[#f4f1ea]'
                                                    }`}
                                                    data-testid={`patient-${patient.id}`}
                                                >
                                                    <p className="font-semibold">{patient.name}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Donation Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Payment Info */}
                            {paymentInfo && (paymentInfo.bank_name || paymentInfo.upi_id) && (
                                <Card className="card-haven bg-[#0f392b] text-white">
                                    <CardHeader>
                                        <CardTitle className="font-manrope text-lg flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Payment Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                {paymentInfo.bank_name && (
                                                    <>
                                                        <div>
                                                            <p className="text-white/60 text-sm">Bank Name</p>
                                                            <p className="font-semibold">{paymentInfo.bank_name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-white/60 text-sm">Account Holder</p>
                                                            <p className="font-semibold">{paymentInfo.account_holder_name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-white/60 text-sm">Account Number</p>
                                                            <p className="font-semibold font-mono">{paymentInfo.account_number}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-white/60 text-sm">IFSC Code</p>
                                                            <p className="font-semibold font-mono">{paymentInfo.ifsc_code}</p>
                                                        </div>
                                                    </>
                                                )}
                                                {paymentInfo.upi_id && (
                                                    <div>
                                                        <p className="text-white/60 text-sm">UPI ID</p>
                                                        <p className="font-semibold">{paymentInfo.upi_id}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {paymentInfo.qr_code_url && (
                                                <div className="flex justify-center">
                                                    <div className="bg-white p-4 rounded-xl">
                                                        <img 
                                                            src={`${BACKEND_URL}${paymentInfo.qr_code_url}`}
                                                            alt="Payment QR Code"
                                                            className="max-w-[180px]"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Donation Form */}
                            <Card className="card-haven">
                                <CardHeader>
                                    <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                                        <HandCoins className="w-5 h-5" />
                                        Submit Donation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Selected Patient *</Label>
                                                <Input
                                                    value={patients.find(p => p.id === formData.patient_id)?.name || 'Select from the list'}
                                                    disabled
                                                    className="bg-[#f8f9fa]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="amount">Amount (₹) *</Label>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    min="1"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                    placeholder="Enter donation amount"
                                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                                    required
                                                    data-testid="amount-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="transaction_id">Transaction ID / UTR *</Label>
                                            <Input
                                                id="transaction_id"
                                                value={formData.transaction_id}
                                                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                                                placeholder="Enter transaction ID from your payment"
                                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                                required
                                                data-testid="transaction-id-input"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="donor_name">Your Name (Optional)</Label>
                                                <Input
                                                    id="donor_name"
                                                    value={formData.donor_name}
                                                    onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                                                    placeholder="Enter your name"
                                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                                    data-testid="donor-name-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="donor_email">Your Email (Optional)</Label>
                                                <Input
                                                    id="donor_email"
                                                    type="email"
                                                    value={formData.donor_email}
                                                    onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                                                    placeholder="Enter your email"
                                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                                    data-testid="donor-email-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="donor_phone">Your Phone (Optional)</Label>
                                                <Input
                                                    id="donor_phone"
                                                    value={formData.donor_phone}
                                                    onChange={(e) => setFormData({ ...formData, donor_phone: e.target.value })}
                                                    placeholder="Enter your phone"
                                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                                    data-testid="donor-phone-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Payment Screenshot (Optional)</Label>
                                            <div className="flex items-center gap-4">
                                                <Label htmlFor="screenshot" className="cursor-pointer flex-1">
                                                    <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#e0e6e4] rounded-xl hover:border-[#0f392b] transition-colors">
                                                        <Upload className="w-5 h-5 text-[#5c706a]" />
                                                        <span className="text-[#5c706a]">
                                                            {formData.screenshot ? formData.screenshot.name : 'Click to upload screenshot'}
                                                        </span>
                                                    </div>
                                                    <Input
                                                        id="screenshot"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setFormData({ ...formData, screenshot: e.target.files[0] })}
                                                        className="hidden"
                                                        data-testid="screenshot-input"
                                                    />
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-[#f8f9fa] rounded-xl">
                                            <Checkbox
                                                id="disclaimer"
                                                checked={formData.disclaimer}
                                                onCheckedChange={(checked) => setFormData({ ...formData, disclaimer: checked })}
                                                data-testid="disclaimer-checkbox"
                                            />
                                            <Label htmlFor="disclaimer" className="text-sm text-[#5c706a] cursor-pointer">
                                                I confirm that I have made the payment and the transaction details provided are accurate. 
                                                I understand that the donation will be verified by the admin before being credited.
                                            </Label>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={submitting || !formData.patient_id}
                                            className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full h-12 text-lg font-semibold"
                                            data-testid="submit-donation-btn"
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Donation'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Track Donation */}
                            <Card className="card-haven">
                                <CardHeader>
                                    <CardTitle className="font-manrope text-lg text-[#0f392b]">Track Your Donation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4">
                                        <Input
                                            value={trackingId}
                                            onChange={(e) => setTrackingId(e.target.value)}
                                            placeholder="Enter transaction ID"
                                            className="flex-1 border-[#e0e6e4] focus:border-[#0f392b]"
                                            data-testid="tracking-input"
                                        />
                                        <Button
                                            onClick={handleTrack}
                                            variant="outline"
                                            className="border-[#0f392b] text-[#0f392b]"
                                            data-testid="track-btn"
                                        >
                                            Track
                                        </Button>
                                    </div>
                                    {trackingResult && (
                                        <div className="p-4 bg-[#f8f9fa] rounded-xl space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[#5c706a]">Transaction ID:</span>
                                                <span className="font-mono text-[#0f392b]">{trackingResult.transaction_id}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[#5c706a]">Amount:</span>
                                                <span className="font-semibold text-[#d97757]">₹{trackingResult.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[#5c706a]">Status:</span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    trackingResult.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    trackingResult.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {trackingResult.status}
                                                </span>
                                            </div>
                                            {trackingResult.admin_remarks && (
                                                <div>
                                                    <span className="text-[#5c706a]">Remarks:</span>
                                                    <p className="text-[#0f392b] mt-1">{trackingResult.admin_remarks}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-[#0f392b] py-12 px-6 mt-16">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-white/50 text-sm">
                        © 2024 HavenWelfare. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default DonorPortal;
