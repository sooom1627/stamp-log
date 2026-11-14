// Shows one language at a time. The choice is kept in the URL (?lang=ja) so a
// shared link opens in the same language; otherwise the browser language wins.
const supported = ["en", "ja"];
const fromUrl = new URLSearchParams(location.search).get("lang");
const fromBrowser = navigator.language.startsWith("ja") ? "ja" : "en";
const initial = supported.includes(fromUrl) ? fromUrl : fromBrowser;

function setLang(lang) {
  document.documentElement.lang = lang;
  for (const button of document.querySelectorAll("[data-lang]")) {
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  }
  for (const link of document.querySelectorAll("a[data-keep-lang]")) {
    const url = new URL(link.href);
    url.searchParams.set("lang", lang);
    link.href = url.pathname + url.search;
  }
}

for (const button of document.querySelectorAll("[data-lang]")) {
  button.addEventListener("click", () => {
    const lang = button.dataset.lang;
    setLang(lang);
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(null, "", url);
  });
}

setLang(initial);
