import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import blogManagement from "../assets/icons/blog.png";
import { blogApi } from "../lib/api";

const BlogPage = () => {
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    tags: "",
    author: "",
  });
  const [blogImages, setBlogImages] = useState([]);
  const [blogImagePreviews, setBlogImagePreviews] = useState([]);
  const [deletingBlogId, setDeletingBlogId] = useState(null);

  const queryClient = useQueryClient();

  const { data: blogs = [], isLoading: blogsLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: blogApi.getAll,
  });

  const createBlogMutation = useMutation({
    mutationFn: blogApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: blogApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: blogApi.delete,
    onSuccess: () => {
      setDeletingBlogId(null);
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: () => {
      setDeletingBlogId(null);
    },
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="breadcrumbs text-sm mb-3">
          <ul className="px-3">
            <li>
              <Link to="/blogs">
                <img src={blogManagement} alt="Blog" className="size-6" />
              </Link>
            </li>
            <li className="font-semibold text-white">Blog</li>
          </ul>
        </div>

        <button className="btn btn-secondary gap-2 font-bold">
          <PlusIcon className="w-5 h-5" />
          Tambah Blog
        </button>
      </div>

      {/* Main */}
      <div className="card bg-base-300 shadow-xl">
        <div className="card-body">
          {blogsLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">
                Belum ada blog yang ditambahkan
              </p>
              <p className="text-sm">
                Seluruh blog akan muncul setelah Anda menambahkan blog baru
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
