(function () {
  const KEY = "ai-fluency-theme";

  function readStored() {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "light" || v === "dark") return v;
    } catch (_) {}
    return null;
  }

  function fallback() {
    return document.documentElement.getAttribute("data-theme-default") || "light";
  }

  function paint(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = theme === "dark" ? "淺色" : "深色";
  }

  // persist=false：只上色，不落地。用於初次載入套用 data-theme-default，
  // 否則封面的 dark 會被寫進 localStorage，把後面所有淺色內頁一起染深。
  function apply(theme, broadcast, persist) {
    paint(theme);
    if (persist !== false) {
      try { localStorage.setItem(KEY, theme); } catch (_) {}
    }
    if (broadcast && window.parent && window.parent !== window) {
      var target = (location.origin && location.origin !== "null") ? location.origin : "*";
      window.parent.postMessage({ type: "ai-fluency-theme", theme: theme }, target);
    }
  }

  window.AIFluencyTheme = {
    apply: function (theme) { apply(theme, true); },
    toggle: function () {
      const next = (document.documentElement.getAttribute("data-theme") === "dark") ? "light" : "dark";
      apply(next, true);
    },
    current: function () {
      return document.documentElement.getAttribute("data-theme") || fallback();
    }
  };

  var stored = readStored();
  if (stored) {
    apply(stored, false);          // 使用者明確選過 → 沿用
  } else {
    paint(fallback());             // 沒選過 → 用本頁的 data-theme-default，不落地
  }

  window.addEventListener("message", function (e) {
    if (location.origin && location.origin !== "null" && e.origin !== location.origin) return;
    if (!e.data || e.data.type !== "ai-fluency-theme") return;
    if (e.data.theme !== "light" && e.data.theme !== "dark") return;
    apply(e.data.theme, false);
  });

  window.addEventListener("storage", function (e) {
    if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark")) {
      paint(e.newValue);
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "themeToggle") {
      window.AIFluencyTheme.toggle();
    }
  });
})();
