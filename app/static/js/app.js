/* USTEM Academy - клиентские помощники без сборки и зависимостей. */
(function () {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const CSRF = () => ($('meta[name="csrf-token"]') || {}).content || "";

  async function api(url, { method = "POST", json, body, headers = {} } = {}) {
    const opts = { method, headers: { "X-CSRF-Token": CSRF(), ...headers }, credentials: "same-origin" };
    if (json !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(json);
    } else if (body !== undefined) {
      opts.body = body;
    }
    const res = await fetch(url, opts);
    let data = {};
    try { data = await res.json(); } catch (e) { /* not json */ }
    if (!res.ok || data.ok === false) {
      const err = new Error(data.error || res.statusText);
      err.status = res.status;
      throw err;
    }
    return data;
  }
  window.academyApi = api;

  const fmtTime = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const fmtSize = (n) => n > 1073741824 ? (n / 1073741824).toFixed(1) + " ГБ" : n > 1048576 ? (n / 1048576).toFixed(1) + " МБ" : Math.ceil(n / 1024) + " КБ";
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ─── Боковое меню на телефоне ───────────────────────────────────────
  $$("[data-toggle-sidebar]").forEach((b) => b.addEventListener("click", () => {
    const sb = $("#sidebar"), bd = $("#sidebar-backdrop");
    if (!sb) return;
    const open = sb.classList.contains("hidden");
    sb.classList.toggle("hidden", !open);
    sb.classList.toggle("flex", open);
    bd && bd.classList.toggle("hidden", !open);
  }));

  // ─── Копирование ссылок и подтверждения ─────────────────────────────
  document.addEventListener("click", async (e) => {
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      e.preventDefault();
      try { await navigator.clipboard.writeText(copy.dataset.copy); } catch (err) { window.prompt("", copy.dataset.copy); return; }
      const old = copy.innerHTML;
      copy.innerHTML = "✓";
      setTimeout(() => (copy.innerHTML = old), 1200);
    }
    const conf = e.target.closest("[data-confirm]");
    if (conf && !window.confirm(conf.dataset.confirm)) e.preventDefault();
  });

  // ─── Поля на трех языках ────────────────────────────────────────────
  $$("[data-ml]").forEach((box) => {
    box.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-ml-tab]");
      if (!tab) return;
      const lang = tab.dataset.mlTab;
      $$("[data-ml-tab]", box).forEach((t) => t.classList.toggle("ml-tab-active", t === tab));
      $$("[data-ml-pane]", box).forEach((p) => p.classList.toggle("hidden", p.dataset.mlPane !== lang));
      const field = $(`[data-ml-pane="${lang}"] input, [data-ml-pane="${lang}"] textarea`, box);
      field && field.focus();
    });
  });

  // ─── Предпросмотр Markdown в студии ─────────────────────────────────
  $$("[data-md-preview-box]").forEach((box) => {
    box.addEventListener("toggle", async () => {
      if (!box.open) return;
      const form = box.closest("form");
      const src = $$("[data-md-source]", form).find((t) => !t.closest("[data-ml-pane]").classList.contains("hidden"));
      const out = $("[data-md-preview]", box);
      try { out.innerHTML = (await api(box.dataset.url, { json: { text: src ? src.value : "" } })).html; }
      catch (e) { out.textContent = e.message; }
    });
  });

  $$("[data-add-option]").forEach((b) => b.addEventListener("click", () => {
    const hidden = $$("[data-option-row].hidden", b.closest("form"));
    if (hidden.length) hidden[0].classList.remove("hidden");
    if (hidden.length <= 1) b.remove();
  }));

  // ─── Загрузка видео частями с докачкой ──────────────────────────────
  $$("[data-uploader]").forEach((box) => {
    const T = window.I18N_UP || {};
    const form = box.closest("form");
    const list = $("[data-upload-list]", box);
    const input = $("[data-upload-input]", box);
    const submit = form && $("[data-submit]", form);
    const wait = form && $("[data-upload-wait]", form);
    const attachUrl = box.dataset.attachUrl;  // Студия: готовый файл сразу становится видео урока
    let active = 0;
    const refresh = () => { if (submit) submit.disabled = active > 0; if (wait) wait.hidden = active === 0; };

    const add = (file) => {
      const li = document.createElement("li");
      li.className = "rounded-lg border border-slate-200 p-3 bg-white";
      li.innerHTML = `<div class="flex items-center gap-2 text-sm"><span class="flex-1 truncate font-medium">${esc(file.name)}</span><span class="text-xs text-slate-500" data-st>${T.uploading || ""}</span><button type="button" class="text-slate-400 hover:text-rose-600" data-rm aria-label="${esc(T.remove || "x")}">✕</button></div><div class="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-1.5 bg-brand-500 rounded-full" style="width:0%" data-bar></div></div>`;
      list.appendChild(li);
      const st = $("[data-st]", li), bar = $("[data-bar]", li);
      const key = `upl:${file.name}:${file.size}:${file.lastModified}`;
      let cancelled = false, fileId = null;
      active++; refresh();

      const show = (received) => {
        const p = Math.round((100 * received) / file.size);
        bar.style.width = p + "%";
        st.textContent = `${p}% · ${fmtSize(received)} / ${fmtSize(file.size)}`;
      };

      const run = async () => {
        let id = store.get(key), received = 0, chunk = 5 * 1024 * 1024;
        try {
          if (id) {
            try { const s = await api(box.dataset.statusUrl + id, { method: "GET" }); received = s.received; if (s.file_id) fileId = s.file_id; }
            catch (e) { id = null; }
          }
          if (!id) {
            const s = await api(box.dataset.startUrl, { json: { name: file.name, size: file.size, type: file.type } });
            id = s.id; chunk = s.chunk || chunk; store.set(key, id);
          }
          let tries = 0;
          while (!fileId && !cancelled) {
            show(received);
            try {
              const r = await api(`${box.dataset.statusUrl}${id}?offset=${received}`, { method: "PUT", body: file.slice(received, received + chunk) });
              received = r.received; tries = 0;
              if (r.file_id) fileId = r.file_id;
            } catch (e) {
              if (e.status && e.status < 500 && e.status !== 429) throw e;
              tries++;
              st.textContent = T.paused || "...";
              await new Promise((ok) => setTimeout(ok, Math.min(30000, 1500 * tries)));
              if (!navigator.onLine) await new Promise((ok) => window.addEventListener("online", ok, { once: true }));
              try { received = (await api(box.dataset.statusUrl + id, { method: "GET" })).received; } catch (e2) { /* retry */ }
            }
          }
          if (cancelled) return;
          show(file.size);
          st.textContent = T.done || "OK";
          bar.classList.replace("bg-brand-500", "bg-accent-500");
          store.del(key);
          if (attachUrl) {
            const lang = $("[data-upload-lang]", box);
            await api(attachUrl, { json: { file_id: fileId, lang: lang ? lang.value : "all" } });
            active = 0;  // не спрашивать «покинуть страницу?» при перезагрузке
            window.location.reload();
            return;
          }
          const hidden = document.createElement("input");
          hidden.type = "hidden"; hidden.name = "file_id"; hidden.value = fileId;
          li.appendChild(hidden);
        } catch (e) {
          st.textContent = `${T.failed || "Error"}: ${e.message}`;
          st.classList.add("text-rose-600");
        } finally {
          active--; refresh();
        }
      };
      $("[data-rm]", li).addEventListener("click", async () => {
        cancelled = true;
        if (fileId) { try { await api(box.dataset.deleteUrl + fileId, { method: "DELETE" }); } catch (e) { /* ignore */ } }
        li.remove();
      });
      run();
    };
    const pick = (files) => {
      files = Array.from(files || []);
      if (box.hasAttribute("data-single")) { if (active > 0) return; files = files.slice(0, 1); list.innerHTML = ""; }
      files.forEach(add);
    };
    input.addEventListener("change", () => { pick(input.files); input.value = ""; });
    ["dragover", "dragenter"].forEach((ev) => box.addEventListener(ev, (e) => { e.preventDefault(); box.classList.add("border-brand-400", "bg-brand-50"); }));
    ["dragleave", "drop"].forEach((ev) => box.addEventListener(ev, (e) => { e.preventDefault(); box.classList.remove("border-brand-400", "bg-brand-50"); }));
    box.addEventListener("drop", (e) => pick(e.dataTransfer.files));
    if (form) form.addEventListener("submit", (e) => { if (active > 0) e.preventDefault(); });
    if (attachUrl) window.addEventListener("beforeunload", (e) => { if (active > 0) { e.preventDefault(); e.returnValue = ""; } });
  });

  // ─── Видео с комментариями по таймкодам ─────────────────────────────
  $$("[data-video-review]").forEach((box) => {
    const video = $("video", box);
    const listEl = $("[data-comment-list]", box);
    box.addEventListener("click", async (e) => {
      const seek = e.target.closest("[data-seek]");
      if (seek) { video.currentTime = parseFloat(seek.dataset.seek); video.play(); }
      const del = e.target.closest("[data-delete-comment]");
      if (del) { try { await api(del.dataset.deleteComment, { method: "DELETE" }); del.closest("li").remove(); } catch (err) { alert(err.message); } }
    });
    const form = $("[data-comment-form]", box);
    if (!form) return;
    const timeBtn = $("[data-current-time]", form);
    video.addEventListener("timeupdate", () => (timeBtn.textContent = fmtTime(video.currentTime)));
    timeBtn.addEventListener("click", () => video.pause());
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = $("input[name=text]", form);
      const seconds = video.currentTime;
      try {
        const c = await api(box.dataset.commentsUrl, { json: { text: input.value, seconds } });
        const li = document.createElement("li");
        li.className = "flex items-start gap-2 text-sm";
        li.innerHTML = `<button type="button" class="font-mono text-xs px-1.5 py-0.5 rounded bg-brand-100 text-brand-800" data-seek="${c.seconds}">${fmtTime(c.seconds)}</button><span class="flex-1">${esc(c.text)} <span class="text-xs text-slate-400">· ${esc(c.author)}</span></span><button type="button" class="text-slate-400 hover:text-rose-600" data-delete-comment="/api/comments/${c.id}">✕</button>`;
        const items = $$("li[data-comment-id], li:not([data-no-comments])", listEl);
        const after = items.find((x) => parseFloat(($("[data-seek]", x) || {}).dataset?.seek || 0) > c.seconds);
        listEl.insertBefore(li, after || null);
        input.value = "";
      } catch (err) { alert(err.message); }
    });
  });

  // ─── ИИ-помощник урока ──────────────────────────────────────────────
  $$("[data-ai-chat]").forEach((box) => {
    const T = window.I18N_AI || {};
    const log = $("[data-ai-log]", box), form = $("[data-ai-form]", box), input = $("input", form);
    const bubble = (role, html) => {
      const hint = $("[data-ai-hint]", log); hint && hint.remove();
      const d = document.createElement("div");
      d.className = `ai-msg ai-msg-${role}`;
      d.innerHTML = html;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    };
    log.scrollTop = log.scrollHeight;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      bubble("user", esc(q));
      input.value = ""; input.disabled = true;
      const wait = bubble("assistant", `<span class="text-slate-400">${esc(T.thinking || "...")}</span>`);
      try {
        const r = await api(box.dataset.url, { json: { message: q } });
        wait.innerHTML = esc(r.answer).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
      } catch (err) {
        wait.innerHTML = `<span class="text-rose-600">${esc(err.message || T.failed)}</span>`;
      } finally { input.disabled = false; input.focus(); log.scrollTop = log.scrollHeight; }
    });
  });

  // ─── Посещаемость с офлайн-очередью ─────────────────────────────────
  $$("[data-attendance]").forEach((box) => {
    const T = window.I18N_ATT || {};
    const key = `att:${box.dataset.session}`;
    const banner = $("[data-offline]", box), state = $("[data-sync-state]", box), count = $("[data-present-count]", box);
    const boxes = $$("input[data-enrollment]", box);
    const queue = () => store.get(key, {});
    const recount = () => (count.textContent = boxes.filter((b) => b.checked).length);
    // восстановить несинхронизированные отметки
    Object.entries(queue()).forEach(([id, present]) => { const b = boxes.find((x) => x.dataset.enrollment === id); if (b) b.checked = present; });
    recount();
    let syncing = false;
    const flush = async () => {
      const q = queue();
      const marks = Object.entries(q).map(([enrollment_id, present]) => ({ enrollment_id, present }));
      banner.classList.toggle("hidden", navigator.onLine);
      if (!marks.length || syncing || !navigator.onLine) { if (marks.length) state.textContent = T.queued || ""; return; }
      syncing = true;
      try {
        await api(box.dataset.url, { json: { marks } });
        const now = queue();
        marks.forEach((m) => { if (now[m.enrollment_id] === m.present) delete now[m.enrollment_id]; });
        store.set(key, now);
        state.textContent = T.saved || "OK";
      } catch (e) { state.textContent = T.queued || ""; }
      finally { syncing = false; }
    };
    boxes.forEach((b) => b.addEventListener("change", () => {
      const q = queue(); q[b.dataset.enrollment] = b.checked; store.set(key, q); recount(); flush();
    }));
    const all = $("[data-mark-all]", box);
    all && all.addEventListener("click", () => {
      const q = queue(); boxes.forEach((b) => { b.checked = true; q[b.dataset.enrollment] = true; }); store.set(key, q); recount(); flush();
    });
    window.addEventListener("online", flush);
    window.addEventListener("offline", () => banner.classList.remove("hidden"));
    setInterval(flush, 15000);
    flush();
  });
})();
