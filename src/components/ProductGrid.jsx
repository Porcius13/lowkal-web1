import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  currentUser,
  isProductLiked,
  toggleFavorite,
  setDetailProduct,
  handleEditProduct,
  handleDeleteProduct,
  openPanel,
}) {
  if (products.length === 0) {
    return (
      <div className="mt-16 text-center text-sm text-neutral-500">
        <p>Bu filtrelerle ürün yok gibi.</p>
        <p className="mt-1">
          Filtreleri temizleyerek veya yeni ilan ekleyerek başlayabilirsin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      {products.map((p) => {
        const isMine =
          currentUser && p.ownerId && p.ownerId === currentUser.id;
        const liked = isProductLiked(p.id);

        return (
          <ProductCard
            key={p.id}
            product={p}
            currentUser={currentUser}
            isLiked={liked}
            isMine={isMine}
            onFavoriteToggle={() => toggleFavorite(p.id)}
            onDetailClick={() => setDetailProduct(p)}
            onEditClick={() => handleEditProduct(p)}
            onDeleteClick={() => handleDeleteProduct(p.id)}
            onMessageClick={() => openPanel(p, "message")}
            onOfferClick={() => openPanel(p, "offer")}
            onTakasClick={() => openPanel(p, "takas")}
          />
        );
      })}
    </div>
  );
}

