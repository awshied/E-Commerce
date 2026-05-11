import { useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { newsApi, commentApi } from "../lib/api";
import toast from "react-hot-toast";
import {
  Send,
  Eye,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
  Maximize2,
} from "lucide-react";

import CommentItem from "../components/CommentItem";
import newsManagement from "../assets/icons/news-management.png";
import newsDetails from "../assets/icons/news-details.png";
import calendar from "../assets/icons/calendar.png";
import like from "../assets/icons/like.png";
import dislike from "../assets/icons/dislike.png";
import commentChat from "../assets/icons/comment.png";
import refreshComment from "../assets/icons/refresh.png";
import poopIcon from "../assets/poop.png";

const CommentPage = () => {
  const { newsId } = useParams();
  const replyFormRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [visibleReplies, setVisibleReplies] = useState(new Set());
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: newsData,
    isLoading: newsLoading,
    error: newsError,
  } = useQuery({
    queryKey: ["news-detail", newsId],
    queryFn: () => newsApi.getById(newsId),
    enabled: !!newsId,
  });

  const {
    data: commentsData,
    isLoading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["comments", newsId],
    queryFn: () => commentApi.getCommentByNewsId(newsId),
    enabled: !!newsId,
  });

  const createCommentMutation = useMutation({
    mutationFn: commentApi.createComment,
    onSuccess: () => {
      refetchComments();
      setReplyText("");
      setReplyTo(null);
      toast.success("Balasan berhasil ditambahkan!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan balasan");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: commentApi.updateComment,
    onSuccess: () => {
      refetchComments();
      setEditingComment(null);
      setEditText("");
      toast.success("Komentar berhasil diupdate!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal mengupdate komentar");
    },
  });

  const reactToCommentMutation = useMutation({
    mutationFn: commentApi.reactToComment,
    onSuccess: () => {
      refetchComments();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memberi reaksi");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: commentApi.deleteComment,
    onSuccess: () => {
      refetchComments();
      toast.success("Komentar berhasil dihapus!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus komentar");
    },
  });

  const hideCommentMutation = useMutation({
    mutationFn: commentApi.hideComment,
    onSuccess: () => {
      refetchComments();
      toast.success("Komentar berhasil disembunyikan/ditampilkan!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal menyembunyikan komentar",
      );
    },
  });

  const handleReply = (comment) => {
    setReplyTo(comment);
    setReplyText(`@${comment.userId?.username} `);
    setTimeout(() => {
      replyFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyText("");
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) {
      toast.error("Balasan tidak boleh kosong!");
      return;
    }

    createCommentMutation.mutate({
      newsId: newsId,
      comment: replyText,
      parentId: replyTo?._id || null,
    });
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setEditText(comment.comment);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };

  const handleUpdateComment = (commentId) => {
    if (!editText.trim()) {
      toast.error("Komentar tidak boleh kosong!");
      return;
    }

    updateCommentMutation.mutate({
      commentId,
      formData: { comment: editText },
    });
  };

  const handleReaction = (commentId, type) => {
    reactToCommentMutation.mutate({ commentId, formData: { type } });
  };

  const handleDeleteComment = (commentId) => {
    if (
      window.confirm(
        "Yakin ingin menghapus komentar ini? Seluruh balasannya juga akan ikut terhapus.",
      )
    ) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleHideComment = (commentId, isHidden) => {
    hideCommentMutation.mutate({
      commentId,
      formData: { isHidden: !isHidden },
    });
  };

  const toggleReplies = (commentId) => {
    setVisibleReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const openImageModal = (images, index) => {
    setSelectedImage(images);
    setCurrentImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedImage && currentImageIndex < selectedImage.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedImage && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (newsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/60">Memuat detail berita...</p>
      </div>
    );
  }

  if (newsError || !newsData?.news) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error shadow-lg">
          <AlertCircle className="w-6 h-6" />
          <span>Error: {newsError?.message || "Berita tidak ditemukan"}</span>
        </div>
        <Link to="/admin/news" className="btn btn-ghost btn-sm mt-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Berita
        </Link>
      </div>
    );
  }

  const news = newsData.news;
  const comments = commentsData?.comments || [];
  const hasMultipleImages = news.newsImages?.length > 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap mb-3">
        <div className="breadcrumbs text-sm">
          <ul className="px-3">
            <li>
              <Link to="/news">
                <img src={newsManagement} alt="News" className="size-6" />
              </Link>
            </li>
            <li>
              <img src={newsDetails} alt="News Details" className="size-6" />
            </li>
            <li className="font-semibold text-white">Review</li>
          </ul>
        </div>
        <button
          onClick={() => refetchComments()}
          disabled={commentsLoading}
          className="btn btn-ghost btn-sm"
        >
          {commentsLoading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <div className="flex items-center gap-2">
              <img
                src={refreshComment}
                alt={refreshComment}
                className="w-4 h-4"
              />
              <span className="text-base font-semibold text-base-content/70">
                Refresh
              </span>
            </div>
          )}
        </button>
      </div>

      <div className="card bg-base-300 shadow-xl">
        <div className="card-body my-6">
          {news.newsImages && news.newsImages.length > 0 && (
            <div className="mb-6">
              {hasMultipleImages ? (
                <div className="carousel w-full rounded-xl overflow-hidden">
                  {news.newsImages.map((img, idx) => (
                    <div
                      key={idx}
                      id={`slide-${idx}`}
                      className="carousel-item relative w-full"
                    >
                      <img
                        src={img.url}
                        alt={`${news.title} - ${idx + 1}`}
                        className="w-full max-h-100 object-contain carousel-item cursor-pointer"
                        onClick={() => openImageModal(news.newsImages, idx)}
                      />
                      <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                        {idx > 0 && (
                          <a
                            href={`#slide-${idx - 1}`}
                            className="btn btn-circle btn-ghost"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </a>
                        )}
                        {idx < news.newsImages.length - 1 && (
                          <a
                            href={`#slide-${idx + 1}`}
                            className="btn btn-circle btn-ghost"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={news.newsImages[0].url}
                    alt={news.title}
                    className="w-full max-h-100 object-contain rounded-xl cursor-pointer"
                    onClick={() => openImageModal(news.newsImages, 0)}
                  />
                  <button
                    onClick={() => openImageModal(news.newsImages, 0)}
                    className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost bg-base-100/70"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {hasMultipleImages && (
                <div className="flex justify-center gap-2 mt-4">
                  {news.newsImages.map((_, idx) => (
                    <a
                      key={idx}
                      href={`#slide-${idx}`}
                      className="btn btn-xs btn-circle"
                    >
                      {idx + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col items-center gap-4 mx-3 md:mx-16">
            <h2 className="card-title text-xl md:text-2xl font-extrabold">
              {news.title}
            </h2>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <img src={calendar} alt={calendar} className="w-4 h-4" />
                <p className="text-base-content text-sm font-semibold">
                  {new Date(news.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div className="w-1 h-1 bg-base-content/70 rounded-full" />
              <span className="text-base-content text-sm font-semibold">
                Dilihat oleh {news.activity?.totalViews || 0} pengguna
              </span>
            </div>

            <p className="text-base-content/70 font-semibold text-base">
              {news.caption}
            </p>

            <div className="stats stats-horizontal shadow-2xl bg-base-100">
              <div className="stat">
                <div className="stat-figure">
                  <img src={like} alt={like} className="w-6 h-6" />
                </div>
                <div className="stat-title font-semibold">Total Suka</div>
                <div className="stat-value text-warning text-2xl">
                  {news.activity?.totalLikes || 0}
                </div>
              </div>
              <div className="stat">
                <div className="stat-figure">
                  <img src={dislike} alt={dislike} className="w-6 h-6" />
                </div>
                <div className="stat-title font-semibold">Total Tidak Suka</div>
                <div className="stat-value text-warning text-2xl">
                  {news.activity?.totalDislikes || 0}
                </div>
              </div>
              <div className="stat">
                <div className="stat-figure">
                  <img
                    src={commentChat}
                    alt={commentChat}
                    className="w-6 h-6"
                  />{" "}
                </div>
                <div className="stat-title font-semibold">Total Komentar</div>
                <div className="stat-value text-warning text-2xl">
                  {news.activity?.totalComments || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <div className="flex items-start gap-1">
          <h3 className="text-lg font-semibold text-base-content/70">
            Semua Komentar
          </h3>
          <div className="text-sm font-semibold text-warning">
            ({comments.length})
          </div>
        </div>

        {commentsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <span className="loading loading-spinner loading-lg text-base-content/70" />
            <p className="text-base-content/70 font-semibold text-base">
              Tunggu sebentar...
            </p>
          </div>
        ) : commentsError ? (
          <div className="alert alert-error shadow-lg">
            <AlertCircle className="w-6 h-6" />
            <span>
              Error: {commentsError.message || "Gagal memuat komentar"}
            </span>
          </div>
        ) : !commentsLoading && !commentsError && comments.length === 0 ? (
          <div className="card">
            <div className="card-body flex-col items-center justify-center py-16">
              <img src={poopIcon} alt={poopIcon} className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-bold text-center mb-2">
                Belum Ada Komentar
              </h3>
              <p className="text-base-content/70 text-sm text-center font-semibold">
                Komentar akan muncul di sini setelah pelanggan meninggalkan
                komentar atau reaksi.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                level={0}
                onReply={handleReply}
                onEdit={handleEdit}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                onHide={handleHideComment}
                onReaction={handleReaction}
                isReplying={createCommentMutation.isPending}
                isEditing={editingComment?._id === comment._id}
                editText={editText}
                setEditText={setEditText}
                onCancelEdit={handleCancelEdit}
                isUpdatePending={updateCommentMutation.isPending}
                isReactionPending={reactToCommentMutation.isPending}
                visibleReplies={visibleReplies}
                toggleReplies={toggleReplies}
              />
            ))}
          </div>
        )}
      </div>

      <div
        ref={replyFormRef}
        className="sticky bottom-4 z-10 mt-6 card bg-base-300 shadow-xl border border-base-100"
      >
        <div className="card-body p-5">
          {replyTo && (
            <div className="alert alert-info bg-info/20 text-info border-info/30 py-2 mb-3">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Membalas:{" "}
                    <span className="font-bold">
                      @{replyTo.userId?.username}
                    </span>
                  </span>
                  <span className="text-xs opacity-70 truncate max-w-xs">
                    "
                    {replyTo.comment.length > 50
                      ? `${replyTo.comment.substring(0, 50)}...`
                      : replyTo.comment}
                    "
                  </span>
                </div>
                <button
                  onClick={handleCancelReply}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                replyTo
                  ? "Tulis balasan Anda di sini..."
                  : "Tulis komentar sebagai admin..."
              }
              rows={2}
              className="textarea textarea-bordered flex-1 font-semibold focus:textarea-secondary resize-none"
            />
            <button
              onClick={handleSubmitReply}
              disabled={createCommentMutation.isPending}
              className="btn btn-secondary gap-2 self-end"
            >
              {createCommentMutation.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Kirim
            </button>
          </div>

          <p className="text-xs text-warning font-medium mt-2 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Sebagai admin, komentar Anda akan terlihat dengan label "Admin"
          </p>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 btn btn-circle btn-ghost text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevImage}
            disabled={currentImageIndex === 0}
            className="absolute left-4 btn btn-circle btn-ghost text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={selectedImage[currentImageIndex]?.url}
            alt={`Image ${currentImageIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />

          <button
            onClick={nextImage}
            disabled={currentImageIndex === selectedImage.length - 1}
            className="absolute right-4 btn btn-circle btn-ghost text-white disabled:opacity-30"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {selectedImage.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 text-white text-sm">
              {currentImageIndex + 1} / {selectedImage.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentPage;
