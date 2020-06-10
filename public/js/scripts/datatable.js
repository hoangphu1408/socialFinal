$(document).ready(function () {
  $("#dataTable").DataTable();
  $("#dataTableHidden").DataTable({
    columnDefs: [
      {
        targets: [1],
        visible: false,
        searchable: true,
      },
    ],
  });
});
