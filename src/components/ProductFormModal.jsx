import { CATEGORIES, CONDITIONS } from "../constants";

export default function ProductFormModal({
  show,
  form,
  setForm,
  editingProductId,
  onClose,
  onSubmit,
  onPhotoChange,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-neutral-200 rounded-3xl p-5 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 text-xl"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-1">
          {editingProductId ? "İlanı düzenle" : "Yeni ilan ekle"}
        </h2>
        <p className="text-xs text-neutral-500 mb-4">
          {editingProductId
            ? "Fotoğraf, başlık, fiyat ve detayları güncelleyebilirsin."
            : "Fotoğraf yükle, fiyat ve detayları gir, ilanını yayınla."}
        </p>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-neutral-700">Ürün fotoğrafı</label>
            <input
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="block w-full text-xs text-neutral-700 file:text-xs file:px-3 file:py-2 file:rounded-full file:border-0 file:bg-electric file:text-white file:font-medium file:cursor-pointer file:hover:bg-electric/90"
            />
            {form.photo && (
              <div className="mt-2">
                <p className="text-[11px] text-neutral-500 mb-1">Ön izleme:</p>
                <img
                  src={form.photo}
                  alt="Ön izleme"
                  className="w-full aspect-square object-cover rounded-2xl border border-neutral-200"
                />
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Başlık"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />

          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Fiyat (TL)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="flex-1 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="flex-1 px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="">Kategori seç</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="w-full px-3 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="">Durum seç</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <textarea
            rows={3}
            placeholder="Açıklama (beden, marka, durum, notlar...)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
          />

          <label className="flex items-center gap-2 text-xs text-neutral-700">
            <input
              type="checkbox"
              checked={form.takas}
              onChange={(e) => setForm({ ...form, takas: e.target.checked })}
              className="accent-black"
            />
            Bu ürün için takas tekliflerini kabul ediyorum
          </label>
        </div>

        <button
          onClick={onSubmit}
          className="mt-5 w-full py-2.5 rounded-full bg-electric text-white text-sm font-semibold hover:bg-electric/90 transition shadow-sm"
        >
          {editingProductId ? "Değişiklikleri kaydet" : "İlanı yayınla"}
        </button>
      </div>
    </div>
  );
}

