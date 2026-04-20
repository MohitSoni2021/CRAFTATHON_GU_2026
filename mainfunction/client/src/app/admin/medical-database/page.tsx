'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaPlus, FaTrash, FaCapsules, FaFlask, FaTimes, FaEdit } from 'react-icons/fa';

export default function MedicalDatabase() {
    const { token } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'medicines' | 'labTests'>('medicines');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const fetchItems = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'medicines' ? '/admin/medicines' : '/admin/lab-tests';
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(res.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        closeModal();
    }, [activeTab]);

    const handleIdentifyChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({});
        setShowModal(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        // Deep copy and transform array fields for text inputs
        const data = { ...item };
        if (Array.isArray(data.uses)) data.uses = data.uses.join(', ');
        if (Array.isArray(data.sideEffects)) data.sideEffects = data.sideEffects.join(', ');

        setFormData(data);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({});
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const endpoint = activeTab === 'medicines' ? '/admin/medicines' : '/admin/lab-tests';

            if (editingItem) {
                // UPDATE
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}/${editingItem._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Updated successfully!");
            } else {
                // CREATE
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Added successfully!");
            }

            closeModal();
            fetchItems();
        } catch (error: any) {
            alert(error.response?.data?.message || "Error saving item");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const endpoint = activeTab === 'medicines' ? `/admin/medicines/${id}` : null;
            if (!endpoint) return alert("Deletion not supported for this type yet");

            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchItems();
        } catch (error) {
            console.error(error);
            alert("Failed to delete item");
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Medical Database</h1>
                        <p className="text-gray-500">Manage medicines and lab tests.</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-[#3AAFA9] hover:bg-[#2B7A78] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <FaPlus /> Add New
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('medicines')}
                        className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'medicines' ? 'text-[#3AAFA9] border-[#3AAFA9]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                    >
                        <FaCapsules className="inline mr-2" /> Medicines
                    </button>
                    <button
                        onClick={() => setActiveTab('labTests')}
                        className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'labTests' ? 'text-[#3AAFA9] border-[#3AAFA9]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                    >
                        <FaFlask className="inline mr-2" /> Lab Tests
                    </button>
                </div>

                {/* List Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 animate-pulse">Loading Database...</div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                            <span className="text-4xl mb-2">📭</span>
                            <p>No items found in the database.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">{activeTab === 'medicines' ? 'Manufacturer' : 'Normal Range'}</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item: any) => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{item.description}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {activeTab === 'medicines' ? item.manufacturer : item.normalRange}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg mr-2 transition-colors inline-block"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                {activeTab === 'medicines' && (
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors inline-block"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* MODAL Overlay */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                            {/* Modal Header */}
                            <div className="flex justify-between items-start p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {editingItem ? 'Edit Item' : 'Add New Item'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {activeTab === 'medicines' ? 'Medicine Details' : 'Lab Test Reference'}
                                    </p>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            {/* Modal Body / Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name <span className="text-red-500">*</span></label>
                                        <input
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleIdentifyChange}
                                            required
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none transition-all"
                                            placeholder="e.g. Paracetamol or Hemoglobin"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description <span className="text-red-500">*</span></label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleIdentifyChange}
                                            required
                                            rows={2}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none transition-all resize-none"
                                            placeholder="Brief description of the item..."
                                        />
                                    </div>

                                    {activeTab === 'medicines' ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Manufacturer</label>
                                                <input name="manufacturer" value={formData.manufacturer || ''} onChange={handleIdentifyChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                                <input name="category" value={formData.category || ''} onChange={handleIdentifyChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dosage Info</label>
                                                <input name="dosageInfo" value={formData.dosageInfo || ''} onChange={handleIdentifyChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none" placeholder="e.g. 500mg twice daily" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Uses (comma separated)</label>
                                                <input name="uses" value={formData.uses || ''} onChange={handleIdentifyChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none" placeholder="e.g. Pain relief, Fever" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Side Effects (comma separated)</label>
                                                <input name="sideEffects" value={formData.sideEffects || ''} onChange={handleIdentifyChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none" placeholder="e.g. Nausea, Drowsiness" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Normal Range</label>
                                                <input name="normalRange" value={formData.normalRange || ''} onChange={handleIdentifyChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none" placeholder="e.g. 4.5 - 11.0" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preparation</label>
                                                <input name="preparation" value={formData.preparation || ''} onChange={handleIdentifyChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none" placeholder="e.g. Fasting required" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinical Significance</label>
                                                <textarea
                                                    name="clinicalSignificance"
                                                    rows={2}
                                                    value={formData.clinicalSignificance || ''}
                                                    onChange={handleIdentifyChange}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AAFA9] outline-none resize-none"
                                                    placeholder="What high/low values mean..."
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-[#3AAFA9] hover:bg-[#2B7A78] text-white font-bold rounded-lg shadow-md transition-all transform active:scale-95"
                                    >
                                        {editingItem ? 'Update Item' : 'Save New Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
}
