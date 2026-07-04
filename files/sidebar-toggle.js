// Hamburger (far left) toggles a left-hand navigation panel rendered on top of
// the page, no full-screen takeover. Search stays native, on the far right.
(function () {
  function icon(p) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + "</svg>";
  }
  var HAM = icon('<path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>');

  function setOpen(o) {
    document.body.classList.toggle("nav-open", o);
    // On mobile the panel is full-screen, so lock the page behind it so it can't
    // scroll or peek through the edges.
    var lock = o && window.innerWidth < 960;
    document.documentElement.style.overflow = lock ? "hidden" : "";
    try {
      localStorage.setItem("md-nav-open", o ? "1" : "0");
    } catch (e) {}
  }

  function link(srcAnchor, cls) {
    var a = document.createElement("a");
    a.href = srcAnchor.getAttribute("href") || ".";
    a.textContent = (srcAnchor.textContent || "").trim();
    if (cls) a.className = cls;
    if (srcAnchor.classList.contains("md-nav__link--active")) {
      a.classList.add("md-np__current");
    }
    return a;
  }

  function buildPanel() {
    var panel = document.createElement("nav");
    panel.id = "md-navpanel";
    panel.setAttribute("aria-label", "Navigation");
    var inner = document.createElement("div");
    inner.className = "md-np__inner";
    panel.appendChild(inner);

    var srcNav = document.querySelector(".md-sidebar--primary .md-nav--primary");
    if (srcNav) {
      srcNav
        .querySelectorAll(":scope > .md-nav__list > .md-nav__item")
        .forEach(function (item) {
          var direct = item.querySelector(":scope > a.md-nav__link");
          if (direct) {
            inner.appendChild(link(direct, "md-np__page"));
            return;
          }
          var labelEl = item.querySelector(
            ":scope > .md-nav__link, :scope > label"
          );
          var sec = document.createElement("div");
          sec.className = "md-np__group";
          var h = document.createElement("div");
          h.className = "md-np__title";
          h.textContent = labelEl ? labelEl.textContent.trim() : "";
          sec.appendChild(h);
          // Direct page links only, not the active sub-page's embedded TOC.
          item
            .querySelectorAll(
              ":scope > nav > .md-nav__list > .md-nav__item > a.md-nav__link"
            )
            .forEach(function (lnk) {
              var href = lnk.getAttribute("href") || "";
              if (href.charAt(0) === "#") return;
              sec.appendChild(link(lnk));
            });
          inner.appendChild(sec);
        });
    }
    document.body.appendChild(panel);
  }

  function init() {
    var header = document.querySelector(".md-header__inner");
    if (!header || document.getElementById("md-hamburger")) return;

    var btn = document.createElement("button");
    btn.id = "md-hamburger";
    btn.type = "button";
    btn.className = "md-hamburger";
    btn.title = "Menu";
    btn.setAttribute("aria-label", "Menu");
    btn.innerHTML = HAM;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!document.body.classList.contains("nav-open"));
    });
    header.insertBefore(btn, header.firstChild); // far left

    // Blog name, bold, just after the hamburger.
    var brandLogo = document.querySelector(".md-header__button.md-logo");
    var brand = document.createElement("a");
    brand.className = "md-blogname";
    brand.href = brandLogo ? brandLogo.getAttribute("href") : ".";
    brand.textContent = "Why Not?";
    header.insertBefore(brand, btn.nextSibling);

    // Mark the home page so its auto-injected title heading can be hidden.
    if (location.pathname === "/" || /\/index\.html?$/.test(location.pathname)) {
      document.body.classList.add("md-home");
    }

    buildPanel();

    // On desktop, make the magnifier reliably focus the search input on click
    // (which expands it). Additive only; Material's native handling is intact.
    var sIcon = document.querySelector(".md-search__form .md-search__icon");
    var sInput = document.querySelector(".md-search__input");
    if (sIcon && sInput) {
      sIcon.addEventListener("click", function () {
        if (window.innerWidth >= 960) {
          setTimeout(function () {
            sInput.focus();
          }, 0);
        }
      });
    }

    // Restore persisted state on desktop: the side panel stays open across
    // navigation/refresh. On mobile it starts closed so the full-screen panel
    // never traps the page content.
    try {
      if (
        localStorage.getItem("md-nav-open") === "1" &&
        window.innerWidth >= 960
      ) {
        document.body.classList.add("nav-open");
      }
    } catch (e) {}

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
