// ============================================================
//  analytics.js — 방문 집계 (GoatCounter 이미지 픽셀 방식)
//  - 외부 스크립트를 받아 실행하지 않는다. 이 파일(우리 저장소)만 실행되며, 이미지 요청 하나로 "페이지 열림"을 알린다.
//  - 쿠키 없음. 실제 사이트 주소(HOST)에서 열렸을 때만 동작하고, 로컬 파일·검증용 렌더링은 세지 않는다.
//  - 내 기기 제외: 사이트 주소 뒤에 #notrack 을 붙여 한 번 열면 그 브라우저는 집계에서 빠진다.
//  - CODE 가 비어 있으면 아무것도 하지 않는다. (GoatCounter 가입 후 사이트 코드를 넣는다)
// ============================================================
(function () {
  var CODE = "";                          // ← GoatCounter 사이트 코드 (예: "reddevilshub")
  var HOST = "javasubin.github.io";       // 실제 서비스 주소. 도메인을 바꾸면 여기만 수정
  if (!CODE) return;
  if (location.hostname !== HOST) return;
  try {
    if (location.hash === "#notrack") { localStorage.setItem("gcSkip", "1"); }
    if (location.hash === "#track") { localStorage.removeItem("gcSkip"); }
    if (localStorage.getItem("gcSkip") === "1") return;
  } catch (e) {}
  var send = function () {
    var img = new Image();
    img.src = "https://" + CODE + ".goatcounter.com/count?p=" + encodeURIComponent(location.pathname + location.search)
            + "&t=" + encodeURIComponent(document.title) + "&r=" + encodeURIComponent(document.referrer);
    img.width = 1; img.height = 1; img.alt = ""; img.style.position = "absolute"; img.style.left = "-9999px";
    (document.body || document.documentElement).appendChild(img);
  };
  if (document.body) send(); else document.addEventListener("DOMContentLoaded", send);
})();
