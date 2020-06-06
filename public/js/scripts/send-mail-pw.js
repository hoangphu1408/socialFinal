$(document).ready(function () {
  $("form").submit(function (event) {
    var timeleft = 61;
    event.preventDefault();
    var email = document.getElementById("email").value;
    $.post("/admin/send-mail-pw", { email: email }, function (data) {
      var submit = document.getElementById("submit");
      submit.disabled = true;
      var downloadTimer = setInterval(function () {
        timeleft--;
        document.getElementById("submit").value = timeleft;
        if (timeleft <= 0) {
          clearInterval(downloadTimer);
          document.getElementById("submit").value = "Submit";
          submit.disabled = false;
        }
      }, 1000);
    });
  });
});
