
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
    #preview {
        display: none;
        width: 50%;
        height: auto;
        margin-top: 10px;
    }
    #update-preview {
        display: none;
        width: 50%;
        height: auto;
        margin-top: 10px;
    }
</style>
<div class="container-fluid">

    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Customers</h1>
        <div class="row">
            <div class="input-group mb-3 col-12">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="inputGroup-sizing-default">Store</span>
                </div>
                <select type="text" class="form-control store-type-menu-filter" id="storeFilter" name="storeFilter" aria-describedby="store"></select>
            </div>
            <div class="col-12">
                <button class="btn btn-primary float-right" data-toggle="modal" id="customer-button"> 
                    <i class="fa fa-plus"> Customers</i>
                </button>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="table-responsive">
                <table class="table table-bordered text-center" id="customers-table" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Email</th>
                            <th>Contact #</th>
                            <th>Date Added</th>
                            <th>-</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="customerFormModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Customer</h5>
          <button class="close" type="button" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">
            <form class="user" id="frm-customer">
                <div class="row">
                    <div class="form-group col">
                        <label for="firstname">Firstname</label>
                        <input type="text" class="form-control form-control-user" id="firstname" name="firstname" aria-describedby="firstname" placeholder="Firstname">
                    </div>
                    <div class="form-group col">
                        <label for="middlename">Middlename</label>
                        <input type="text" class="form-control form-control-user" id="middlename" name="middlename" aria-describedby="middlename" placeholder="Middlename">
                    </div>
                    <div class="form-group col">
                        <label for="lastname">Lastname</label>
                        <input type="text" class="form-control form-control-user" id="lastname" name="lastname" aria-describedby="lastname" placeholder="Lastname">
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col">
                        <label for="email">Email</label>
                        <input type="email" class="form-control form-control-user" id="email" name="email" aria-describedby="email" placeholder="Email">
                    </div>
                    <div class="form-group col">
                        <label for="mobile">Mobile</label>
                        <input type="text" class="form-control form-control-user" id="mobile" name="mobile" aria-describedby="mobile" placeholder="Mobile #">
                    </div>
                    <div class="form-group col-12">
                        <label for="address">Address</label>
                        <textarea type="text" class="form-control form-control-user" id="address" name="address" aria-describedby="address"></textarea>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-user btn-block col-3 float-right">
                    Submit
                </button>
            </form>
        </div>
      </div>
    </div>
</div>
<!-- /.container-fluid -->

<script src="../vendor/jquery/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/js/select2.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js"></script> 
  
  <script src="../assets/js/constant.js"></script>
  <script src="../vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

  <!-- Core plugin JavaScript-->
  <script src="../vendor/jquery-easing/jquery.easing.min.js"></script>

  <!-- Custom scripts for all pages-->
  <script src="../assets/js/sb-admin-2.min.js"></script>
  <script src="../assets/js/jquery-validate.js"></script>
  <script src="../assets/js/sweetalert2@7.26.11.js"></script>
  <script src="../assets/js/js-addon.js"></script>

 
  <script src="../assets/js/api_constant.js"></script>
  <script src="../assets/js/dashboard.js"></script>

  <!-- Page level plugins -->
  <script src="../assets/../vendor/chart.js/Chart.min.js"></script>

  <!-- Page level custom scripts -->
  <script src="../assets/js/demo/chart-area-demo.js"></script>
  <script src="../assets/js/demo/chart-pie-demo.js"></script>

    <!-- Page level plugins -->
  <script src="../vendor/datatables/jquery.dataTables.min.js"></script>
  <script src="../vendor/datatables/dataTables.bootstrap4.min.js"></script>

  <!-- Page level custom scripts -->
  <script src="../assets/js/demo/datatables-demo.js"></script>
  <script src="../assets/js/customers.js"></script>
