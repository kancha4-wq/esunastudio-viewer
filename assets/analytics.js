(function () {
  "use strict";
  if (location.hostname !== "esunastudio-viewer.pages.dev") return;

  var MEASUREMENT_ID = "G-BPNR6MTZP3";
  var SITE_ID = "esunastudio-viewer";

  // Opt-in per browser profile; no IP address or personal identifier is stored.
  var INTERNAL_KEY = "byu_ga4_internal_v1";
  var isInternal = false;
  try {
    isInternal = window.localStorage.getItem(INTERNAL_KEY) === "1";
  } catch (_storageError) {
    // Storage restrictions must never stop ordinary Analytics measurement.
  }

  if (location.hash === "#byu-traffic-settings") {
    var panel = document.createElement("section");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "byu-traffic-title");
    panel.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#fff;color:#23262b;padding:40px 24px;overflow:auto;font:16px/1.8 system-ui,sans-serif";
    panel.innerHTML = '<div style="max-width:640px;margin:auto"><h1 id="byu-traffic-title">このブラウザの確認用アクセス</h1>' +
      '<p>この端末の、このChromeプロファイルだけを確認用として識別します。共有ブラウザでは設定しないでください。</p>' +
      '<p>設定すると、書籍HPの通常のアクセス情報に「内部確認」の区分を付けてGoogle Analyticsへ送ります。IPアドレスの登録は行いません。</p>' +
      '<p>GA4のInternal Trafficフィルタはテスト状態です。設定だけではデータは削除・除外されません。</p>' +
      '<p id="byu-traffic-status" role="status" aria-live="polite"></p>' +
      '<p><button id="byu-traffic-enable" type="button">このブラウザを確認用に設定</button></p>' +
      '<p><button id="byu-traffic-disable" type="button">確認用の設定を解除</button></p>' +
      '<p><a href="/viewer/">紹介ページへ戻る</a></p>' +
      '<p>サイトデータを消すと設定は解除されます。別端末・別プロファイルには引き継がれません。この設定画面は計測しません。</p></div>';
    document.body.appendChild(panel);
    var status = panel.querySelector("#byu-traffic-status");
    function showStatus() {
      try {
        var enabled = window.localStorage.getItem(INTERNAL_KEY) === "1";
        status.textContent = enabled ? "現在：確認用に設定済み（内部確認として送信）" : "現在：未設定（通常の計測）";
      } catch (_readError) {
        status.textContent = "ブラウザの保存領域を利用できません。設定は保存できず、通常の計測になります。";
      }
    }
    panel.querySelector("#byu-traffic-enable").addEventListener("click", function () {
      try { window.localStorage.setItem(INTERNAL_KEY, "1"); showStatus(); }
      catch (_writeError) { status.textContent = "設定を保存できませんでした。通常の計測になります。"; }
    });
    panel.querySelector("#byu-traffic-disable").addEventListener("click", function () {
      try { window.localStorage.removeItem(INTERNAL_KEY); showStatus(); }
      catch (_removeError) { status.textContent = "解除できませんでした。ブラウザのサイトデータ設定を確認してください。"; }
    });
    showStatus();
    return;
  }

  document.documentElement.setAttribute("data-byu-ga4-traffic-type", isInternal ? "internal" : "regular");

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  var config = {
    send_page_view: true,
    site_id: SITE_ID,
    site_name: "ビュッ",
    site_host: window.location.hostname,
    page_type: "viewer_landing"
  };
  if (isInternal) config.traffic_type = "internal";
  window.gtag("config", MEASUREMENT_ID, config);

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(script);

  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim().slice(0, 100);
  }

  document.addEventListener("click", function (event) {
    var target = event.target.closest("[data-analytics-event]");
    if (!target) return;

    var href = target.getAttribute("href") || "";
    var destination;
    try {
      destination = href ? new URL(href, window.location.href) : null;
    } catch (_error) {
      destination = null;
    }

    var eventParams = {
      site_id: SITE_ID,
      site_host: window.location.hostname,
      page_type: "viewer_landing",
      link_id: target.dataset.analyticsLink || "",
      link_area: target.dataset.analyticsArea || "",
      link_text: cleanText(target.textContent),
      selected_tab: target.dataset.analyticsTab || "",
      link_domain: destination ? destination.hostname : "",
      destination_path: destination ? destination.pathname : "",
      page_path: window.location.pathname,
      transport_type: "beacon"
    };
    if (isInternal) eventParams.traffic_type = "internal";
    window.gtag("event", target.dataset.analyticsEvent, eventParams);
  });

  window.VIEWER_GA4_MEASUREMENT_ID = MEASUREMENT_ID;
})();
