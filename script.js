
// === НАСТРОЙКИ КОНТАКТОВ (ОБЯЗАТЕЛЬНО ПОМЕНЯЙ) ===
const WA_NUMBER = "996505231104";     // формат: 996XXXXXXXXX (без +)
const TG_USERNAME = "erlnbk";        // без @

// ==================================================

const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

// ====== Меню ======
burger?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(isOpen));
});
nav?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  });
});
document.addEventListener("click", (e) => {
  if (!nav?.classList.contains("open")) return;
  const clickInside = nav.contains(e.target) || burger.contains(e.target);
  if (!clickInside) {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
});

// ====== ДАННЫЕ УСЛУГ ======
const SERVICES = [
  { id: "diag_city", name: "Выезд и диагностика по городу Бишкек", price: 500 },
  { id: "diag_out", name: "Выезд и диагностика загород", price: 1000 },
  {
  id: "ssd_128",
  name: "Ускорение ПК / ноутбука с SSD 128 ГБ (Windows + Office включены)",
  price: 2500
},
{
  id: "ssd_256",
  name: "Ускорение ПК / ноутбука с SSD 256 ГБ (Windows + Office включены)",
  price: 3500
},

  { id: "win_full", name: "Установка Windows со всеми драйверами и Office", price: 1300 },
  { id: "office", name: "Установка и активация Office (Word, Excel)", price: 500 },
  { id: "printer", name: "Установка и настройка драйверов принтера", price: 500 },
  { id: "xprinter", name: "Установка и настройка драйверов принтера Xprinter", price: 800 },
  { id: "adobe", name: "Установка программ (например Adobe)", price: 500 },
  { id: "mac_lic", name: "Установка Office и Adobe с лицензией на macOS", price: 800 },
  { id: "paste_pc", name: "Очистка и замена термопасты (ПК)", price: 800 },
  { id: "paste_nb", name: "Очистка и замена термопасты (Ноутбук)", price: 1200 },
  { id: "build_pc", name: "Сборка компьютера с готовыми комплектующими", price: 1000 },
  {
  id: "other",
  name: "Другая проблема (описать вручную)",
  price: 0
}

];

// ====== РЕНДЕР КАЛЬКУЛЯТОРА ======
const serviceList = document.getElementById("serviceList");
const totalEl = document.getElementById("total");
const clearAllBtn = document.getElementById("clearAll");

function renderServices() {
  if (!serviceList) return;
  serviceList.innerHTML = SERVICES.map(s => `
  <label class="sitem">
    <input type="checkbox" value="${s.id}" />
    <span class="sitem__name">
      ${escapeHtml(s.name)}
      ${s.id.startsWith("ssd_") ? '<span class="tag-mini">Выгодно</span>' : ''}
    </span>
    <span class="sitem__price">
  ${s.price > 0 ? `${s.price} сом` : "по договорённости"}
</span>

  </label>
`).join("");


  serviceList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener("change", updateTotal);
  });
}

function getSelectedServices() {
  const checked = Array.from(serviceList.querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => cb.value);

  return SERVICES.filter(s => checked.includes(s.id));
}

function updateTotal() {
  const sum = getSelectedServices().reduce((acc, s) => acc + s.price, 0);
  totalEl.textContent = String(sum);
  return sum;
}

clearAllBtn?.addEventListener("click", () => {
  serviceList.querySelectorAll('input[type="checkbox"]').forEach(cb => (cb.checked = false));
  updateTotal();
});

renderServices();
updateTotal();


// ====== ФОРМА И ОТПРАВКА В МЕССЕНДЖЕРЫ ======
const form = document.getElementById("orderForm");
const statusEl = document.getElementById("orderStatus");
const btnWA = document.getElementById("sendWA");
const btnTG = document.getElementById("sendTG");

function setErr(name, msg) {
  const el = document.querySelector(`[data-err="${name}"]`);
  if (el) el.textContent = msg || "";
}

function normalize(s) {
  return (s || "").toString().trim();
}

function validate(formEl) {
  const data = new FormData(formEl);

  const name = normalize(data.get("name"));
  const phone = normalize(data.get("phone"));
  const address = normalize(data.get("address"));
  const date = normalize(data.get("date"));
  const time = normalize(data.get("time"));

  setErr("name", ""); setErr("phone", ""); setErr("address", "");
  setErr("date", ""); setErr("time", "");

  let ok = true;

  if (name.length < 2) { setErr("name", "Введите имя (минимум 2 символа)."); ok = false; }
  if (!/^[+]?[\d\s()-]{7,}$/.test(phone)) { setErr("phone", "Введите корректный номер телефона."); ok = false; }
  if (address.length < 5) { setErr("address", "Введите адрес (минимум 5 символов)."); ok = false; }
  if (!date) { setErr("date", "Выберите дату."); ok = false; }
  if (!time) { setErr("time", "Выберите время."); ok = false; }

  const selected = getSelectedServices();
  if (selected.length === 0) {
    statusEl.textContent = "Выберите хотя бы одну услугу в калькуляторе.";
    ok = false;
  } else {
    statusEl.textContent = "";
  }

  return { ok, data, selected };
}

