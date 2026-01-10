import React, { useState, useEffect } from 'react';
import { rehabCentersAPI } from '../../lib/api';
import { Building2, Plus, Edit2, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const RehabCenters = () => {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingCenter, setEditingCenter] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        description: '',
        facilities: []
    });
    const [facilitiesInput, setFacilitiesInput] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        try {
            const response = await rehabCentersAPI.getAll();
            setCenters(response.data);
        } catch (error) {
            toast.error('Failed to load rehab centers');
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (center = null) => {
        if (center) {
            setEditingCenter(center);
            setFormData({
                name: center.name,
                address: center.address,
                city: center.city,
                state: center.state,
                pincode: center.pincode,
                phone: center.phone,
                email: center.email || '',
                description: center.description || '',
                facilities: center.facilities || []
            });
            setFacilitiesInput((center.facilities || []).join(', '));
        } else {
            setEditingCenter(null);
            setFormData({
                name: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                phone: '',
                email: '',
                description: '',
                facilities: []
            });
            setFacilitiesInput('');
        }
        setShowDialog(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const data = {
            ...formData,
            facilities: facilitiesInput.split(',').map(f => f.trim()).filter(f => f)
        };

        try {
            if (editingCenter) {
                await rehabCentersAPI.update(editingCenter.id, data);
                toast.success('Rehab center updated');
            } else {
                await rehabCentersAPI.create(data);
                toast.success('Rehab center created');
            }
            setShowDialog(false);
            fetchCenters();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this rehab center?')) return;

        try {
            await rehabCentersAPI.delete(id);
            toast.success('Rehab center deleted');
            fetchCenters();
        } catch (error) {
            toast.error('Failed to delete rehab center');
        }
    };

    return (
        <div className="space-y-6 fade-in" data-testid="rehab-centers">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">Rehab Centers</h1>
                    <p className="text-[#5c706a]">Manage rehabilitation facilities</p>
                </div>
                <Button 
                    onClick={() => openDialog()}
                    className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                    data-testid="add-center-btn"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Center
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                </div>
            ) : centers.length === 0 ? (
                <Card className="card-haven">
                    <CardContent className="text-center py-12">
                        <Building2 className="w-16 h-16 text-[#5c706a] mx-auto mb-4" />
                        <h3 className="font-manrope text-xl font-semibold text-[#0f392b] mb-2">No Rehab Centers</h3>
                        <p className="text-[#5c706a] mb-4">Add your first rehabilitation center</p>
                        <Button 
                            onClick={() => openDialog()}
                            className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Center
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {centers.map((center) => (
                        <Card key={center.id} className="card-haven" data-testid={`center-${center.id}`}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-[#f4f1ea] rounded-xl flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-[#0f392b]" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openDialog(center)}
                                            data-testid={`edit-${center.id}`}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(center.id)}
                                            data-testid={`delete-${center.id}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="font-manrope text-lg font-semibold text-[#0f392b] mb-2">{center.name}</h3>
                                <div className="space-y-2 text-sm text-[#5c706a]">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{center.address}, {center.city}, {center.state} - {center.pincode}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span>{center.phone}</span>
                                    </div>
                                    {center.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{center.email}</span>
                                        </div>
                                    )}
                                </div>
                                {center.facilities?.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {center.facilities.slice(0, 3).map((facility, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-[#f4f1ea] text-[#0f392b] text-xs rounded-full">
                                                {facility}
                                            </span>
                                        ))}
                                        {center.facilities.length > 3 && (
                                            <span className="px-2 py-1 bg-[#f4f1ea] text-[#0f392b] text-xs rounded-full">
                                                +{center.facilities.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-manrope text-xl text-[#0f392b]">
                            {editingCenter ? 'Edit Rehab Center' : 'Add Rehab Center'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Center Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="center-name-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="center-phone-input"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="center-email-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="center-address-input"
                            />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="center-city-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    required
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="center-state-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode *</Label>
                                <Input
                                    id="pincode"
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    required
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="center-pincode-input"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                rows={3}
                                data-testid="center-description-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facilities">Facilities (comma separated)</Label>
                            <Input
                                id="facilities"
                                value={facilitiesInput}
                                onChange={(e) => setFacilitiesInput(e.target.value)}
                                placeholder="e.g., Gym, Pool, Medical Staff, Counseling"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="center-facilities-input"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowDialog(false)}
                                className="border-[#0f392b] text-[#0f392b]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-[#d97757] hover:bg-[#c26649] text-white"
                                data-testid="save-center-btn"
                            >
                                {saving ? 'Saving...' : editingCenter ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RehabCenters;
