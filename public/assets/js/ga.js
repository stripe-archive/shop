// Google Analytics
(function(window, document, undefined) {
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'XXX']);
  _gaq.push(['_setDomainName', 'XXX']);
  _gaq.push(['_trackPageview', document.location.pathname +
    document.location.search + document.location.hash]);

  (function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ?
      'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  })();
})(this, this.document);
