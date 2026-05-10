import React, { useState, useEffect } from "react";
import { XIcon, PlusIcon } from "lucide-react";

const TagInput = ({
  value = "",
  onChange,
  placeholder = "Ketik tag...",
  label = "Tags",
  icon = null,
}) => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (value && typeof value === "string" && value.trim() !== "") {
      const tagArray = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
      if (tagArray.length > 0) {
        setTags(tagArray);
      }
    } else if (Array.isArray(value)) {
      setTags(value.length > 0 ? value : []);
    } else {
      setTags([]);
    }
  }, [value]);

  const updateParent = (newTags) => {
    const tagsString = newTags.join(", ");
    onChange({
      target: {
        name: "tags",
        value: tagsString,
      },
    });
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim().toLowerCase();

    if (trimmedValue === "") return;

    if (tags.includes(trimmedValue)) {
      setError(`Tag "${trimmedValue}" sudah ada!`);
      setTimeout(() => setError(""), 3000);
      setInputValue("");
      return;
    }

    if (tags.length >= 16) {
      setError("Maksimal 16 tags per berita!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const newTags = [...tags, trimmedValue];
    setTags(newTags);
    updateParent(newTags);
    setInputValue("");
    setError("");
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    updateParent(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const pastedTags = pastedText
      .split(/[,\n]+/)
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag !== "");

    const newTags = [...tags];
    for (const tag of pastedTags) {
      if (!newTags.includes(tag) && newTags.length < 16) {
        newTags.push(tag);
      }
    }

    setTags(newTags);
    updateParent(newTags);
    setInputValue("");
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold text-[#d6d6d6] flex items-center gap-2">
          {icon && <img src={icon} className="w-5 h-5" alt="tag icon" />}
          {label}
        </span>
        <span className="label-text-alt font-semibold text-xs text-base-content/60">
          {tags.length}/16 tags
        </span>
      </label>

      <div className="relative mt-2">
        <div className="flex flex-wrap gap-2 p-3 border-2 border-base-300 rounded-xl focus-within:border-secondary transition-colors min-h-15 bg-base-100">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary/20 text-secondary rounded-full text-sm font-medium"
            >
              <span className="text-secondary">#</span>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:bg-secondary/30 rounded-full p-0.5 transition-colors"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          ))}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              tags.length === 0 ? placeholder : "Pisah tag dengan spasi"
            }
            className="flex-1 min-w-30 bg-transparent outline-none text-sm text-base-content placeholder:text-base-content/40"
          />
          {error}
        </div>

        <button
          type="button"
          onClick={addTag}
          className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-sm btn-circle btn-ghost"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs text-base-content/40">
          Contoh tags populer:
        </span>
        <button
          type="button"
          onClick={() => {
            const exampleTags = [
              "produk-baru",
              "promo",
              "diskon",
              "giveaway",
              "tips",
            ].map((tag) => tag.toLowerCase());
            const newTags = [...new Set([...tags, ...exampleTags])].slice(
              0,
              16,
            );
            setTags(newTags);
            updateParent(newTags);
          }}
          className="text-xs text-secondary hover:text-secondary-focus transition-colors"
        >
          📋 Gunakan contoh tags
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {[
          "produk-baru",
          "promo",
          "diskon",
          "tips",
          "tutorial",
          "event",
          "giveaway",
          "collaboration",
        ].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              const normalizedSuggestion = suggestion.toLowerCase();
              if (!tags.includes(normalizedSuggestion) && tags.length < 16) {
                const newTags = [...tags, normalizedSuggestion];
                setTags(newTags);
                updateParent(newTags);
              }
            }}
            className="px-2 py-0.5 bg-base-300 font-medium text-[#d6d6d6] hover:bg-secondary/20 rounded-full text-xs transition-colors"
          >
            # {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagInput;
