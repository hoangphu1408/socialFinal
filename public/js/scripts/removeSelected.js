/* store options */
var $selects = $(".number");
var $opts = $selects.first().children().clone();

$selects.change(function () {
  /*create array of all selected values*/
  var selectedValues = $selects
    .map(function () {
      var val = $(this).val();
      return val != 0 ? val : null;
    })
    .get();

  $selects.not(this).each(function () {
    var $sel = $(this),
      myVal = $sel.val() || 0;
    var $options = $opts.clone().filter(function (i) {
      var val = $(this).val();
      return val == myVal || $.inArray(val, selectedValues) == -1;
    });
    $sel.html($options).val(myVal);
  });
});
