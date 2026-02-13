import { PlusIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router";

import blog from "../assets/icons/blog.png";

const BlogPage = () => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="breadcrumbs text-sm mb-3">
          <ul className="px-3">
            <li>
              <Link to="/blogs">
                <img src={blog} alt="Blog" className="size-6" />
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
    </div>
  );
};

export default BlogPage;
