
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
}
  
  