import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { cardsApi, uploadsApi } from '../api';
import { motion } from 'framer-motion';

export const CardEditor: React.FC = () => {
  const user = useStore((s) => s.user);
  const cards = useStore((s) => s.cards);
  const setCards = useStore((s) => s.setCards);
  const [form, setForm] = useState({
    name: '',
    cost: 1,
    attack: 1,
    defense: 1,
    rarity: 'common' as const,
    abilities: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const res = await cardsApi.getMyCards();
      setCards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);

    try {
      // Request presigned URL
      const presignedRes = await uploadsApi.requestPresignedUrl(file.name, file.type);
      const { uploadUrl, key } = presignedRes.data;

      // Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // Confirm upload
      const confirmRes = await uploadsApi.confirmUpload(key);
      setImageUrl(confirmRes.data.imageUrl);
    } catch (err) {
      alert('Image upload failed');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please upload an image');
      return;
    }

    setSubmitting(true);
    try {
      await cardsApi.create({
        name: form.name,
        imageUrl,
        cost: form.cost,
        attack: form.attack,
        defense: form.defense,
        rarity: form.rarity,
        abilities: form.abilities,
      });

      setForm({ name: '', cost: 1, attack: 1, defense: 1, rarity: 'common', abilities: [] });
      setImageUrl('');
      setImageFile(null);
      await loadCards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create card');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Create Card</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Card Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  handleImageUpload(file);
                }
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white file:text-purple-400"
              disabled={uploadingImage}
            />
            {uploadingImage && <p className="text-sm text-gray-400 mt-1">Uploading...</p>}
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="preview" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Rarity</label>
              <select
                value={form.rarity}
                onChange={(e) => setForm({ ...form, rarity: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option>common</option>
                <option>rare</option>
                <option>epic</option>
                <option>legendary</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Cost</label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Attack</label>
              <input
                type="number"
                min="0"
                max="10"
                value={form.attack}
                onChange={(e) => setForm({ ...form, attack: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Defense</label>
              <input
                type="number"
                min="0"
                max="10"
                value={form.defense}
                onChange={(e) => setForm({ ...form, defense: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Card'}
          </button>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Cards</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg"
            >
              <img src={card.imageUrl} alt={card.name} className="w-full h-40 object-cover" />
              <div className="p-2 text-center">
                <p className="font-bold text-xs truncate">{card.name}</p>
                <p className="text-xs text-gray-400">
                  {card.cost}/{card.attack}/{card.defense}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
