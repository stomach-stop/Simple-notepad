import express from "express";
import db, { getAllMemos } from "./db.js";
import { Memo } from "./types.js";

const app = express();
app.use(express.json()); // JSONを受け取るために必要

const PORT = 3000;

// メモを全て取得
app.get("/memos", async (req, res) => {
  try {
    const memos = await getAllMemos();
    res.json(memos);
  } catch (err) {
    res.status(500).json({ error: "メモの取得に失敗しました" });
  }
});

// 指定したメモを取得
app.get("/memos/:id", (req, res) => {
  const id = Number(req.params.id);
  db.get("SELECT * FROM memos WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "メモの取得に失敗しました" });
    if (!row) return res.status(404).json({ error: "メモが見つかりません" });
    res.json(row);
  });
});

// メモを追加
app.post("/memos", (req, res) => {
  const { title, content } = req.body as { title: string; content: string };
  if (!title || !content) {
    return res.status(400).json({ error: "タイトルと本文は必須です" });
  }

  db.run(
    "INSERT INTO memos (title, content) VALUES (?, ?)",
    [title, content],
    function (err) {
      if (err) return res.status(500).json({ error: "メモの追加に失敗しました" });
      // this.lastID で追加されたIDを取得
      res.status(201).json({ id: this.lastID, title, content });
    }
  );
});

// メモを編集
app.put("/memos/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, content } = req.body as { title?: string; content?: string };
  if (!title && !content) {
    return res.status(400).json({ error: "タイトルまたは本文のいずれかは必要です" });
  }

  db.run(
    `UPDATE memos SET title = COALESCE(?, title), content = COALESCE(?, content) WHERE id = ?`,
    [title, content, id],
    function (err) {
      if (err) return res.status(500).json({ error: "メモの更新に失敗しました" });
      if (this.changes === 0) return res.status(404).json({ error: "メモが見つかりません" });
      res.json({ id, title, content });
    }
  );
});

// メモを削除
app.delete("/memos/:id", (req, res) => {
  const id = Number(req.params.id);
  db.run("DELETE FROM memos WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "メモの削除に失敗しました" });
    if (this.changes === 0) return res.status(404).json({ error: "メモが見つかりません" });
    res.json({ message: "メモを削除しました", id });
  });
});

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//以下追加部分
import path from "path";
import { fileURLToPath } from "url";

// ESMで __dirname を使うための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// publicフォルダを使う設定
app.use(express.static(path.join(__dirname, "public")));

// 以下さらに追加部分
// / にアクセスしたら index.html を返す
/*
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
*/