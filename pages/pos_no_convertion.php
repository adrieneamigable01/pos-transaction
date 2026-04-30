<?php include 'common/header.php' ?> 

<style>
    .hidden{
        display:none;
    }
    .no-gutters {
    margin-right: 0;
    margin-left: 0;
    }
    .no-gutters .col,
    .no-gutters [class*='col-'] {
    padding-right: 0;
    padding-left: 0;
    }
    .select2-container .select2-selection--single {
        height: 38px;
    }
    .select2-container--default .select2-selection--single {
        background-color: #fff;
        border: 1px solid #aaa;
        border-radius: unset;
    }

    #customerModal > .modal-dialog {
        max-width: 100%; /* Full width */
        margin: 0; /* Remove default margin */
    }
    #customerModal > .modal-content {
        border-radius: 0; /* Optional: Remove border radius */
        height: 100%; /* Full height */
        display: flex;
        flex-direction: column; /* Allow content to stack vertically */
    }
    iframe {
        height: 70vh; /* Full height */
    }
    #customerModal > .modal-header, .modal-body, .modal-footer {
        padding: 1rem; /* Adjust padding as needed */
    }
    .select2-container--default .select2-dropdown {
        z-index: 5051; /* Adjust this value as needed */
    }
</style>
<!-- Begin Page Content -->
<div class="container-fluid">
   <!-- Page Heading -->
   <div class="d-sm-flex align-items-center justify-content-between mb-4">
      <h1 class="h3 mb-0 text-gray-800 col-12">
            Order 
            <button class="btn btn-outline-info float-right" data-toggle="modal" data-target="#transaction-history" id="v-transaction"><i class="fa fa-list"></i> Transactions List</button>
      </h1>
   </div>


   <div class="modal fade" id="searchProducts" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Search Product</h5>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div class="modal-body">
                    <div class="input-group mb-3 float-right col-6">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon3">Search</span>
                        </div>
                        <input type="text" class="form-control" id="product-search" aria-describedby="basic-addon3">
                    </div>
                    <div class="col-12 text-center" id="menu-loading" style="max-height: 400px;overflow-y:auto;">
                        <i class="fa fa-spinner fa-spin"></i> Please wait ... 
                    </div>
                    <div class="col-12 hidden" style="max-height: 400px;overflow-y:auto;">
                        <table class="table table-bordered" id="convertion-product-container">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Code</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Unit</th>
                                    <th>In Stack</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Done</button>
                </div>

            </div>
        </div>
    </div>

   <div class="row">
        <div class="col-8">
            <div class="card">
                <div class="card-header bg-default" id="transaction-header">
                   Transaction
                </div>
                <div class="card-body" style="height:400px;overflow:auto"> 
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                                <th>Total</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody id="selected-menu-list"></tbody>
                    </table>
                </div>
                <div class="card-footer text-muted">
                   
                    <div class="row no-gutters">
                        <div class="col-6">
                           
                        </div>
                        <div class="col-6">
                            <div class="row no-gutters" id="draft-transaction-container"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-4">
            <div class="card">
                <div class="card-header bg-default" id="transaction-header">
                   -
                </div>
                <div class="card-body" style="overflow:auto"> 
                    <div class="row">
                        <div class="col-12 lead mb-3">
                            <div class="text-left mb-2">
                                Subtotal: <span id="subtotal" class="float-right">0.00</span>
                            </div>
                            <div class="text-left mb-2">
                                Discount %:  <span class="float-right"> (<span class="text-danger" id="discount">0.00</span>) </span>
                            </div>
                            <div class="text-left mb-2">
                                Discount amount:  <span class="float-right">(<span class="text-danger" id="discount-amount">0.00</span>)</span>
                            </div>
                            <div class="text-left mb-2 hidden">
                                Delivery Fee: <span id="total" class="float-right">0.00</span>
                            </div>
                            <div class="text-left mb-2">
                                Total Due: <span id="total" class="float-right">0.00</span>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-12">
                                    <div class="text-left mb-2">
                                        Cash: <span id="cash-label" class="float-right">0.00</span>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 mb-3">
                                    <div class="text-left mb-2">
                                        Change: <span id="change" class="float-right">0.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 lead">
                            <div class="row mb-2" id="transactions-button">
                                <!-- <button class="btn btn-sm btn-outline-danger col-4" id="cancel">
                                    <i class="fa fa-times"></i>    
                                    Cancel
                                </button> -->
                                <!-- <button class="btn btn-sm btn-outline-info col" id="add-delivery-fee">
                                    <i class="fa-solid fa-shipping-fast"></i>    
                                    Deliver
                                </button> -->
                            </div>
                            <div class="row mb-2">
                                <!-- <button class="btn btn-sm btn-outline-danger col-4" id="cancel">
                                    <i class="fa fa-times"></i>    
                                    Cancel
                                </button> -->
                                <button class="btn btn-outline-danger btn-sm col-4" id="add-expenses">
                                    <i class="fas fa-exclamation-circle"></i>    
                                    Add Expenses
                                </button>
                                <button class="btn btn-outline-success btn-sm col-4" id="save-as-draft">
                                    <i class="fa-solid fa-file-alt"></i>    
                                    Save as Draf
                                </button>
                                <button class="btn btn-outline-warning btn-sm col-4" data-toggle="modal" data-target="#addDiscount">
                                    <i class="fa fa-solid fa-tag"></i>    
                                    Discount
                                </button>
                            </div>
                            <div class="row mb-2">
                                <!-- <button class="btn btn-sm btn-outline-info col-4" id="add-note">
                                    <i class="fa fa-book"></i>
                                    Notes
                                </button> -->
                                <button class="btn btn-outline-primary  btn-sm col" id="add-cash">
                                    <i class="fas fa-plus"></i>
                                    <i class="fa-solid fa-coins"></i> Add Cash
                                </button>
                                <button class="btn btn-outline-dark btn-sm col" id="pay-later">
                                    <i class="fa fa-solid fa-hand-holding-dollar"></i> Pay Later
                                </button>
                                <button class="btn btn-outline-primary btn-sm col" id="submit-transaction">
                                    <i class="fa fa-print"></i> Add Transaction
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer text-muted">

                </div>
            </div>
        </div>
   </div>
