<?php include 'common/header.php' ?> 
<style>
:root {
        --bg: #f0f2f5;
        --card: #ffffff;
        --border: #d0d7de;
        --text: #1c1e21;
        --muted: #606770;
        --primary: #0aa5a5;   /* teal */
        --primary-dark: #087f7f;
    }

    /* BASE */
    body {
        background: var(--bg);
        font-family: 'Inter', Arial, sans-serif;
        color: var(--text);
        margin: 0;
    }

    .hidden { display: none; }

    /* Container Adjustments */
    .container-fluid {
        padding: 16px;
        transition: all 0.3s ease;
    }

    /* CARD */
    .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
    }

    .card-header {
        font-size: 15px;
        font-weight: 700;
        padding: 14px;
        border-bottom: 1px solid var(--border);
        background: #fff;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
    }

    /* TABLE */
    .table-responsive-custom {
        overflow-y: auto;
        min-height: 300px;
        max-height: 450px;
    }

    .table thead th {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: #f8f9fa;
        color: var(--muted);
        border-bottom: 1px solid var(--border);
        padding: 12px;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    /* BUTTONS */
    .btn {
        border-radius: 10px;
        font-size: 14px;
        padding: 12px;
        font-weight: 600;
        transition: all 0.2s;
    }

    .btn-primary { background: var(--primary); border: none; color: white; }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-outline-primary { border: 1px solid var(--primary); color: var(--primary); background: white; }

    /* SUMMARY SECTION */
    .summary-item {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        margin-bottom: 10px;
    }

    #total {
        font-size: 28px;
        font-weight: 800;
        color: var(--primary);
    }

    /* GRID FOR ACTION BUTTONS */
    .action-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 10px;
    }

    .action-grid .btn-full { grid-column: span 2; }

    /* =========================================
       TABLET & MOBILE (FULL PAGE) OVERRIDES
    ========================================= */
    @media (max-width: 991px) {
        body { background: #fff; }
        
        .container-fluid {
            padding: 0; /* Remove padding to occupy whole screen */
        }

        .d-sm-flex {
            padding: 15px;
            flex-direction: column;
            background: #fff;
            border-bottom: 1px solid var(--border);
        }

        /* Stack Columns */
        .col-8, .col-4 {
            flex: 0 0 100%;
            max-width: 100%;
            padding: 0;
        }

        .card {
            border: none;
            border-radius: 0;
            margin-bottom: 0;
        }

        .table-responsive-custom {
            height: auto !important;
            max-height: 40vh; /* Limit height so summary is visible */
        }

        .card-header { border-radius: 0; }

        /* Floating Summary at Bottom logic */
        .col-4 .card {
            border-top: 2px solid var(--border);
            background: #f8fafc;
        }

        .action-area { padding: 15px; }

        /* Make buttons larger for touch */
        .btn { padding: 15px; }
        }

        /* SCROLLBAR */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        /* Discount Grid Layout */
        .discount-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        .discount-tile {
            background: #fff; border: 2px solid #f1f1f1; border-radius: 12px; padding: 15px;
            text-align: center; cursor: pointer; transition: 0.2s;
        }
        .discount-tile:hover { border-color: var(--primary); background: #f0fafa; }
        .discount-name { font-size: 0.85rem; font-weight: 700; display: block; }
        .discount-value { font-size: 0.75rem; color: #2ecc71; font-weight: 700; }
        /* Container for the draft links */
#draft-transaction-container {
    display: flex;
    flex-wrap: wrap; /* Allows items to wrap to the next line on small screens */
    gap: 10px;       /* Spacing between drafts */
    padding: 10px 0;
}

/* Individual Draft Style */
.draft-item {
    background: #e9ecef;
    color: #495057;
    padding: 8px 15px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #dee2e6;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
    white-space: nowrap; /* Keeps "Draft 1" on one line */
}

.draft-item i {
    margin-right: 6px;
    color: var(--primary);
}

.draft-item:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    text-decoration: none;
}

.draft-item:hover i {
    color: white;
}
</style>
<div class="container-fluid">
   <!-- HEADER (UNCHANGED IDS) -->
   <div class="d-sm-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-2">Point of Sale
        <button class="btn btn-outline-primary" id="browsProduct">
         Select Product
        </button>
      </h4>
      <div>
         <button class="btn btn-outline-primary" data-toggle="modal" data-target="#create-stock-modal" id="create-stock">
         Create Stock
         </button>
         <button class="btn btn-outline-primary" data-toggle="modal" data-target="#convertion-modal" id="v-convertion">
         Converter
         </button>
         <button class="btn btn-outline-primary" data-toggle="modal" data-target="#material-convertion-modal" id="v-m-convertion">
         Materials
         </button>
         <button class="btn btn-outline-primary" data-toggle="modal" data-target="#transaction-history" id="v-transaction">
         History
         </button>
      </div>
   </div>
   <div class="row">
      <!-- LEFT -->
      <div class="col-8">
         <div class="card">
            <div class="card-header" id="transaction-header">
               Transaction
            </div>
            <div class="card-body" style="height:450px;overflow:auto;">
               <table class="table">
                  <thead>
                     <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Total</th>
                        <th class="text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody id="selected-menu-list"></tbody>
               </table>
            </div>
            <div class="card-footer">
               <div class="row no-gutters">
                  <div class="col-6"></div>
                  <div class="col-6">
                     <div id="draft-transaction-container"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <!-- RIGHT -->
      <div class="col-4">
         <div class="card">
            <div class="card-header">Summary</div>
            <div class="card-body">
               <div class="summary">Subtotal: <span class="float-right" id="subtotal">0.00</span></div>
               <div class="summary">Discount %: <span class="float-right" id="discount">0.00</span></div>
               <div class="summary">Discount Amount: <span class="float-right" id="discount-amount">0.00</span></div>
               <hr>
               <div class="summary">TOTAL: <span class="float-right" id="total">0.00</span></div>
               <hr>
               <div class="summary">Cash: <span class="float-right" id="cash-label">0.00</span></div>
               <div class="summary">Change: <span class="float-right" id="change">0.00</span></div>
               <hr>
               <div class="action-area">
                  <button class="btn btn-outline-primary" id="add-expenses">Expenses</button>
                  <button class="btn btn-outline-primary" id="save-as-draft">Save Draft</button>
                  <button class="btn btn-outline-primary" data-toggle="modal" data-target="#addDiscount">Discount</button>
                  <button class="btn btn-outline-primary" id="add-cash">Add Cash</button>
                  <button class="btn btn-outline-primary" id="pay-later">Pay Later</button>
                  <button class="btn btn-primary" id="submit-transaction">
                  COMPLETE ORDER
                  </button>
               </div>
            </div>
         </div>
      </div>
   </div>
</div>
<!-- ================= ALL MODALS FULL (UNCHANGED STRUCTURE) ================= -->
<div class="modal fade" id="searchProducts">
   <div class="modal-dialog modal-xl">
      <div class="modal-content">
         <div class="modal-header">
            <h5>Search Product</h5>
         </div>
         <div class="modal-body">
            <input class="form-control mb-2" id="product-search" placeholder="Search...">
            <div id="menu-loading" class="text-center">
               <i class="fa fa-spinner fa-spin"></i>
            </div>
            <table class="table" id="product-container">
               <thead>
                  <tr>
                     <th>#</th>
                     <th>Code</th>
                     <th>Product</th>
                     <th>Type</th>
                     <th>Price</th>
                     <th>Supplier</th>
                     <th>Date</th>
                     <th>Unit</th>
                     <th>Stock</th>
                  </tr>
               </thead>
               <tbody></tbody>
            </table>
         </div>
      </div>
   </div>
</div>
<!-- CONVERSION -->
<div class="modal fade" id="convertion-modal">
   <div class="modal-dialog modal-lg">
      <div class="modal-content">
         <div class="modal-header">
            <h5>Conversion</h5>
         </div>
         <div class="modal-body">
            <table class="table" id="product-container-w-convertion">
               <thead>
                  <tr>
                     <th>#</th>
                     <th>Code</th>
                     <th>Product</th>
                     <th>Type</th>
                     <th>Price</th>
                     <th>Unit</th>
                     <th>Stock</th>
                  </tr>
               </thead>
               <tbody></tbody>
            </table>
         </div>
      </div>
   </div>
</div>
<!-- MATERIAL -->
<div class="modal fade" id="material-convertion-modal">
   <div class="modal-dialog modal-lg">
      <div class="modal-content">
         <div class="modal-header">
            <h5>Material Conversion</h5>
         </div>
         <div class="modal-body">
            <table class="table" id="material-container">
               <thead>
                  <tr>
                     <th>#</th>
                     <th>Code</th>
                     <th>Product</th>
                     <th>Type</th>
                     <th>Price</th>
                     <th>Unit</th>
                     <th>Stock</th>
                  </tr>
               </thead>
               <tbody></tbody>
            </table>
         </div>
      </div>
   </div>
</div>
<!-- CREATE STOCK -->
<div class="modal fade" id="create-stock-modal">
   <div class="modal-dialog modal-lg">
      <div class="modal-content">
         <div class="modal-header">
            <h5>Create Stock</h5>
         </div>
         <div class="modal-body">
            <table class="table" id="create-stock-container">
               <thead>
                  <tr>
                     <th>#</th>
                     <th>Code</th>
                     <th>Product</th>
                     <th>Type</th>
                     <th>-</th>
                  </tr>
               </thead>
               <tbody></tbody>
            </table>
         </div>
      </div>
   </div>
</div>
<!-- HISTORY -->
<div class="modal fade" id="transaction-history">
   <div class="modal-dialog modal-xl">
      <div class="modal-content">
         <div class="modal-header">
            <h5>Transaction History</h5>
         </div>
         <div class="modal-body">
            <table class="table" id="transaction-table">
               <thead>
                  <tr>
                     <th>Order</th>
                     <th>Type</th>
                     <th>Category</th>
                     <th>Date</th>
                     <th>Item</th>
                     <th>Disc%</th>
                     <th>Disc Amt</th>
                     <th>Items</th>
                     <th>Amount</th>
                     <th>Note</th>
                     <th>-</th>
                  </tr>
               </thead>
               <tbody></tbody>
            </table>
         </div>
      </div>
   </div>
</div>
<!-- DISCOUNT -->
<div class="modal fade" id="addDiscount" tabindex="-1" aria-hidden="true">
   <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content" style="border: none; border-radius: 15px; overflow: hidden;">
         <div class="modal-header" style="background: #f8f9fa; border-bottom: 1px solid #eee; padding: 1.2rem;">
            <h5 class="modal-title" style="font-weight: 700; color: #333; font-size: 1.1rem;">Select Discount</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
               <span aria-hidden="true">&times;</span>
            </button>
         </div>
         <div class="modal-body" style="background: #fff; padding: 20px;">
            <p style="font-size: 0.85rem; color: #6c757d; margin-bottom: 15px;">Choose a discount to apply to this transaction:</p>
            <div id="discounts-items" class="discount-grid"></div>
         </div>
      </div>
   </div>
</div>
<!-- CUSTOMER -->
<div class="modal fade" id="customerModal">
   <div class="modal-dialog modal-xl">
      <div class="modal-content">
         <div class="modal-header">
            <h5>Customer</h5>
         </div>
         <div class="modal-body">
            <iframe src="customers.php" width="100%"></iframe>
         </div>
      </div>
   </div>
</div>
<!-- PAYABLES -->
<div class="modal fade" id="customerPayables">
   <div class="modal-dialog modal-xl">
      <div class="modal-content">
         <div class="modal-header">
            <h5>Payables</h5>
         </div>
         <div class="modal-body">
            <table class="table" id="payables-table">
               <thead>
                  <tr>
                     <th>#</th>
                     <th>Amount</th>
                     <th>Store</th>
                     <th>Date</th>
                     <th>Due</th>
                     <th>Status</th>
                     <th>-</th>
                  </tr>
               </thead>
               <tbody></tbody>
            </table>
         </div>
      </div>
   </div>
</div>
<!-- CUSTOMER FORM -->
<div class="modal fade" id="customerFormModal">
   <div class="modal-dialog modal-lg">
      <div class="modal-content">
         <div class="modal-header">
            <h5>Customer Form</h5>
         </div>
         <div class="modal-body">
            <form id="frm-customer">
               <input class="form-control mb-2" name="firstname" placeholder="Firstname">
               <input class="form-control mb-2" name="middlename" placeholder="Middlename">
               <input class="form-control mb-2" name="lastname" placeholder="Lastname">
               <input class="form-control mb-2" name="email" placeholder="Email">
               <input class="form-control mb-2" name="mobile" placeholder="Mobile">
               <textarea class="form-control mb-2" name="address"></textarea>
               <button class="btn btn-primary w-100">Submit</button>
            </form>
         </div>
      </div>
   </div>
</div>
<?php include 'common/footer.php' ?>