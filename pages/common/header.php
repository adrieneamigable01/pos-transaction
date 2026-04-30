<?php
date_default_timezone_set('Asia/Manila');
?>
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">

  <title>Sales</title>
  <link rel="icon" href="'../assets/img/ico.png'" type="image/png">
  <!-- Custom fonts for this template-->
  <link href="../vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

  <!-- Custom styles for this template-->
  <link href="../assets/css/sb-admin-2.min.css" rel="stylesheet">
  <link href="../assets/css/dashboard.css" rel="stylesheet">
  <link href="../assets/css/loader.css" rel="stylesheet">
  <link href="../assets/css/pos.css" rel="stylesheet">
  <link href="../vendor/datatables/dataTables.bootstrap4.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/css/select2.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <style>
      /* Ensure SweetAlert2 input field fits within modal */
      .swal2-popup {
        max-width: 90vw; /* Adjust as needed for modal width */
      }
      
      .swal2-input {
        box-sizing: border-box; /* Include padding and border in the element's total width */
        width: 100%; /* Make sure input takes full width */
      }
      @media screen and (min-width: 1200px) {
          body {
              margin: 0rem 0 0 0 !important;
          }
      }
      body {
          margin: 0rem 0 0 0 m !important;
      }
  </style>
</head>

<body id="page-top">
<div class="loading">Loading&#8230;</div>
  <!-- Page Wrapper -->
  <div id="wrapper">
  <?php include 'common/topbar.php' ?> 