function buildMessage(data, selected) {
  const sum = selected.reduce((acc, s) => acc + s.price, 0);

  const lines = [];
  lines.push("Заявка с сайта Proton.kg");
  lines.push("");
  lines.push(`Имя: ${normalize(data.get("name"))}`);
  lines.push(`Телефон: ${normalize(data.get("phone"))}`);
  lines.push(`Адрес: ${normalize(data.get("address"))}`);
  lines.push(`Удобное время: ${normalize(data.get("date"))} ${normalize(data.get("time"))}`);
  lines.push("");
  lines.push("Выбранные услуги:");
  selected.forEach((s, i) => lines.push(`${i + 1}. ${s.name} — ${s.price} сом`));
  lines.push("");
  lines.push(`Итого: ${sum} сом`);

  const comment = normalize(data.get("comment"));
  if (comment) {
    lines.push("");
    lines.push(`Комментарий: ${comment}`);
  }

  return lines.join("\n");
}

function openWhatsApp(text) {
  // wa.me работает лучше всего на мобильных, на ПК откроет web.whatsapp.com
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function openTelegram(text) {
  // Самый простой вариант: открыть чат @username + вставить текст через share url
  // Если share не поддержит — всё равно откроется телеграм/веб-чат, текст можно вставить вручную.
  const share = `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
  const direct = `https://t.me/${TG_USERNAME}`;
  // Пробуем share, если нет — пользователь всё равно может перейти в чат по direct (кнопкой ниже можно добавить отдельно при желании)
  window.open(share, "_blank", "noopener,noreferrer");
  // запасной вариант: если хочешь вместо share открывать прямой чат — замени на direct
  // window.open(direct, "_blank", "noopener,noreferrer");
}

btnWA?.addEventListener("click", () => {
  const { ok, data, selected } = validate(form);
  if (!ok) return;
  const text = buildMessage(data, selected);
  openWhatsApp(text);
});

btnTG?.addEventListener("click", () => {
  const { ok, data, selected } = validate(form);
  if (!ok) return;
  const text = buildMessage(data, selected);
  openTelegram(text);
});

// Вспомогательное (чтобы не ломать HTML в списке)
function escapeHtml(str) {
  return (str || "").toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ====== New Year Snow (lightweight) ======
(() => {
  const canvas = document.getElementById("snow");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w, h, flakes;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) return;

  function resize() {
    w = canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
    h = canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    const count = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 2.2 + 0.7) * devicePixelRatio,
      vx: (Math.random() * 0.6 - 0.3) * devicePixelRatio,
      vy: (Math.random() * 1.2 + 0.6) * devicePixelRatio,
      a: Math.random() * 0.6 + 0.25,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.x += f.vx;
      f.y += f.vy;

      if (f.y > h + 10) { f.y = -10; f.x = Math.random() * w; }
      if (f.x > w + 10) f.x = -10;
      if (f.x < -10) f.x = w + 10;

      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  resize();
  tick();
  window.addEventListener("resize", resize, { passive: true });
})();
// === Auto disable Santa hat after Jan 7 ===
(() => {
  const hat = document.querySelector(".santa-hat");
  if (!hat) return;

  const now = new Date();
  const year = now.getFullYear();

  // Праздничный период: 1 декабря — 7 января
  const start = new Date(year, 11, 1);   // 1 Dec
  const end = new Date(year + 1, 0, 7);  // 7 Jan

  const isHoliday =
    (now >= start && now <= end) ||
    (now.getMonth() === 0 && now.getDate() <= 7);

  if (!isHoliday) {
    hat.style.display = "none";
  }
})();
// === Online / Offline status (Asia/Bishkek) ===
(() => {
  const el = document.getElementById("onlineStatus");
  if (!el) return;

  const TZ = "Asia/Bishkek";
  const START_H = 9;   // 09:00
  const END_H = 21;    // 21:00

  function getBishkekHour() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "2-digit",
      hour12: false
    }).formatToParts(new Date());
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
    return hour;
  }

  function tick() {
    const h = getBishkekHour();
    const online = h >= START_H && h < END_H;

    el.classList.remove("on", "off");
    if (online) {
      el.classList.add("on");
      el.textContent = `🟢 Принимаем (${START_H}:00–${END_H}:00)`;
    } else {
      el.classList.add("off");
      el.textContent = `🟠 Закрыто (${START_H}:00–${END_H}:00)`;
    }
  }

  tick();
  setInterval(tick, 60_000);
})();
// === Quick scenarios (index.html calculator) ===
// === Other problem logic ===
(() => {
  const list = document.getElementById("serviceList");
  const form = document.getElementById("orderForm");
  if (!list || !form) return;

  const comment = form.querySelector('textarea[name="comment"]');
  if (!comment) return;

  list.addEventListener("change", (e) => {
    const cb = e.target;
    if (cb.type !== "checkbox") return;

    if (cb.value === "other" && cb.checked) {
      comment.focus();
      if (!comment.value.trim()) {
        comment.value =
          "Другая проблема:\n" +
          "— устройство (ПК / ноутбук / принтер):\n" +
          "— что не работает:\n";
      }
    }
  });
})();

