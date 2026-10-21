(function () {
  "use strict";
  document.querySelectorAll(".video-frame[data-video-id]").forEach(function (frame) {
    var button = frame.querySelector(".video-load");
    if (!button) return;
    function loadPlayer() {
      if (frame.getAttribute("data-video-loaded") === "true") return;
      var id = frame.getAttribute("data-video-id");
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
      var player = document.createElement("iframe");
      player.title = frame.getAttribute("data-video-title") || "YouTube video player";
      player.width = "1920";
      player.height = "1080";
      player.allow = "encrypted-media; picture-in-picture; fullscreen";
      player.allowFullscreen = true;
      player.referrerPolicy = "strict-origin-when-cross-origin";
      player.src = "https://www.youtube-nocookie.com/embed/" + id + "?playsinline=1&autoplay=0";
      frame.replaceChildren(player);
      frame.setAttribute("data-video-loaded", "true");
    }
    button.addEventListener("click", loadPlayer, { once: true });
  });
})();
