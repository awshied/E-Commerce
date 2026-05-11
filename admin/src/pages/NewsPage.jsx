import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router";
import { PlusIcon, XIcon } from "lucide-react";

import { newsApi } from "../lib/api";
import newsManagement from "../assets/icons/news-management.png";
import view from "../assets/icons/view.png";
import newsEdit from "../assets/icons/news-edit.png";
import trash from "../assets/icons/trash.png";
import newsAdd from "../assets/icons/news-add.png";
import FloatingInput from "../components/FloatingInput";
import newsTitle from "../assets/icons/news-title.png";
import newsCaption from "../assets/icons/news-caption.png";
import newsContent from "../assets/icons/news-content.png";
import newsTags from "../assets/icons/news-tags.png";
import TagInput from "../components/TagInput";
import calendar from "../assets/icons/calendar.png";
import like from "../assets/icons/like.png";
import dislike from "../assets/icons/dislike.png";
import commentChat from "../assets/icons/comment.png";

const NewsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [activeTab, setActiveTab] = useState("published");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    caption: "",
    tags: "",
    draft: false,
  });
  const [newsImages, setNewsImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [deletingNewsId, setDeletingNewsId] = useState(null);

  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading: newsLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["news", activeTab],
    queryFn: () => {
      if (activeTab === "published") {
        return newsApi.getPublished();
      } else {
        return newsApi.getDrafts();
      }
    },
  });

  const newsData = response?.news || [];

  const createNewsMutation = useMutation({
    mutationFn: newsApi.create,
    onSuccess: () => {
      closeModal();
      toast.success("Berita berhasil diterbitkan!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menerbitkan berita");
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: newsApi.update,
    onSuccess: () => {
      closeModal();
      toast.success("Berita berhasil diperbarui!");
      refetch();
      if (editingNews?.draft === true && formData.draft === false) {
        queryClient.invalidateQueries({ queryKey: ["news", "draft"] });
        queryClient.invalidateQueries({ queryKey: ["news", "published"] });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui berita");
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: newsApi.delete,
    onSuccess: () => {
      setDeletingNewsId(null);
      toast.success("Berita berhasil dihapus!");
      refetch();
    },
    onError: (error) => {
      setDeletingNewsId(null);
      toast.error(error.response?.data?.message || "Gagal menghapus berita");
    },
  });

  const closeModal = () => {
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    setShowModal(false);
    setEditingNews(null);
    setFormData({
      title: "",
      content: "",
      caption: "",
      tags: "",
      draft: false,
    });
    setNewsImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (newsEdit) => {
    setEditingNews(newsEdit);
    setFormData({
      title: newsEdit.title,
      content: JSON.stringify(newsEdit.content, null, 2),
      caption: newsEdit.caption,
      tags: newsEdit.tags.join(", "),
      draft: newsEdit.draft,
    });
    setImagePreviews(newsEdit.newsImages?.map((img) => img.url) || []);
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

    setNewsImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editingNews && imagePreviews.length === 0) {
      toast.error("Wajib unggah minimal 1 gambar.");
      return;
    }

    const formDataToSend = new FormData();

    formDataToSend.append("title", formData.title);
    formDataToSend.append("content", formData.content);
    formDataToSend.append("caption", formData.caption);

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    formDataToSend.append("tags", JSON.stringify(tagsArray));
    formDataToSend.append("draft", formData.draft);

    if (newsImages.length > 0) {
      newsImages.forEach((newsImage) =>
        formDataToSend.append("newsImages", newsImage),
      );
    }

    if (editingNews) {
      updateNewsMutation.mutate({
        id: editingNews._id,
        formData: formDataToSend,
      });
    } else {
      createNewsMutation.mutate(formDataToSend);
    }
  };

  const handleDelete = (newsId, title) => {
    if (window.confirm(`Yakin ingin menghapus berita "${title}"?`)) {
      setDeletingNewsId(newsId);
      deleteNewsMutation.mutate(newsId);
    }
  };

  const publishedCount =
    queryClient.getQueryData(["news", "published"])?.news?.length || 0;
  const draftCount =
    queryClient.getQueryData(["news", "draft"])?.news?.length || 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="breadcrumbs text-sm mb-3">
          <ul className="px-3">
            <li>
              <Link to="/news">
                <img src={newsManagement} alt="News" className="size-6" />
              </Link>
            </li>
            <li className="font-semibold text-white">Berita</li>
          </ul>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-secondary gap-2 font-bold"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Berita
        </button>
      </div>

      <div className="card bg-base-300 shadow-xl">
        <div className="card-body p-3">
          <div className="tabs tabs-boxed p-1">
            <button
              className={`tab flex items-center gap-1.5 ${activeTab === "published" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("published")}
            >
              <h3 className="font-semibold text-sm">Publikasi</h3>
              <span className="text-xs text-[#ffc586]">({publishedCount})</span>
            </button>
            <button
              className={`tab flex items-center gap-1.5 ${activeTab === "draft" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("draft")}
            >
              <h3 className="font-semibold text-sm">Draft</h3>
              <span className="text-xs text-[#ffc586]">({draftCount})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-300 shadow-xl">
        <div className="card-body">
          {newsLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-error">
              <p className="text-xl font-semibold mb-2">Gagal memuat data</p>
              <p className="text-sm">{error.message}</p>
            </div>
          ) : newsData.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              {activeTab === "published" ? (
                <>
                  <p className="text-xl font-bold mb-2">
                    Belum ada berita yang dipublikasikan
                  </p>
                  <p className="text-base mb-4 font-semibold">
                    Berita yang sudah dipublikasikan akan muncul di sini
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-sm text-sm font-semibold"
                  >
                    + Buat Berita Baru
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xl font-semibold mb-2">
                    Belum ada draft berita
                  </p>
                  <p className="text-base mb-4 font-semibold">
                    Draft berita akan muncul setelah Anda menyimpannya sebagai
                    draft
                  </p>
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, draft: true }));
                      setShowModal(true);
                    }}
                    className="btn btn-warning btn-sm text-sm font-semibold"
                  >
                    + Buat Draft Baru
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {newsData.map((news) => (
                <div
                  key={news._id}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="lg:w-48 h-48 rounded-xl overflow-hidden bg-base-300">
                        {news.newsImages?.[0]?.url ? (
                          <img
                            src={news.newsImages[0].url}
                            alt={news.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full text-center py-6 text-base-content/60 text-lg font-bold">
                            Tidak ada gambar
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="flex-1">
                            <h2 className="card-title text-xl mb-3 font-extrabold">
                              {news.title}
                            </h2>
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={calendar}
                                  alt={calendar}
                                  className="w-4 h-4"
                                />
                                <p className="text-base-content text-sm font-semibold">
                                  {new Date(news.createdAt).toLocaleDateString(
                                    "id-ID",
                                  )}
                                </p>
                              </div>
                              <div className="bg-base-content w-1 h-1 rounded-full" />
                              <span className="text-base-content text-sm font-semibold">
                                Dilihat oleh {news.activity?.totalViews || 0}{" "}
                                pengguna
                              </span>
                            </div>
                            <p className="text-base-content/70 font-semibold text-sm mb-3 line-clamp-2">
                              {news.caption}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {news.tags?.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="bg-base-100 text-base-content shadow-xl font-semibold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <img
                                  src={like}
                                  alt={like}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-base-content/70 font-semibold">
                                  {news.activity?.totalLikes || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <img
                                  src={dislike}
                                  alt={dislike}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-base-content/70 font-semibold">
                                  {news.activity?.totalDislikes || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <img
                                  src={commentChat}
                                  alt={commentChat}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-base-content/70 font-semibold">
                                  {news.activity?.totalComments || 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-3 shrink-0 justify-center">
                            <Link
                              to={`/news/${news._id}/comments`}
                              className="btn btn-square btn-ghost"
                              title="Kelola Komentar"
                            >
                              <img src={view} alt="view" className="w-6 h-6" />
                            </Link>
                            <button
                              className="btn btn-square btn-ghost"
                              onClick={() => handleEdit(news)}
                              title="Edit Berita"
                            >
                              <img
                                src={newsEdit}
                                alt="edit"
                                className="w-6 h-6"
                              />
                            </button>
                            <button
                              className="btn btn-square btn-ghost text-error"
                              onClick={() => handleDelete(news._id, news.title)}
                              title="Hapus Berita"
                              disabled={deletingNewsId === news._id}
                            >
                              {deletingNewsId === news._id ? (
                                <span className="loading loading-spinner"></span>
                              ) : (
                                <img
                                  src={trash}
                                  alt="delete"
                                  className="w-6 h-6"
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                  src={editingNews ? newsEdit : newsAdd}
                  className="size-9"
                  alt="News Icon"
                />
                <h3 className="text-xl font-bold text-base-content py-6">
                  {editingNews ? "Edit Berita" : "Tambah Berita Baru"}
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

                  <div className="mt-6">
                    <FloatingInput
                      label="Judul"
                      name="title"
                      type="text"
                      icon={newsTitle}
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mt-6">
                    <FloatingInput
                      label="Caption"
                      name="caption"
                      type="textarea"
                      icon={newsCaption}
                      value={formData.caption}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          caption: e.target.value,
                        })
                      }
                      required
                      rows={4}
                    />
                  </div>

                  <div className="mt-6">
                    <TagInput
                      label="Tags"
                      icon={newsTags}
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="Ketik tag lalu tekan Enter atau Spasi..."
                    />
                  </div>

                  <div className="mt-6">
                    <FloatingInput
                      label="Isi Konten"
                      name="content"
                      type="textarea"
                      icon={newsContent}
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content: e.target.value,
                        })
                      }
                      required
                      rows={4}
                    />
                  </div>

                  <div className="mt-6">
                    <label className="label">
                      <span className="label-text font-semibold text-[#d6d6d6] flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <rect x="2" y="2" width="20" height="20" rx="2.18" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15L16 10L5 21" />
                        </svg>
                        Gambar Berita
                      </span>
                      <span className="label-text-alt font-semibold text-xs text-base-content/60">
                        {imagePreviews.length}/3 · Maks. 5MB per gambar
                      </span>
                    </label>
                    <div className="relative mt-6">
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
                          <div className="flex flex-col items-center justify-center py-12 px-4">
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

                    {editingNews && (
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#ffc586] rounded-full"></div>
                    <h4 className="font-semibold text-lg">Belum Dipublikasi</h4>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer gap-3">
                      <span className="label-text text-sm">Draft</span>
                      <input
                        type="checkbox"
                        name="draft"
                        id="draft"
                        className="toggle toggle-secondary"
                        checked={formData.draft}
                        onChange={(e) =>
                          setFormData({ ...formData, draft: e.target.checked })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-8 py-4 bg-base-300/50 border-t border-base-200">
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-ghost"
                disabled={
                  createNewsMutation.isPending || updateNewsMutation.isPending
                }
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={
                  createNewsMutation.isPending || updateNewsMutation.isPending
                }
                className="btn btn-secondary min-w-30 gap-2"
              >
                {createNewsMutation.isPending ||
                updateNewsMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Menyimpan...
                  </>
                ) : editingNews ? (
                  "Simpan Perubahan"
                ) : (
                  "Terbitkan Berita"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
