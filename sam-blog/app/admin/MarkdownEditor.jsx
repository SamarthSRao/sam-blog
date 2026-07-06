"use client";
import React, { useState, useRef } from "react";

export default function MarkdownEditor({ name, defaultValue }) {
  const [content, setContent] = useState(defaultValue || "");
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }

    setIsUploading(true);
   
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. UPLOAD TO S3
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        // 2. BUILD THE MARKDOWN STRING
        const markDownString = `\n![Image](${data.url})\n`;

        // 3. CURSOR INJECTION
        const position = textareaRef.current?.selectionStart || content.length;
        const before = content.substring(0, position);
        const after = content.substring(position);
        
        // Update the textarea state!
        setContent(before + markDownString + after);
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
    
    // Clean up
    e.target.value = '';
    setIsUploading(false);
  };

  const handleBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const textToInsert = selectedText ? `**${selectedText}**` : `****`;
    const newContent = before + textToInsert + after;
    
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + 2, end + 2);
      } else {
        textarea.setSelectionRange(start + 2, start + 2);
      }
    }, 0);
  };

  // 4. THE UI RETURN
  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center">
        <label htmlFor={name} className="text-sm font-medium text-zinc-300">
          Content
        </label>
        
        <div className="flex gap-2 items-center">
          <button 
            type="button" 
            onClick={handleBold}
            className="text-xs font-mono bg-zinc-800 text-white px-3 py-1 rounded hover:bg-zinc-700 transition-colors font-bold"
            title="Bold text"
          >
            B
          </button>
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-xs font-mono bg-zinc-800 text-white px-3 py-1 rounded hover:bg-zinc-700 transition-colors"
          >
            {isUploading ? "Uploading..." : "Add Image 🖼️"}
          </button>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleUpload} 
        />
      </div>
      
      <textarea
        id={name}
        name={name}
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your markdown here..."
        required
        rows={12}
        className="w-full bg-[#111] border border-zinc-800 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-zinc-600 outline-none transition-all resize-none font-mono"
      />
    </div>
  );
}