import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";

import { productApi } from "../lib/api";
import { getStockStatusBadge, getTotalStock } from "../lib/statusBadge";
import productManagement from "../assets/icons/product-management.png";
import productEdit from "../assets/icons/product-edit.png";
import trash from "../assets/icons/trash.png";
import productCategory from "../assets/icons/product-category.png";
import productType from "../assets/icons/product-type.png";
import productName from "../assets/icons/product-name.png";
import productPrice from "../assets/icons/product-price.png";
import productStock from "../assets/icons/product-stock.png";
import productSize from "../assets/icons/product-size.png";
import productDescription from "../assets/icons/product-description.png";
import FloatingInput from "../components/FloatingInput";

const ProductsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    types: "",
    price: "",
    description: "",
    sizes: [{ size: "", stock: "" }],
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
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
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
      types: "",
      price: "",
      description: "",
      sizes: [{ size: "", stock: "" }],
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      types: product.types,
      price: product.price.toString(),
      description: product.description,
      sizes: product.sizes.map((s) => ({
        size: s.size,
        stock: s.stock.toString(),
      })),
    });
    setImagePreviews(product.images);
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

    if (!editingProduct && imagePreviews.length === 0) {
      return alert("Wajib unggah minimal 1 gambar.");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("types", formData.types);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("sizes", JSON.stringify(formData.sizes));

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
      sizes: [...formData.sizes, { size: "", stock: "" }],
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
      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => {
          const totalStock = getTotalStock(product.sizes);
          const status = getStockStatusBadge(totalStock);

          return (
            <div key={product._id} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-6">
                  <div className="avatar">
                    <div className="w-27 rounded-xl">
                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col gap-2">
                      <h3 className="card-title text-2xl font-bold">
                        {product.name}
                      </h3>
                      <div className="flex items-start gap-8">
                        <div className="flex items-center gap-2">
                          <img
                            src={productCategory}
                            alt={productCategory}
                            className="w-4 h-4"
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
                            {product.types}
                          </p>
                        </div>
                        <div className={`badge ${status.class} font-semibold`}>
                          {status.text}
                        </div>
                      </div>
                      <div className="flex items-start gap-10">
                        <div>
                          <p className="text-xs font-semibold text-base-content/70">
                            Harga
                          </p>
                          <p className="text-lg font-bold">
                            Rp. {product.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold text-base-content/70">
                            Stok
                          </p>

                          <div
                            className="grid gap-4"
                            style={{
                              gridTemplateColumns: `repeat(${product.sizes.length}, minmax(0, 1fr))`,
                            }}
                          >
                            {product.sizes?.map((item, index) => (
                              <div key={index} className="flex gap-2">
                                <span className="text-sm font-bold text-base-content/70">
                                  {item.size} :
                                </span>
                                <span className="text-sm font-semibold">
                                  {item.stock}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions mr-2">
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
                        if (window.confirm(`Hapus produk "${product.name}"?`)) {
                          deleteProductMutation.mutate(product._id);
                        }
                      }}
                    >
                      {deleteProductMutation.isPending ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <img src={trash} alt={trash} className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <input
        type="checkbox"
        className="modal-toggle"
        checked={showModal}
        readOnly
      />
      <div className="modal">
        <div className="modal-box max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-2xl">
              {editingProduct ? "Ubah Produk" : "Tambah Produk Baru"}
            </h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <hr className="w-full border border-neutral my-4" />
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="form-control">
                <FloatingInput
                  label="Nama"
                  name="name"
                  type="text"
                  icon={productName}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-control">
                <FloatingInput
                  label="Harga (Rp)"
                  name="price"
                  type="number"
                  icon={productPrice}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="form-control">
                <FloatingInput
                  label="Kategori"
                  name="category"
                  type="text"
                  icon={productCategory}
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-control">
                <FloatingInput
                  label="Tipe"
                  name="types"
                  type="text"
                  icon={productType}
                  value={formData.types}
                  onChange={(e) =>
                    setFormData({ ...formData, types: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            {formData.sizes.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[120px_1fr_40px] gap-6 items-center"
              >
                <div className="form-control">
                  <FloatingInput
                    label="Ukuran"
                    name="size"
                    type="text"
                    icon={productSize}
                    value={item.size}
                    onChange={(e) =>
                      handleSizeChange(index, "size", e.target.value)
                    }
                  />
                </div>
                <div className="form-control">
                  <FloatingInput
                    label="Stok"
                    name="stock"
                    type="number"
                    icon={productStock}
                    value={item.stock}
                    onChange={(e) =>
                      handleSizeChange(index, "stock", e.target.value)
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSizeRow(index)}
                  className="btn btn-ghost btn-sm text-error"
                  disabled={formData.sizes.length === 1}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addSizeRow}
              className="btn btn-outline btn-sm w-fit"
            >
              + Tambah Ukuran
            </button>
            <div className="form-control">
              <FloatingInput
                label="Deskripsi"
                name="description"
                type="textarea"
                icon={productDescription}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text font-semibold text-base text-[#d6d6d6] items-center gap-2">
                  Gambar Produk
                </span>
                <span className="label-text-alt text-xs opacity-60">
                  Maks. 3 gambar
                </span>
              </label>
              <div className="bg-base-200 rounded-xl p-2 border-2 border-dashed border-base-300 hover:border-secondary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input file-input-bordered file-input-secondary w-full"
                  required={!editingProduct}
                />

                {editingProduct && (
                  <p className="text-xs text-base-content/60 mt-2 text-center">
                    Kosongkan agar tetap menggunakan gambar lama.
                  </p>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="avatar">
                      <div className="w-20 rounded-lg">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={closeModal}
                className="btn font-semibold"
                disabled={
                  createProductMutation.isPending ||
                  updateProductMutation.isPending
                }
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={
                  createProductMutation.isPending ||
                  updateProductMutation.isPending
                }
              >
                {createProductMutation.isPending ||
                updateProductMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : editingProduct ? (
                  <span className="font-semibold">Ubah Produk</span>
                ) : (
                  <span className="font-semibold">Tambah Produk</span>
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
