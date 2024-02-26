
(function ($) {
  "use strict";
})(jQuery);
function showhides() {
  const x = document.getElementById("simplyin_api_key");
  if (x.type === "password") {
    x.type = "text";
    jQuery(".show-pass").hide();
    jQuery(".hide-pass").show();
  } else {
    jQuery(".show-pass").show();
    jQuery(".hide-pass").hide();
    x.type = "password";
  }
  const y = document.getElementById("simply-inpost-geowidget");
  if (y.type === "password") {
    y.type = "text";
    jQuery(".show-pass").hide();
    jQuery(".hide-pass").show();
  } else {
    jQuery(".show-pass").show();
    jQuery(".hide-pass").hide();
    y.type = "password";
  }
}
  
  