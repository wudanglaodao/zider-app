"use client";

import { useEffect, useRef, useState } from "react";

type MediaItem = {
  createdAt: string;
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

const mediaLibraryStorageKey = "zider.cms.mediaLibrary.v1";

export function CmsRichTextEditor({ initialHtml }: { initialHtml?: string }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [initialValue] = useState(initialHtml || "<p></p>");
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaStatus, setMediaStatus] = useState("Local preview library. Tencent Cloud storage can be connected later.");

  useEffect(() => {
    setMediaItems(readMediaLibrary());
  }, []);

  function syncEditor() {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = editorRef.current?.innerHTML ?? "";
    }
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function formatBlock(tag: "h1" | "h2" | "p") {
    focusEditor();
    document.execCommand("formatBlock", false, tag);
    syncEditor();
  }

  function addLink() {
    focusEditor();
    const url = window.prompt("Paste link URL");

    if (!url) {
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection?.toString();

    if (!selectedText) {
      const label = window.prompt("Link text", url) || url;
      document.execCommand("insertHTML", false, `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`);
    } else {
      document.execCommand("createLink", false, url);
    }

    syncEditor();
  }

  async function handleImageUpload(fileList: FileList | null | undefined) {
    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));

    if (!files.length) {
      return;
    }

    setMediaStatus("Uploading to local media library...");

    try {
      const uploadedItems = await Promise.all(files.map((file) => createLocalMediaItem(file)));
      const nextItems = [...uploadedItems, ...mediaItems];
      setMediaItems(nextItems);
      writeMediaLibrary(nextItems);
      setMediaStatus(`${uploadedItems.length} image${uploadedItems.length > 1 ? "s" : ""} added. Choose one to insert.`);
      setIsMediaLibraryOpen(true);
    } catch (error) {
      console.error("Failed to upload media", error);
      setMediaStatus("Upload failed. The local preview library may be full.");
    } finally {
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  }

  function insertMediaItem(item: MediaItem) {
    focusEditor();
    document.execCommand(
      "insertHTML",
      false,
      `<figure><img src="${escapeAttribute(item.url)}" alt="${escapeAttribute(item.name)}" /><figcaption></figcaption></figure>`,
    );
    syncEditor();
    setIsMediaLibraryOpen(false);
  }

  function removeMediaItem(itemId: string) {
    const nextItems = mediaItems.filter((item) => item.id !== itemId);
    setMediaItems(nextItems);
    writeMediaLibrary(nextItems);
    setMediaStatus("Media item removed from the local library.");
  }

  return (
    <div className="rich-editor-wrap">
      <span className="rich-editor-label">Body</span>
      <div className="toolbar" aria-label="Rich text tools">
        <button onClick={() => formatBlock("h1")} type="button">
          H1
        </button>
        <button onClick={() => formatBlock("h2")} type="button">
          H2
        </button>
        <button onClick={() => formatBlock("p")} type="button">
          P
        </button>
        <button onClick={addLink} type="button">
          Link
        </button>
        <button onClick={() => setIsMediaLibraryOpen(true)} type="button">
          Media Library
        </button>
        <label>
          Upload Image
          <input
            accept="image/*"
            multiple
            onChange={(event) => void handleImageUpload(event.target.files)}
            ref={imageInputRef}
            type="file"
          />
        </label>
      </div>
      <div
        className="rich-editor"
        contentEditable
        dangerouslySetInnerHTML={{ __html: initialValue }}
        onBlur={syncEditor}
        onInput={syncEditor}
        ref={editorRef}
        role="textbox"
        suppressContentEditableWarning
      />
      <input defaultValue={initialValue} name="body" ref={hiddenInputRef} type="hidden" />
      {isMediaLibraryOpen ? (
        <div className="media-library-overlay" role="presentation">
          <section aria-label="Media library" aria-modal="true" className="media-library-dialog" role="dialog">
            <div className="media-library-head">
              <div>
                <p>Media Library</p>
                <h3>Select an image</h3>
                <span>{mediaStatus}</span>
              </div>
              <button onClick={() => setIsMediaLibraryOpen(false)} type="button">
                Close
              </button>
            </div>

            {mediaItems.length ? (
              <div className="media-library-grid">
                {mediaItems.map((item) => (
                  <article className="media-card" key={item.id}>
                    <button
                      aria-label={`Insert ${item.name}`}
                      className="media-card__preview"
                      onClick={() => insertMediaItem(item)}
                      type="button"
                    >
                      <img alt="" src={item.url} />
                    </button>
                    <div className="media-card__body">
                      <strong title={item.name}>{item.name}</strong>
                      <span>{formatFileSize(item.size)}</span>
                      <div className="media-card__actions">
                        <button onClick={() => insertMediaItem(item)} type="button">
                          Insert
                        </button>
                        <button onClick={() => removeMediaItem(item.id)} type="button">
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="media-empty">
                <p>No media yet.</p>
                <span>Use Upload Image to add images before inserting them into the content body.</span>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

async function createLocalMediaItem(file: File): Promise<MediaItem> {
  const dataUrl = await readFileAsDataUrl(file);

  return {
    createdAt: new Date().toISOString(),
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type,
    url: dataUrl,
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => reject(reader.error));
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.readAsDataURL(file);
  });
}

function readMediaLibrary() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(mediaLibraryStorageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue.filter(isMediaItem) : [];
  } catch {
    return [];
  }
}

function writeMediaLibrary(items: MediaItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mediaLibraryStorageKey, JSON.stringify(items));
}

function isMediaItem(value: unknown): value is MediaItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<MediaItem>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.url === "string" &&
    typeof item.type === "string"
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
