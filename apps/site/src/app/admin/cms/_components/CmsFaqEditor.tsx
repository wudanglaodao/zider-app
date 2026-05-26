"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import type { CmsFaqItem } from "@/lib/cms/faq";

type EditableFaqItem = CmsFaqItem & {
  id: string;
};

export function CmsFaqEditor({ initialItems }: { initialItems: CmsFaqItem[] }) {
  const [items, setItems] = useState<EditableFaqItem[]>(() =>
    initialItems.length ? initialItems.map(createEditableItem) : [createEmptyItem()],
  );
  const serializedItems = useMemo(
    () =>
      JSON.stringify(
        items
          .map((item) => ({
            answer: item.answer.trim(),
            question: item.question.trim(),
          }))
          .filter((item) => item.question && item.answer),
      ),
    [items],
  );

  function updateItem(id: string, field: "answer" | "question", value: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, createEmptyItem()]);
  }

  function removeItem(id: string) {
    setItems((currentItems) =>
      currentItems.length > 1 ? currentItems.filter((item) => item.id !== id) : [createEmptyItem()],
    );
  }

  return (
    <section className="faq-editor" aria-labelledby="faq-editor-heading">
      <input name="faqItems" type="hidden" value={serializedItems} />
      <div className="faq-editor__head">
        <div>
          <p className="form-card__eyebrow">Forum FAQ</p>
          <h3 id="faq-editor-heading">FAQ list</h3>
          <span>Optional questions shown below the forum answer and prepared for search snippets.</span>
        </div>
        <button className="cms-button-secondary" onClick={addItem} type="button">
          <Plus aria-hidden="true" size={16} />
          Add FAQ
        </button>
      </div>

      <div className="faq-editor__items">
        {items.map((item, index) => (
          <article className="faq-editor__item" key={item.id}>
            <div className="faq-editor__item-head">
              <strong>FAQ {index + 1}</strong>
              <button aria-label={`Remove FAQ ${index + 1}`} onClick={() => removeItem(item.id)} type="button">
                <Trash2 aria-hidden="true" size={16} />
              </button>
            </div>
            <label>
              <span>Question</span>
              <input
                onChange={(event) => updateItem(item.id, "question", event.target.value)}
                placeholder="What should readers know?"
                value={item.question}
              />
            </label>
            <label>
              <span>Answer</span>
              <textarea
                onChange={(event) => updateItem(item.id, "answer", event.target.value)}
                placeholder="Keep the answer concise and reusable."
                rows={3}
                value={item.answer}
              />
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}

function createEditableItem(item: CmsFaqItem): EditableFaqItem {
  return {
    ...item,
    id: crypto.randomUUID(),
  };
}

function createEmptyItem(): EditableFaqItem {
  return {
    answer: "",
    id: crypto.randomUUID(),
    question: "",
  };
}
