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

  function apply(theme, broadcast) {
    paint(theme);
    try { localStorage.setItem(KEY, theme); } catch (_) {}
    if (broadcast && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "ai-fluency-theme", theme: theme }, "*");
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

  apply(readStored() || fallback(), false);

  window.addEventListener("message", function (e) {
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
