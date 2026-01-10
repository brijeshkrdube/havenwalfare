import React, { useState, useEffect } from 'react';
import { addictionTypesAPI } from '../../lib/api';
import { Heart, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const AddictionTypes = () => {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        severity_levels: []
    });
    const [levelsInput, setLevelsInput] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const response = await addictionTypesAPI.getAll();
            setTypes(response.data);
        } catch (error) {
            toast.error('Failed to load addiction types');
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (type = null) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name,
                description: type.description || '',
                severity_levels: type.severity_levels || []
            });
            setLevelsInput((type.severity_levels || []).join(', '));
        } else {
            setEditingType(null);
            setFormData({ name: '', description: '', severity_levels: [] });
            setLevelsInput('');
        }
        setShowDialog(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const data = {
            ...formData,
            severity_levels: levelsInput.split(',').map(l => l.trim()).filter(l => l)
        };

        try {
            if (editingType) {
                await addictionTypesAPI.update(editingType.id, data);
                toast.success('Addiction type updated');
            } else {
                await addictionTypesAPI.create(data);
                toast.success('Addiction type created');
            }
            setShowDialog(false);
            fetchTypes();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this addiction type?')) return;

        try {
            await addictionTypesAPI.delete(id);
            toast.success('Addiction type deleted');
            fetchTypes();
        } catch (error) {
            toast.error('Failed to delete addiction type');
        }
    };

    return (
        <div className="space-y-6 fade-in" data-testid="addiction-types">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">Addiction Types</h1>
                    <p className="text-[#5c706a]">Manage addiction categories and severity levels</p>
                </div>
                <Button 
                    onClick={() => openDialog()}
                    className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                    data-testid="add-type-btn"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Type
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                </div>
            ) : types.length === 0 ? (
                <Card className="card-haven">
                    <CardContent className="text-center py-12">
                        <Heart className="w-16 h-16 text-[#5c706a] mx-auto mb-4" />
                        <h3 className="font-manrope text-xl font-semibold text-[#0f392b] mb-2">No Addiction Types</h3>
                        <p className="text-[#5c706a] mb-4">Add your first addiction category</p>
                        <Button 
                            onClick={() => openDialog()}
                            className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Type
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {types.map((type) => (
                        <Card key={type.id} className="card-haven" data-testid={`type-${type.id}`}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-[#d97757]/10 rounded-xl flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-[#d97757]" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openDialog(type)}
                                            data-testid={`edit-type-${type.id}`}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(type.id)}
                                            data-testid={`delete-type-${type.id}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="font-manrope text-lg font-semibold text-[#0f392b] mb-2">{type.name}</h3>
                                {type.description && (
                                    <p className="text-sm text-[#5c706a] mb-4 line-clamp-2">{type.description}</p>
                                )}
                                {type.severity_levels?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {type.severity_levels.map((level, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-[#f4f1ea] text-[#0f392b] text-xs rounded-full">
                                                {level}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-manrope text-xl text-[#0f392b]">
                            {editingType ? 'Edit Addiction Type' : 'Add Addiction Type'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="type-name-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                rows={3}
                                data-testid="type-description-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="levels">Severity Levels (comma separated)</Label>
                            <Input
                                id="levels"
                                value={levelsInput}
                                onChange={(e) => setLevelsInput(e.target.value)}
                                placeholder="e.g., Mild, Moderate, Severe, Critical"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="type-levels-input"
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
                                data-testid="save-type-btn"
                            >
                                {saving ? 'Saving...' : editingType ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddictionTypes;
