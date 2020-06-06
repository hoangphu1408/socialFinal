$(document).ready(function () {
  $(".form1").submit(function (event) {
    var timeleft = 61;
    event.preventDefault();
    var email = document.getElementById("email").value;
    $.post("/send-mail", { email: email }, function (data) {
      var submit = document.getElementById("submit1");
      submit.disabled = true;
      var downloadTimer = setInterval(function () {
        timeleft--;
        document.getElementById("submit1").value = timeleft;
        if (timeleft <= 0) {
          clearInterval(downloadTimer);
          document.getElementById("submit1").value = "Submit";
          submit.disabled = false;
        }
      }, 1000);
    });
  });
});
