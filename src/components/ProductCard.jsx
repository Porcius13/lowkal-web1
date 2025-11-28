import { formatDate } from "../utils/helpers";

export default function ProductCard({
  product,
  currentUser,
  isLiked,
  isMine,
  onFavoriteToggle,
  onDetailClick,
  onEditClick,
  onDeleteClick,
  onMessageClick,
  onOfferClick,
  onTakasClick,
}) {
  return (
    <article
      className="bg-white/90 backdrop-blur-sm group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      onClick={onDetailClick}
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={product.photo}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Favori butonu - Depop tarzı, sağ üstte */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all z-10"
        >
          <span className={`text-lg ${isLiked ? "text-dare-devil" : "text-neutral-400"}`}>
            {isLiked ? "❤️" : "🤍"}
          </span>
        </button>

        {/* Mesafe badge - sol üstte */}
        <div className="absolute top-3 left-3 text-[11px] px-2 py-1 rounded-full bg-electric/90 text-white backdrop-blur-sm font-medium shadow-sm">
          {product.distanceKm.toFixed(1)} km
        </div>

        {/* Takas badge */}
        {product.takas && (
          <div className="absolute bottom-3 left-3 text-[10px] px-2.5 py-1 rounded-full bg-gold/95 backdrop-blur-sm text-black font-semibold shadow-sm">
            🔄 Takas
          </div>
        )}

        {/* Sahip butonları - sadece hover'da görünsün */}
        {isMine && (
          <div className="absolute top-3 right-3 pt-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm text-black text-[11px] font-medium shadow-sm hover:bg-white"
            >
              ✏️ Düzenle
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-red-500/95 backdrop-blur-sm text-white text-[11px] font-medium shadow-sm hover:bg-red-500"
            >
              🗑️ Sil
            </button>
          </div>
        )}
      </div>

      {/* Depop tarzı bilgi alanı - minimal */}
      <div className="pt-3 pb-1">
        <p className="text-sm font-semibold text-black mb-0.5">
          {product.price} TL
        </p>
        {product.ownerName && (
          <p className="text-xs text-neutral-600 truncate">
            {product.ownerName}
          </p>
        )}
      </div>
    </article>
  );
}

