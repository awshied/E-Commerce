import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";

import { productApi } from "../lib/api";
import productManagement from "../assets/icons/product-management.png";
import productAdd from "../assets/icons/product-add.png";
import productEdit from "../assets/icons/product-edit.png";
import trash from "../assets/icons/trash.png";
import productCategory from "../assets/icons/product-category.png";
import productType from "../assets/icons/product-type.png";
import productGenderFit from "../assets/icons/product-gender-fit.png";
import productPromo from "../assets/icons/calendar.png";
import productName from "../assets/icons/product-name.png";
import productPrice from "../assets/icons/product-price.png";
import productStock from "../assets/icons/product-stock.png";
import productSize from "../assets/icons/product-size.png";
import productDescription from "../assets/icons/product-description.png";
import productPromoTitle from "../assets/icons/product-promo.png";
import productDiscount from "../assets/icons/product-discount.png";
import FloatingInput from "../components/FloatingInput";

const ProductsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [enablePromo, setEnablePromo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    gender: "Campuran",
    description: "",
    sizes: [{ size: "", price: "", stock: "" }],
    promo: {
      title: "",
      discountPercent: "",
      startDate: "",
      endDate: "",
    },
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const isPromoActive = (promo) => {
    if (!promo) return false;

    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);

    return now >= start && now <= end;
  };

  const getDiscountedPrice = (price, discountPercent) => {
    const clampedDiscount = Math.max(0, Math.min(100, discountPercent));
    return Math.round(price - price * (clampedDiscount / 100));
  };

  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll,
  });

  const createProductMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      setDeletingProductId(null);
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {
      setDeletingProductId(null);
    },
  });

  const closeModal = () => {
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      type: "",
      gender: "Campuran",
      description: "",
      sizes: [{ size: "", price: "", stock: "" }],
      promo: {
        title: "",
        discountPercent: "",
        startDate: "",
        endDate: "",
      },
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      type: product.type,
      gender: product.gender,
      description: product.description,
      sizes: product.sizes.map((s) => ({
        size: s.size,
        price: s.price.toString(),
        stock: s.stock.toString(),
      })),
      promo: product.promo
        ? {
            title: product.promo.title,
            discountPercent: product.promo.discountPercent?.toString() || "",
            startDate: product.promo.startDate
              ? new Date(product.promo.startDate).toLocaleDateString("en-CA") // yields yyyy-mm-dd
              : "",
            endDate: product.promo.endDate
              ? new Date(product.promo.endDate).toLocaleDateString("en-CA")
              : "",
          }
        : {
            title: "",
            discountPercent: "",
            startDate: "",
            endDate: "",
          },
    });
    setEnablePromo(!!product.promo);
    setImagePreviews(product.images.map((img) => img.url));
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 3) {
      alert("Maksimal 3 gambar");
      return;
    }

    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (enablePromo) {
      const { title, discountPercent, startDate, endDate } = formData.promo;

      if (!title.trim()) {
        return alert("Nama promo wajib diisi.");
      }

      if (!discountPercent || Number(discountPercent) <= 0) {
        return alert("Diskon harus lebih dari 0%.");
      }

      if (!startDate || !endDate) {
        return alert("Tanggal mulai dan berakhir wajib diisi.");
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        return alert("Tanggal berakhir tidak boleh sebelum tanggal mulai.");
      }
    }

    if (!editingProduct && imagePreviews.length === 0) {
      return alert("Wajib unggah minimal 1 gambar.");
    }

    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.name);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("type", formData.type);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("description", formData.description);

    formDataToSend.append(
      "sizes",
      JSON.stringify(
        formData.sizes.map((s) => ({
          size: s.size,
          price: Number(s.price),
          stock: Number(s.stock),
        })),
      ),
    );

    if (enablePromo) {
      formDataToSend.append(
        "promo",
        JSON.stringify({
          title: formData.promo.title,
          discountPercent: Number(formData.promo.discountPercent),
          startDate: formData.promo.startDate,
          endDate: formData.promo.endDate,
        }),
      );
    }

    if (images.length > 0)
      images.forEach((image) => formDataToSend.append("images", image));

    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct._id,
        formData: formDataToSend,
      });
    } else {
      createProductMutation.mutate(formDataToSend);
    }
  };

  const handleSizeChange = (index, field, value) => {
    const updated = [...formData.sizes];
    updated[index][field] = value;
    setFormData({ ...formData, sizes: updated });
  };

  const addSizeRow = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: "", price: "", stock: "" }],
    });
  };

  const removeSizeRow = (index) => {
    const updated = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: updated });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="breadcrumbs text-sm mb-3">
          <ul className="px-3">
            <li>
              <Link to="/products">
                <img src={productManagement} alt="Product" className="size-6" />
              </Link>
            </li>
            <li className="font-semibold text-white">Produk</li>
          </ul>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-secondary gap-2 font-bold"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Produk
        </button>
      </div>

      {/* Main */}
      <div className="card bg-base-300 shadow-xl">
        <div className="card-body">
          {productsLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">
                Belum ada produk yang ditambahkan
              </p>
              <p className="text-sm">
                Daftar produk akan muncul setelah Anda menambahkan produk baru
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => {
                return (
                  <div key={product._id} className="card bg-base-300">
                    <div className="card-body">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-none">
                          <div className="avatar">
                            <div className="w-46 rounded-xl relative">
                              {isPromoActive(product.promo) && (
                                <span className="absolute bottom-1 left-1 badge badge-base-300 py-4 font-bold text-[#ffc586]">
                                  {product.promo.title}
                                </span>
                              )}
                              <img
                                src={
                                  product.images?.[0]?.url || "/placeholder.png"
                                }
                                alt={product.name}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="card-title text-3xl font-extrabold">
                                {product.name}
                              </h3>
                              {isPromoActive(product.promo) && (
                                <span className="card-title font-bold text-sm text-error">
                                  - {product.promo.discountPercent}% Off
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={productCategory}
                                  alt={productCategory}
                                  className="w-4 h-4 opacity-70"
                                />
                                <p className="text-base-content text-sm font-semibold">
                                  {product.category}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <img
                                  src={productType}
                                  alt={productType}
                                  className="w-4 h-4"
                                />
                                <p className="text-base-content text-sm font-semibold">
                                  {product.type}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <img
                                  src={productGenderFit}
                                  alt={productGenderFit}
                                  className="w-4 h-4"
                                />
                                <p className="text-base-content text-sm font-semibold">
                                  {product.gender}
                                </p>
                              </div>

                              {isPromoActive(product.promo) && (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={productPromo}
                                    alt={productPromo}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-xs font-semibold text-base-content">
                                    {new Date(
                                      product.promo.startDate,
                                    ).toLocaleDateString("id-ID")}{" "}
                                    -{" "}
                                    {new Date(
                                      product.promo.endDate,
                                    ).toLocaleDateString("id-ID")}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="relative w-full mt-3">
                              <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-base-300 to-transparent pointer-events-none z-10" />

                              <div className="overflow-x-auto pb-3 -mb-3 no-scrollbar">
                                <div className="flex gap-3">
                                  {product.sizes?.map((item, index) => {
                                    const hasPromo = isPromoActive(
                                      product.promo,
                                    );
                                    const finalPrice = hasPromo
                                      ? getDiscountedPrice(
                                          item.price,
                                          product.promo.discountPercent,
                                        )
                                      : item.price;
                                    return (
                                      <div
                                        key={index}
                                        className="flex-none w-48 bg-base-200 rounded-xl p-3 shadow-2xl"
                                      >
                                        <div className="flex items-center justify-between mb-4">
                                          <span className="text-base font-bold text-base-content/70">
                                            {item.size}
                                          </span>
                                          <span
                                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                              item.stock > 0
                                                ? "bg-secondary/20 text-secondary"
                                                : "bg-error/20 text-error"
                                            }`}
                                          >
                                            {item.stock > 0
                                              ? `${item.stock} stok`
                                              : "Habis"}
                                          </span>
                                        </div>

                                        <div className="space-y-1">
                                          {hasPromo ? (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-xs font-semibold line-through text-base-content/50">
                                                Rp.{" "}
                                                {item.price.toLocaleString(
                                                  "id-ID",
                                                )}
                                              </span>

                                              <div className="flex items-start gap-2">
                                                <span className="text-xl font-extrabold text-[#ffc586]">
                                                  Rp.{" "}
                                                  {finalPrice.toLocaleString(
                                                    "id-ID",
                                                  )}{" "}
                                                </span>
                                                <p className="text-sm text-base-content/70 font-semibold">
                                                  / Pcs
                                                </p>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex items-start gap-2">
                                              <span className="text-xl font-extrabold text-white">
                                                Rp.{" "}
                                                {item.price.toLocaleString(
                                                  "id-ID",
                                                )}{" "}
                                              </span>
                                              <p className="text-sm text-base-content/70 font-semibold">
                                                / Pcs
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0 justify-center">
                          <button
                            className="btn btn-square btn-ghost"
                            onClick={() => handleEdit(product)}
                          >
                            <img
                              src={productEdit}
                              alt={productEdit}
                              className="w-6 h-6"
                            />
                          </button>
                          <button
                            className="btn btn-square btn-ghost text-error"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Hapus produk "${product.name}"?`,
                                )
                              ) {
                                setDeletingProductId(product._id);
                                deleteProductMutation.mutate(product._id);
                              }
                            }}
                          >
                            {deletingProductId === product._id ? (
                              <span className="loading loading-spinner"></span>
                            ) : (
                              <img
                                src={trash}
                                alt={trash}
                                className="w-6 h-6"
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <input
        type="checkbox"
        className="modal-toggle"
        checked={showModal}
        readOnly
      />
      <div className="modal">
        <div className="modal-box max-h-[94vh] max-w-6xl p-0 overflow-hidden bg-base-100">
          <div className="relative px-6">
            <div className="flex items-center justify-between border-b border-base-content/50">
              <div className="flex items-center gap-3">
                <img
                  src={editingProduct ? productEdit : productAdd}
                  className="size-9"
                  alt="Product Icon"
                />
                <h3 className="text-xl font-bold text-base-content py-6">
                  {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                </h3>
              </div>

              <button
                onClick={closeModal}
                className="btn btn-circle btn-ghost btn-sm hover:bg-base-300/50"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="max-h-[70vh] overflow-y-auto px-8 py-6 scrollbar-hide">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    <h4 className="font-semibold text-lg">Informasi Dasar</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Nama Produk"
                      name="name"
                      type="text"
                      icon={productName}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />

                    <FloatingInput
                      label="Jenis Produk"
                      name="type"
                      type="text"
                      icon={productType}
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      required
                    />

                    <div className="form-control">
                      <label className="label mb-3">
                        <span className="label-text text-base-content font-medium flex items-center gap-2">
                          <img
                            src={productCategory}
                            alt=""
                            className="w-5 h-5"
                          />
                          Kategori
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full bg-base-300 focus:bg-base-300 transition-colors shadow-2xl"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        required
                      >
                        <option value="" disabled>
                          Pilih kategori
                        </option>
                        <option value="Pakaian">👕 Pakaian</option>
                        <option value="Aksesoris">🕶️ Aksesoris</option>
                        <option value="Elektronik">📱 Elektronik</option>
                        <option value="Kosmetik">💄 Kosmetik</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label mb-3">
                        <span className="label-text text-base-content font-medium flex items-center gap-2">
                          <img
                            src={productGenderFit}
                            alt=""
                            className="w-5 h-5"
                          />
                          Cocok Untuk
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full bg-base-300 focus:bg-base-300 transition-colors shadow-2xl"
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        required
                      >
                        <option value="Campuran">👥 Campuran (Unisex)</option>
                        <option value="Pria">👨 Pria</option>
                        <option value="Wanita">👩 Wanita</option>
                        <option value="Anak-anak">🧒 Anak-anak</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-accent rounded-full"></div>
                      <h4 className="font-semibold text-lg">Varian Produk</h4>
                    </div>
                    <span className="text-xs text-base-content/70 bg-base-300 px-4 py-2 font-semibold rounded-full">
                      Minimal 1 varian
                    </span>
                  </div>

                  <div className="space-y-3">
                    {formData.sizes.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 items-center p-4 bg-base-200/30 rounded-xl border border-base-200 hover:border-accent/30 transition-all"
                      >
                        <FloatingInput
                          label="Ukuran"
                          name={`size-${index}`}
                          type="text"
                          icon={productSize}
                          value={item.size}
                          onChange={(e) =>
                            handleSizeChange(index, "size", e.target.value)
                          }
                        />
                        <FloatingInput
                          label="Harga"
                          name={`price-${index}`}
                          type="number"
                          icon={productPrice}
                          value={item.price}
                          onChange={(e) =>
                            handleSizeChange(index, "price", e.target.value)
                          }
                        />
                        <FloatingInput
                          label="Stok"
                          name={`stock-${index}`}
                          type="number"
                          icon={productStock}
                          value={item.stock}
                          onChange={(e) =>
                            handleSizeChange(index, "stock", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeSizeRow(index)}
                          className="btn btn-circle btn-ghost btn-sm text-error/70 hover:text-error hover:bg-error/10 mt-6 cursor-pointer"
                          disabled={formData.sizes.length === 1}
                          title="Hapus varian"
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addSizeRow}
                      className="btn btn-outline btn-secondary btn-md w-full font-semibold mt-2 gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Tambah Varian Ukuran
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-secondary rounded-full"></div>
                    <h4 className="font-semibold text-lg">
                      Deskripsi & Masukkan Gambar
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div className="form-control">
                      <FloatingInput
                        label="Deskripsi Produk"
                        name="description"
                        type="textarea"
                        icon={productDescription}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                        rows={4}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-white flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <rect
                              x="2"
                              y="2"
                              width="20"
                              height="20"
                              rx="2.18"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15L16 10L5 21" />
                          </svg>
                          Gambar Produk
                        </span>
                        <span className="label-text-alt font-semibold text-xs text-base-content/60">
                          {imagePreviews.length}/3 · Maks. 5MB per gambar
                        </span>
                      </label>

                      <div className="relative mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                          id="product-images"
                        />

                        <label
                          htmlFor="product-images"
                          className="block cursor-pointer"
                        >
                          <div className="border-2 border-dashed border-base-300 rounded-xl hover:border-secondary transition-colors group">
                            <div className="flex flex-col items-center justify-center py-6 px-4">
                              <div className="w-12 h-12 rounded-full bg-base-200 group-hover:bg-secondary/10 flex items-center justify-center mb-2 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-6 h-6 text-base-content/50"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="17 8 12 3 7 8" />
                                  <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                              </div>
                              <p className="text-sm font-medium">
                                Tekan untuk mengunggah gambar
                              </p>
                              <p className="text-xs text-base-content/40 mt-1">
                                PNG, JPG, JPEG, WEBP (Maks. 3 gambar)
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>

                      {editingProduct && (
                        <p className="text-xs text-base-content/40 font-semibold mt-2 flex items-start gap-1">
                          <span className="text-error">*</span>
                          Kosongkan jika ingin tetap menggunakan gambar lama
                        </p>
                      )}

                      {imagePreviews.length > 0 && (
                        <div className="flex gap-3 mt-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="avatar">
                              <div className="w-20 h-20 rounded-lg border-2 border-base-200 hover:border-secondary transition-all">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-[#ffc586] rounded-full"></div>
                      <h4 className="font-semibold text-lg">
                        Promo (Opsional)
                      </h4>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer gap-3">
                        <span className="label-text text-sm">
                          Aktifkan Promo
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-secondary"
                          checked={enablePromo}
                          onChange={(e) => setEnablePromo(e.target.checked)}
                        />
                      </label>
                    </div>
                  </div>

                  {enablePromo && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 bg-base-300/30 rounded-xl border-base-300/30 hover:border hover:border-[#ffc586]/20">
                      <FloatingInput
                        label="Nama Promo"
                        type="text"
                        icon={productPromoTitle}
                        value={formData.promo.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            promo: { ...formData.promo, title: e.target.value },
                          })
                        }
                        required={enablePromo}
                      />
                      <FloatingInput
                        label="Diskon (%)"
                        type="number"
                        icon={productDiscount}
                        value={formData.promo.discountPercent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            promo: {
                              ...formData.promo,
                              discountPercent: e.target.value,
                            },
                          })
                        }
                        min="1"
                        max="100"
                        required={enablePromo}
                      />
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-sm text-base-content/70 font-semibold">
                            Mulai Pada
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full bg-base-300/50 mt-2"
                          value={formData.promo.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              promo: {
                                ...formData.promo,
                                startDate: e.target.value,
                              },
                            })
                          }
                          required={enablePromo}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-sm text-base-content/70 font-semibold">
                            Berakhir Pada
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full bg-base-300/50 mt-2"
                          value={formData.promo.endDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              promo: {
                                ...formData.promo,
                                endDate: e.target.value,
                              },
                            })
                          }
                          required={enablePromo}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-8 py-4 bg-base-300/50 border-t border-base-200">
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-ghost"
                disabled={
                  createProductMutation.isPending ||
                  updateProductMutation.isPending
                }
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-secondary min-w-30 gap-2"
                disabled={
                  createProductMutation.isPending ||
                  updateProductMutation.isPending
                }
              >
                {createProductMutation.isPending ||
                updateProductMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Menyimpan...
                  </>
                ) : editingProduct ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Produk"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