</div>
<div class="modal fade" id="addDiscount" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Add Discount</h5>
          <button class="close" type="button" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="discounts-items" id="discounts-items">
                    <!-- <div class="custom-control custom-switch col-12">
                        <input type="checkbox" class="custom-control-input" id="senior">
                        <label class="custom-control-label" for="senior">Senior Citizen</label>
                    </div>
                    <div class="custom-control custom-switch col-12">
                        <input type="checkbox" class="custom-control-input" id="pwd">
                        <label class="custom-control-label" for="pwd">PWD</label>
                    </div>
                    <div class="custom-control custom-switch col-12">
                        <input type="checkbox" class="custom-control-input" id="others">
                        <label class="custom-control-label" for="others">Others</label>
                    </div> -->
                </div>
                <div class="col-12">
                    <button type="button" class="btn btn-primary btn-user btn-block  col-4 float-right" data-dismiss="modal" aria-label="Close">
                        OK
                    </button>
                </div>
            </div>
            <!-- <div class="form-group">
                <input type="number" class="form-control form-control-user" id="discount-amount" aria-describedby="emailHelp" placeholder="Enter discount">
            </div> -->
        </div>
      </div>
    </div>
</div>

<!-- The Modal -->
<div class="modal fade" id="transaction-history">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
        
        <!-- Modal Header -->
        <div class="modal-header">
            <h4 class="modal-title">Transaction History</h4>
            <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        
        <!-- Modal body -->
        <div class="modal-body">
            <div class="row">
                <div class="col-12">
                    <div class="table-responsive">
                        <div class="row">
                            <div class="col-12">
                                <div class="input-group mb-3 col-3 float-right">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text" id="inputGroup-sizing-default">Date</span>
                                    </div>
                                    <input type="date" name="transaction-date" class="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default" value="<?php echo date("Y-m-d")?>">
                                </div>
                            </div>
                            <div class="col-12 mt-3">
                                <table class="table table-bordered text-center table-sm nowrap" id="transaction-table" width="100%" cellspacing="0">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Transaction Type</th>
                                            <th>Transaction Category</th>
                                            <th>Date</th>
                                            <th>Item</th>
                                            <th>Discount %</th>
                                            <th>Discount Amount</th>
                                            <th>Discount Items</th>
                                            <!-- <th>Cash</th> -->
                                            <th>Amount</th>
                                            <!-- <th>Discounted Price</th> -->
                                            <th>Note</th>
                                            <th>-</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                            <th style="text-align:right"></th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal footer -->
        <div class="modal-footer">
            <button type="button" id="btn-end-of-day" class="btn btn-primary hidden" data-dismiss="modal">End of Day</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
        
        </div>
    </div>
</div>

<!-- The Modal -->
<div class="modal fade" id="customerModal">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
        
        <!-- Modal Header -->
        <div class="modal-header">
            <h4 class="modal-title">View Customer</h4>
            <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        
        <!-- Modal body -->
        <div class="modal-body">
            <div class="row">
                <div class="col-12">
                    <iframe src="customers.php" frameborder="0" width="100%"></iframe>
                </div>
            </div>
        </div>
        
        <!-- Modal footer -->
        <div class="modal-footer">
            <button type="button" id="btn-end-of-day" class="btn btn-primary hidden" data-dismiss="modal">End of Day</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
        
        </div>
    </div>
</div>

<div class="modal fade" id="customerPayables">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
        
        <!-- Modal Header -->
        <div class="modal-header">
            <h4 class="modal-title">View Customer Payables</h4>
            <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        
        <!-- Modal body -->
        <div class="modal-body">
            <div class="row">
                <div class="col-12">
                    <div class="table-responsive">
                        <div class="row">
                            <div class="col-12">
                            </div>
                            <div class="col-12 mt-3">
                                <div class="table-responsive">
                                    <table class="table table-bordered text-center" id="payables-table" width="100%" cellspacing="0">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Amount</th>
                                                <th>Store</th>
                                                <th>Date Added</th>
                                                <th>Due Date</th>
                                                <th>Status</th>
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
                </div>
            </div>
        </div>
        
        <!-- Modal footer -->
        <div class="modal-footer">
            <button type="button" id="btn-end-of-day" class="btn btn-primary hidden" data-dismiss="modal">End of Day</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
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

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<!-- /.container-fluid -->
<?php include 'common/footer.php' ?> 
