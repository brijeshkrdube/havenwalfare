import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../lib/api';
import { Calendar, Plus, Edit2, Trash2, Eye, EyeOff, Image, X, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

const EventsManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        event_date: '',
        is_active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await eventsAPI.getAll();
            setEvents(response.data);
        } catch (error) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openCreateDialog = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            image_url: '',
            event_date: '',
            is_active: true
        });
        setImageFile(null);
        setImagePreview(null);
        setShowDialog(true);
    };

    const openEditDialog = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            image_url: event.image_url || '',
            event_date: event.event_date || '',
            is_active: event.is_active
        });
        setImageFile(null);
        setImagePreview(event.image_url);
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.description) {
            toast.error('Title and description are required');
            return;
        }

        setSaving(true);
        try {
            let event;
            if (editingEvent) {
                const response = await eventsAPI.update(editingEvent.id, formData);
                event = response.data;
                toast.success('Event updated successfully');
            } else {
                const response = await eventsAPI.create(formData);
                event = response.data;
                toast.success('Event created successfully');
            }

            // Upload image if selected
            if (imageFile && event.id) {
                await eventsAPI.uploadImage(event.id, imageFile);
            }

            setShowDialog(false);
            fetchEvents();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to save event');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (event) => {
        if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
            return;
        }

        try {
            await eventsAPI.delete(event.id);
            toast.success('Event deleted successfully');
            fetchEvents();
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    const toggleActive = async (event) => {
        try {
            await eventsAPI.update(event.id, { is_active: !event.is_active });
            toast.success(event.is_active ? 'Event hidden' : 'Event published');
            fetchEvents();
        } catch (error) {
            toast.error('Failed to update event');
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-manrope text-3xl font-bold text-[#0f392b]">Events Management</h1>
                    <p className="text-[#5c706a] mt-1">Manage events displayed on the homepage slider</p>
                </div>
                <Button 
                    onClick={openCreateDialog}
                    className="bg-[#d97757] hover:bg-[#c26649] text-white"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Event
                </Button>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <Card className="border-[#e0e6e4]">
                    <CardContent className="p-12 text-center">
                        <Calendar className="w-16 h-16 text-[#5c706a]/30 mx-auto mb-4" />
                        <h3 className="font-manrope text-xl font-semibold text-[#0f392b] mb-2">No Events Yet</h3>
                        <p className="text-[#5c706a] mb-4">Create your first event to display on the homepage</p>
                        <Button onClick={openCreateDialog} className="bg-[#d97757] hover:bg-[#c26649] text-white">
                            <Plus className="w-4 h-4 mr-2" /> Create Event
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Card key={event.id} className={`border-[#e0e6e4] overflow-hidden ${!event.is_active && 'opacity-60'}`}>
                            {/* Event Image */}
                            <div className="aspect-video bg-[#f4f1ea] relative">
                                {event.image_url ? (
                                    <img 
                                        src={event.image_url} 
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Image className="w-12 h-12 text-[#5c706a]/30" />
                                    </div>
                                )}
                                {/* Status Badge */}
                                <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    event.is_active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {event.is_active ? 'Published' : 'Hidden'}
                                </span>
                            </div>

                            <CardContent className="p-4">
                                <h3 className="font-manrope text-lg font-semibold text-[#0f392b] mb-2 line-clamp-1">
                                    {event.title}
                                </h3>
                                <p className="text-[#5c706a] text-sm mb-4 line-clamp-2">
                                    {event.description}
                                </p>
                                {event.event_date && (
                                    <p className="text-xs text-[#5c706a] mb-4">
                                        <Calendar className="w-3 h-3 inline mr-1" />
                                        {new Date(event.event_date).toLocaleDateString()}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditDialog(event)}
                                        className="flex-1"
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleActive(event)}
                                        className={event.is_active ? 'text-yellow-600' : 'text-green-600'}
                                    >
                                        {event.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(event)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-manrope text-xl text-[#0f392b] flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#d97757]" />
                            {editingEvent ? 'Edit Event' : 'Create Event'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Event Image</Label>
                            <div className="border-2 border-dashed border-[#e0e6e4] rounded-lg p-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview(null);
                                                setFormData({...formData, image_url: ''});
                                            }}
                                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                                        <Upload className="w-8 h-8 text-[#5c706a] mb-2" />
                                        <span className="text-sm text-[#5c706a]">Click to upload image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-[#5c706a]">Or paste an image URL:</p>
                            <Input
                                name="image_url"
                                value={formData.image_url}
                                onChange={(e) => {
                                    handleChange(e);
                                    if (e.target.value && !imageFile) {
                                        setImagePreview(e.target.value);
                                    }
                                }}
                                placeholder="https://example.com/image.jpg"
                                className="border-[#e0e6e4]"
                            />
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title *</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter event title"
                                className="border-[#e0e6e4] focus:border-[#d97757]"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter event description..."
                                rows={4}
                                className="border-[#e0e6e4] focus:border-[#d97757] resize-none"
                            />
                        </div>

                        {/* Event Date */}
                        <div className="space-y-2">
                            <Label htmlFor="event_date">Event Date</Label>
                            <Input
                                id="event_date"
                                name="event_date"
                                type="date"
                                value={formData.event_date}
                                onChange={handleChange}
                                className="border-[#e0e6e4] focus:border-[#d97757]"
                            />
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between p-4 bg-[#f4f1ea] rounded-lg">
                            <div>
                                <p className="font-medium text-[#0f392b]">Publish Event</p>
                                <p className="text-sm text-[#5c706a]">Show this event on the homepage</p>
                            </div>
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowDialog(false)}
                                className="border-[#e0e6e4]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-[#d97757] hover:bg-[#c26649] text-white"
                            >
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    editingEvent ? 'Update Event' : 'Create Event'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventsManagement;
