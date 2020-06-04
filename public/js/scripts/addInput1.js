$(document).ready(function () {
  $(".add-more1").click(function () {
    var htmls = $(".copy1").html();
    $(".after-add-more1").after(htmls);
  });

  $("body").on("click", ".remove1", function () {
    $(this).parents(".control-group1").remove();
  });
});
