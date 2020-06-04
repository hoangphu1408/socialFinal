/* store options */
var $selectss = $(".numberEdit");
var $optss = $selectss.first().children().clone();

$selectss.change(function () {
  /*create array of all selected values*/
  var selectedValuess = $selectss
    .map(function () {
      var vals = $(this).val();
      return vals != 0 ? vals : null;
    })
    .get();

  $selectss.not(this).each(function () {
    var $sels = $(this),
      myVals = $sels.val() || 0;
    var $optionss = $optss.clone().filter(function (i) {
      var vals = $(this).val();
      return vals == myVals || $.inArray(vals, selectedValuess) == -1;
    });
    $sels.html($optionss).val(myVals);
  });
});
