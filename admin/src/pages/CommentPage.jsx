import { useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newsApi, commentApi } from "../lib/api";
import toast from "react-hot-toast";

const CommentPage = () => {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const replyFormRef = useRef(null);

  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [visibleReplies, setVisibleReplies] = useState(new Set());

  // Fetch detail berita
  const {
    data: newsData,
    isLoading: newsLoading,
    error: newsError,
  } = useQuery({
    queryKey: ["news-detail", newsId],
    queryFn: () => newsApi.getById(newsId),
    enabled: !!newsId,
  });

  // Fetch komentar untuk berita ini
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

  // Create komentar (balasan)
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

  // Update komentar
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

  // Like/Dislike komentar
  const reactToCommentMutation = useMutation({
    mutationFn: commentApi.reactToComment,
    onSuccess: () => {
      refetchComments();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memberi reaksi");
    },
  });

  // Delete komentar
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

  // Hide/Unhide komentar (admin)
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
    replyFormRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // Render komentar recursively
  const renderComment = (comment, level = 0) => {
    const isHidden = comment.isHidden;
    const maxLevel = 3; // Batas level nested untuk tampilan yang rapi
    const marginLeft = level * 24;

    return (
      <div
        key={comment._id}
        id={`comment-${comment._id}`}
        className={`border rounded-lg p-4 transition-all ${
          isHidden ? "bg-gray-50 opacity-70" : "bg-white"
        }`}
        style={{
          marginLeft: level > 0 ? `${Math.min(marginLeft, 96)}px` : "0",
        }}
      >
        {/* Header Komentar */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-800 flex items-center gap-1">
                {comment.userId?.avatar ? (
                  <img
                    src={comment.userId.avatar}
                    alt={comment.userId.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                    {comment.userId?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                {comment.userId?.username || "User Tidak Diketahui"}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString("id-ID")}
              </span>
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-xs text-gray-400">(diedit)</span>
              )}
              {isHidden && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  Tersembunyi
                </span>
              )}
              {comment.isReply && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  Balasan
                </span>
              )}
            </div>

            {/* Konten Komentar (editable) */}
            {editingComment?._id === comment._id ? (
              <div className="mt-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleUpdateComment(comment._id)}
                    disabled={updateCommentMutation.isPending}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <p
                className={`mt-1 text-gray-700 ${isHidden ? "line-through" : ""}`}
              >
                {comment.comment}
              </p>
            )}

            {/* Action Buttons */}
            {!editingComment && (
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <button
                  onClick={() => handleReaction(comment._id, "like")}
                  className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition ${
                    comment.userLiked
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  👍 {comment.activity?.totalLikes || 0}
                </button>
                <button
                  onClick={() => handleReaction(comment._id, "dislike")}
                  className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition ${
                    comment.userDisliked
                      ? "bg-red-100 text-red-600"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  👎 {comment.activity?.totalDislikes || 0}
                </button>
                <button
                  onClick={() => handleReply(comment)}
                  className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                >
                  💬 Balas
                </button>
                {!comment.isReply && (
                  <button
                    onClick={() => {
                      setVisibleReplies((prev) => {
                        const next = new Set(prev);
                        if (next.has(comment._id)) {
                          next.delete(comment._id);
                        } else {
                          next.add(comment._id);
                        }
                        return next;
                      });
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    💬{" "}
                    {visibleReplies.has(comment._id) ? "Sembunyikan" : "Lihat"}{" "}
                    balasan ({comment.replies?.length || 0})
                  </button>
                )}
                <button
                  onClick={() => handleEdit(comment)}
                  className="text-sm text-yellow-600 hover:text-yellow-800 px-2 py-1 rounded hover:bg-yellow-50"
                >
                  ✏️ Edit
                </button>
              </div>
            )}
          </div>

          {/* Admin Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleHideComment(comment._id, isHidden)}
              className={`p-1.5 rounded transition ${
                isHidden
                  ? "text-green-600 hover:bg-green-50"
                  : "text-orange-600 hover:bg-orange-50"
              }`}
              title={isHidden ? "Tampilkan kembali" : "Sembunyikan komentar"}
            >
              {isHidden ? "👁️" : "🙈"}
            </button>
            <button
              onClick={() => handleDeleteComment(comment._id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
              title="Hapus komentar"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Replies Container */}
        {comment.replies && comment.replies.length > 0 && (
          <div
            className={`replies-container mt-3 space-y-2 ${!visibleReplies.has(comment._id) || level >= maxLevel ? "hidden" : ""}`}
          >
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (newsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading detail berita...</div>
      </div>
    );
  }

  if (newsError || !newsData?.news) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {newsError?.message || "Berita tidak ditemukan"}
        </div>
        <Link
          to="/admin/news"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Kembali ke Daftar Berita
        </Link>
      </div>
    );
  }

  const news = newsData.news;
  const comments = commentsData?.comments || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/news"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                ← Kembali
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-800">
                Kelola Komentar
              </h1>
            </div>
            <Link
              to={`/news/${news.slug || news._id}`}
              target="_blank"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              🔗 Lihat di publik
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Info Berita */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            {news.newsImages?.[0]?.url && (
              <div className="md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img
                  src={news.newsImages[0].url}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {news.title}
              </h2>
              <p className="text-gray-600 mb-3">{news.caption}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>👍 {news.activity?.totalLikes || 0} suka</span>
                <span>👎 {news.activity?.totalDislikes || 0} tidak suka</span>
                <span>💬 {news.activity?.totalComments || 0} komentar</span>
                <span>👁️ {news.activity?.totalViews || 0} dilihat</span>
                <span>
                  📅 {new Date(news.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistik Komentar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
          <div>
            <span className="font-semibold text-gray-700">Total Komentar:</span>
            <span className="ml-2 text-2xl font-bold text-blue-600">
              {news.activity?.totalComments || 0}
            </span>
            <span className="ml-4 text-sm text-gray-500">
              ({news.activity?.totalParentComments || 0} komentar utama)
            </span>
          </div>
          <button
            onClick={() => refetchComments()}
            className="text-gray-500 hover:text-gray-700"
            title="Refresh komentar"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Daftar Komentar */}
        <div className="space-y-4" id="comments-list">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Semua Komentar ({comments.length})
          </h3>

          {commentsLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading komentar...
            </div>
          ) : commentsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              Error: {commentsError.message || "Gagal memuat komentar"}
            </div>
          ) : comments.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p>Belum ada komentar untuk berita ini.</p>
              <p className="text-sm mt-1">
                Komentar akan muncul di sini setelah user memberikan komentar.
              </p>
            </div>
          ) : (
            comments.map((comment) => renderComment(comment, 0))
          )}
        </div>

        <div
          ref={replyFormRef}
          className="sticky bottom-4 mt-6 bg-white rounded-lg shadow-lg border p-4"
        >
          {replyTo && (
            <div className="mb-3 text-sm text-gray-600 flex justify-between items-center pb-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Membalas:</span>
                <span className="font-semibold text-blue-600">
                  @{replyTo.userId?.username}
                </span>
                <span className="text-gray-400 text-xs truncate max-w-md">
                  "{replyTo.comment.substring(0, 50)}..."
                </span>
              </div>
              <button
                onClick={handleCancelReply}
                className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
              >
                Batal Balas
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                replyTo
                  ? "Tulis balasan Anda di sini..."
                  : "Tulis komentar sebagai admin (akan muncul sebagai @admin)..."
              }
              rows={3}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <button
              onClick={handleSubmitReply}
              disabled={createCommentMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 self-end"
            >
              {createCommentMutation.isPending ? "Mengirim..." : "Kirim"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 Sebagai admin, komentar Anda akan terlihat dengan label "Admin"
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommentPage;