(() => {
  const wrap = document.querySelector(".quick__btns");
  const form = document.getElementById("orderForm");
  if (!wrap || !serviceList || !form) return;

  function setChecked(ids) {
    const set = new Set(ids);
    serviceList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = set.has(cb.value);
    });
    updateTotal();
  }

  function appendToComment(text) {
    const ta = form.querySelector('textarea[name="comment"]');
    if (!ta) return;
    const cur = (ta.value || "").trim();
    ta.value = cur ? (cur + "\n" + text) : text;
  }

  function scrollToForm() {
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-quick]");
    if (!btn) return;
    const t = btn.getAttribute("data-quick");

    if (t === "slow") {
      // НЕ выбираем сразу 128/256 — просто подводим к SSD и просим уточнить.
      setChecked([]); // очистим
      appendToComment("Симптом: компьютер/ноутбук тормозит. Хочу ускорение. (Уточните: ПК или ноутбук? SSD 128 или 256?)");
      // подсказка: прокрутка к списку услуг
      document.getElementById("serviceList")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (t === "printer") {
      setChecked(["printer"]); // если Xprinter — клиент уточнит, мы пометим
      appendToComment("Принтер: не печатает / нужен драйвер. (Если Xprinter — напишите модель).");
      scrollToForm();
      return;
    }

    if (t === "programs") {
      setChecked(["office"]); // базовый вариант
      appendToComment("Нужно установить программы. (Какие именно: Office/Adobe/другое? Windows нужна или нет?)");
      scrollToForm();
      return;
    }

    if (t === "remote") {
      window.location.href = "remote.html";
    }
    if (cb.value === "other" && cb.checked) {
  // ОЧИЩАЕМ все автотексты
  comment.value =
    "Другая проблема:\n" +
    "— устройство (ПК / ноутбук / принтер):\n" +
    "— что не работает:\n";

  comment.focus();

  // Снимаем галочки с остальных услуг
  list.querySelectorAll('input[type="checkbox"]').forEach(x => {
    if (x.value !== "other") x.checked = false;
  });

  if (typeof updateTotal === "function") updateTotal();
}

  });
})();
// === Reviews (localStorage MVP) ===
(() => {
  const form = document.getElementById("reviewForm");
  const list = document.getElementById("reviewsList");
  const starsWrap = document.getElementById("stars");
  const status = document.getElementById("reviewStatus");
  if (!form || !list || !starsWrap) return;

  let rating = 0;
  const LS_KEY = "proton_reviews";

  // Звёзды
  starsWrap.addEventListener("click", (e) => {
    const s = e.target.closest("span");
    if (!s) return;
    rating = Number(s.dataset.v);
    starsWrap.querySelectorAll("span").forEach(st => {
      st.classList.toggle("active", Number(st.dataset.v) <= rating);
    });
  });

  function load(){
    const data = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    list.innerHTML = "";
    data.slice().reverse().forEach(addToDOM);
  }

  function addToDOM(r){
    const div = document.createElement("div");
    div.className = "review";
    div.innerHTML = `
      <div class="review__head">
        <span class="review__name">${escapeHtml(r.name)}</span>
        <span class="review__stars">${"★".repeat(r.rating)}</span>
      </div>
      <div class="review__text">${escapeHtml(r.text)}</div>
    `;
    list.appendChild(div);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get("name").trim();
    const text = fd.get("text").trim();

    if (!name || !text || rating === 0){
      status.textContent = "Заполните все поля и выберите оценку.";
      return;
    }

    const review = { name, text, rating, t: Date.now() };
    const arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    arr.push(review);
    localStorage.setItem(LS_KEY, JSON.stringify(arr));

    form.reset();
    rating = 0;
    starsWrap.querySelectorAll("span").forEach(s => s.classList.remove("active"));
    status.textContent = "Спасибо за отзыв!";

    load();
  });

  load();
})();
