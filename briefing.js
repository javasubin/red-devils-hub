/* ============================================================
   RED DEVILS HUB — 브리핑 공통 스크립트
   카테고리 칩으로 section[data-cat] 을 필터링한다. 그게 전부다.
   briefings/*.html 이 <script src="../briefing.js" defer></script> 로 읽는다.
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('section[data-cat]'));
    if (!chips.length || !sections.length) return;

    function select(chip) {
      var cat = chip.getAttribute('data-cat');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      sections.forEach(function (s) {
        s.classList.toggle('hidden', cat !== 'all' && s.getAttribute('data-cat') !== cat);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { select(chip); });
    });
  });
})();
