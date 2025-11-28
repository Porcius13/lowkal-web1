import { formatDate } from "../utils/helpers";

export default function ProductDetailModal({
  product,
  onClose,
  onMessageClick,
  onOfferClick,
  onTakasClick,
}) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="w-full max-w-3xl bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 relative max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 text-xl"
        >
          ×
        </button>

        {/* Foto */}
        <div className="sm:w-1/2 flex-shrink-0">
          <img
            src={product.photo}
            alt={product.title}
            className="w-full aspect-[3/4] object-cover rounded-2xl border border-neutral-200"
          />
        </div>

        {/* Info */}
        <div className="sm:w-1/2 flex flex-col gap-3 text-sm">
          <div className="mt-6 sm:mt-0">
            <h2 className="text-base font-semibold mb-1 line-clamp-2">
              {product.title}
            </h2>
            <p className="text-lg font-bold text-neutral-900 mb-1">
              {product.price} TL
            </p>
            <p className="text-[11px] text-neutral-500 mb-1">
              {product.category}
              {product.condition ? ` • ${product.condition}` : ""} •{" "}
              {product.distanceKm.toFixed(1)} km yakınında
            </p>
            {product.createdAt && (
              <p className="text-[11px] text-neutral-400">
                İlan tarihi: {formatDate(product.createdAt)}
              </p>
            )}
          </div>

          {product.ownerName && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-7 h-7 rounded-full bg-electric text-white flex items-center justify-center text-[11px] font-medium shadow-sm">
                {product.ownerName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {product.ownerName}
                </span>
                <span className="text-[10px] text-neutral-500">Satıcı</span>
              </div>
            </div>
          )}

          {product.description && (
            <div className="mt-2 text-[12px] text-neutral-700 whitespace-pre-wrap">
              {product.description}
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2 text-xs">
            <button
              onClick={onMessageClick}
              className="w-full py-2 rounded-full bg-electric text-white font-semibold hover:bg-electric/90 transition shadow-sm"
            >
              Mesaj gönder
            </button>
            <button
              onClick={onOfferClick}
              className="w-full py-2 rounded-full bg-neutral-100 text-neutral-900 border border-neutral-300 hover:border-neutral-700"
            >
              Teklif ver
            </button>
            {product.takas && (
              <button
                onClick={onTakasClick}
                className="w-full py-2 rounded-full bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-700"
              >
                Takas teklif et
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

