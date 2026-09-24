(function () {
  "use strict";

  var MEASUREMENT_ID = "G-BPNR6MTZP3";
  var SITE_ID = "esunastudio-viewer";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    send_page_view: true,
    site_id: SITE_ID,
    site_name: "同人書籍ビューア",
    site_host: window.location.hostname,
    page_type: "viewer_landing"
  });

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

    window.gtag("event", target.dataset.analyticsEvent, {
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
    });
  });

  window.VIEWER_GA4_MEASUREMENT_ID = MEASUREMENT_ID;
})();
