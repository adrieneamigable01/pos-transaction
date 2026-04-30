$(()=>{
    var accesskey   = session != null ? session.key : null,
    activeTable = null,
    customerTable = null,
    customerid = null,
    csc = null,
    productTypeId  = 1,
    total = 0,
    discount_amount = 0,
    subtotal = 0,
    discount = 0,
    objectMenu = {},
    discountPercentage = 0,
    discountItems = {},
    cash = 0,
    canSubmit = 0,
    note = '',
    pos_table = $("#selected-menu-list"),
    pos_message = $("#system-pos-message"),
    transaction_id = null,
    isLogout = false,
    selectedStack = null,
    selectedConvedtionStack = null,
    currentRowIndex  = null,
    currentConvertionRowIndex = null,
    conversionData = null,
    transactions = {},
    denomonation = {},
    stockData = null,
    stockDataWithConvertion = null,
    expenseCategoryData = {},
    isEndOfDay = false,
    draftransactionid = null,
    customerData = null,
    customerid=null,
    now = new Date();
    canAddToCartOnEnter = false;
    materialsData =null,
    pos = {
        init:()=>{
            jsAddon.display.addfullPageLoader();
            let token = localStorage.getItem("token")
            if(token == null){
                localStorage.removeItem('session');
                localStorage.removeItem('token');
                window.location.href = baseUrl;
            }else{
                pos.ajax.checkToken().then((data)=>{
                    if(data){
                        $("#dashboard_fullname").text(fullName);
                        pos.ajax.getEndTransaction();
                        pos.ajax.getDraftTransaction();
                        pos.ajax.getCustomer();
                        pos.ajax.getProducts();
                        pos.ajax.getExpenseCategory();
                        pos.ajax.getMaterials();
                        jsAddon.display.removefullPageLoader();
                    }  
                })
                
            }
        },
        ajax:{
            checkToken:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${checkTokenApi}`,
                        dataType:'json',
                    }).then((response)=>{
                        resolve(!response._isError)
                    })
                     
                })
            },
            getConvertionMaterialUnit:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getStockUnitApi}`,
                        dataType:'json',
                    }).then((response)=>{
                        if(!response._isError){
                            let convertion_length = $("#conversion_unit").length - 1;
                    
                            $("#conversion_unit").eq(convertion_length).empty();
                            $.each(response.data,function(k,v){
                                $("#conversion_unit").eq(convertion_length).append(
                                    $("<option>")
                                        .attr({
                                            value:v.unitid,
                                            title:v.unit
                                        })
                                        .text(v.abbreviations)
                                )
                                
                            })
                        }
                    })
                })
            },
            getCustomerPayables:()=>{
                return new Promise((resolve,reject)=>{
                    if ( $.fn.DataTable.isDataTable('#payables-table') ) {
                        activeTable.clear();
                        activeTable.destroy();
                        $("#payables-table").find("tbody").empty();
                    }
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getCustomerPayablesApi}`,
                        dataType:'json',
                        payload:{
                            customerid:customerid
                        }
                    }).then((response)=>{
                        if(!response._isError){
                            console.log('response.data',response.data)
                             $.each(response.data,function(k,v){
                                     $("#payables-table")
                                     .find("tbody")
                                     .append(
                                         $("<tr>")
                                             .append(
                                                 $("<td>")
                                                     .text(v.ornumber),
                                                 $("<td>")
                                                     .text(v.amount),
                                                $("<td>")
                                                     .text(v.storeName),
                                                 $("<td>")
                                                     .text(v.date_added),
                                                 $("<td>")
                                                     .text(v.due_date),
                                                 $("<td>")
                                                     .text(v.status),
                                                 $("<td>")
                                                     .append(
                                                        $("<button>")
                                                         .addClass("btn btn-primary btn-sm")
                                                         .text("View More")
                                                         .click(function(){
                                                            window.location.href = `customer_payables.php?id=${v.ornumber}`
                                                         }),
                                                         v.status == "active" ?
                                                        $("<button>")
                                                         .addClass("btn btn-success btn-sm ml-1")
                                                         .text("Update Due Date")
                                                         .click(function(){
                                                            (async () => {
                                                                Swal.fire({
                                                                    title: "Void payment",
                                                                    html: `
                                                                        <div class="row">
                                                                            <div class="col-12 text-left">
                                                                                <h4>Update Due Date</h4>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div class="row">
                                                                            <div class="input-group mb-3 col-12">
                                                                                <div class="input-group-prepend">
                                                                                    <span class="input-group-text" id="inputGroup-sizing-default">Due Date</span>
                                                                                </div>
                                                                                <input type="date" id="due_date" name="due_date" class="form-control" value="${v.due_date == null ? "" : v.due_date.split(" ")[0]}" placeholder="Enter Djue">
                                                                            </div>
                                                                        </div>
                                                                    `,
                                                                    showCancelButton:true,
                                                                    focusConfirm: false,
                                                                    preConfirm: () => {
                                                                        const due_date = Swal.getPopup().querySelector('#due_date').value;
                                                                        if (!due_date) {
                                                                            Swal.showValidationMessage(`Please enter due date`);
                                                                        }
                                                                        return { due_date: due_date };
                                                                    }
                                                                }).then((result) => {
                                                                    due_date = result.value.due_date;
                                                                    let payload = {
                                                                        due_date:due_date,
                                                                        ornumber:v.ornumber
                                                                    }
                                                                    customer.ajax.updatePayablesDue(payload);
                                                                });
                                                            })()
                                                         }) : ''
                                                     ),
                                             )
                                     )
                             })
                             resolve(true)
                        }
                    })
                     
                })
                .then(data=>{
                    if(data){
                        activeTable = $("#payables-table").DataTable({
                            "autoWidth":false, 
                        });
                        jsAddon.display.removefullPageLoader()
                    }
                })
            },
            mixproduct:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:`${mixproductApi}`,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                           $(".modal").modal("hide");
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                })
            },
            convertStock:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:`${convertStockApi}`,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                           $(".modal").modal("hide");
                           $("#searchProducts").modal("show")
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                })
            },
            boardFeetToDimensions:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:`${boardFeetToDimensionsApi}`,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                           $(".modal").modal("hide");
                           $("#searchProducts").modal("show")
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                })
            },
            addExpenses:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:`${addExpensesApi}`,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            draftransactionid= null;
                            total = 0,
                            subtotal = 0,
                            discount = 0,
                            change = 0,
                            discountPercentage = 0;
                            canSubmit = false;
                            objectMenu = {};
                            note = '';
                            discountItems = {};
                            cash = 0;
                            $("#cash").val("");
                            $("#transactions-button").empty();
                            $("#transaction-header").find(".fa-trash").remove();
                            pos.display.calculatePOS()
                            .then(data=>{
                                $("#selected-menu-list").empty();
                            })

                            pos.ajax.getDraftTransaction();
                            // pos.display.printReceipt(response.data,showAmount);
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                })
            },
            getExpenseCategory:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getExpenseCategoryApi}`,
                        dataType:'json',
                    }).then((response)=>{
                        if(!response._isError){
                            expenseCategoryData = response.data;
                        }
                    })
                })
            },
            getCustomer:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getCustomerApi}`,
                        dataType:'json',
                    }).then((response)=>{

                        if ($.fn.DataTable.isDataTable("#customer-table")) {
                            customerTable.clear();
                            customerTable.destroy();
                            $("#customer-table tbody").empty();
                        }

                        $("#customer-selection").empty();

                        if(Object.keys(response.data).length >0){
                            customerData = response.data;
                            $.each(response.data,function(k,v){
                                $("#customer-selection").append(
                                    $("<option>")
                                        .attr({
                                            value:v.customerid
                                        })
                                        .text(v.name)
                                )

                                $("#customer-table tbody").append(
                                    $("<tr>").append(
                                        $("<td>").text(v.customerid),
                                        $("<td>").text(v.name),
                                        $("<td>").text(v.address),
                                        $("<td>").text(v.email),
                                        $("<td>").text(v.contact_number),
                                        $("<td>").text(v.date_added),
                                        $("<td>").text(v.storeName),
                                        $("<td>")
                                            .append(
                                                $("<button>")
                                                .addClass("btn btn-info btn-sm")
                                                .text("Payables")
                                                .click(function(){
                                                    $(".modal").modal("hide")
                                                   $("#customerPayables").modal("show");
                                                   customerid = v.customerid;
                                                   pos.ajax.getCustomerPayables();
                                                }),
                                                $("<button>")
                                                .addClass("btn btn-success btn-sm ml-1")
                                                .text("Update")
                                                .attr({
                                                    'data-toggle':'modal',
                                                    'data-target':'#updateUser'
                                                })
                                                .click(function(){
                                                    $("#customerFormModal").modal("show")
                                                    customerid = v.customerid
                                                    // let storeName = aData[7].toLowerCase();
                                             
                                                    $("#frm-customer :input[name=firstname]").val(v.firstname);
                                                    $("#frm-customer :input[name=middlename]").val(v.middlename);
                                                    $("#frm-customer :input[name=lastname]").val(v.lastname);
                                                    $("#frm-customer :input[name=email]").val(v.email);
                                                    $("#frm-customer :input[name=mobile]").val(v.contact_number);
                                                    $("#frm-customer :input[name=address]").val(v.address);

                                                }),
                                            ),
                                    )
                                )

                            
                                if(Object.keys(response.data).length - 1 == k){
                                    resolve(true)
                                }
                            })
                        }else{
                            resolve(true)
                        }
                     
                    })
                     
                }).then(()=>{
                    customerTable =  $("#customer-table").DataTable()
                })
            },
            addCustomer:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:createCustomerApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            $("#customerFormModal").modal("hide")
                            $("#frm-customer")[0].reset()
                            pos.ajax.getCustomer();
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            updateCustomer:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:editCustomerApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            $("#customerFormModal").modal("hide")
                            $("#frm-customer")[0].reset()
                            customerid = null;
                            pos.ajax.getCustomer();
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            getproductType:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getProductTypeApi}/?accessKey=${accesskey}`,
                        dataType:'json',
                    }).then((response)=>{
                        $.each(response.data,function(k,v){

                            if(k == 0){
                                productTypeId  = v.productTypeId ;
                            }

                            $('#productTypeId')
                                .append(
                                    $("<option>")
                                        .attr({
                                            value:v.productTypeId
                                        })
                                        .text(v.productType)
                                    
                                )
                        })
                        resolve(true)
                    })
                     
                }).then(()=>{
                   
                    $('#productTypeId').select2()
                })
            },
            getStockConversion:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:getPOSStocksConversionApi,
                        dataType:'json',
                    }).then((response)=>{
                        if(!response._isError){
                            if(Object.keys(response.data).length > 0){
                                conversionData = response.data;
                                jsAddon.display.removefullPageLoader()
                                resolve(true);
                            }else{
                                jsAddon.display.removefullPageLoader()
                                resolve(true);
                            }
                        }else{
                            jsAddon.display.removefullPageLoader()
                            resolve(true);
                        }
                    })
                })
                
            },
            getMaterials:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:getPOSMaterialsApi,
                        dataType:'json',
                    }).then((response)=>{
                        if(!response._isError){
                            if(Object.keys(response.data).length > 0){
                                materialsData = response.data;
                                resolve(true);
                            }else{
                                resolve(true);
                            }
                        }else{
                            resolve(true);
                        }
                    })
                }).then(()=>{
                    jsAddon.display.removefullPageLoader()
                    pos.display.displayMaterials();
                    setTimeout(() => {
                        pos.ajax.getProductsRecor();
                    }, 10000);
                    // activeTable = $('#product-container').DataTable({});
                })

            },
            getProducts:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:getPOSStocksApi,
                        dataType:'json',
                    }).then((response)=>{
                        if(!response._isError){
                            if(Object.keys(response.data).length > 0){
                                stockData = response.data;
                                stockDataWithConvertion = response.data.filter(item => item.has_conversion_item == true || item.isConvertable == true);
                                resolve(true);
                            }else{
                                resolve(true);
                            }
                        }else{
                            resolve(true);
                        }
                    })
                }).then(()=>{
                    jsAddon.display.removefullPageLoader()
                    pos.display.displayProductList()
                    pos.display.displayProductListWithConvertion();
                    setTimeout(() => {
                        pos.ajax.getProductsRecor();
                    }, 10000);
                    // activeTable = $('#product-container').DataTable({});
                })
            },
            getProductsWithComposition:(payload = {})=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:getMixProductsApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            if(Object.keys(response.data).length > 0){
                                if ( $.fn.DataTable.isDataTable('#create-stock-container') ) {
                                    csc.clear();
                                    csc.destroy();
                
                                    $("#create-stock-container")
                                    .find("tbody")
                                    .empty()
                                }
                                let data = response.data.filter(item => item.mix_components_ids != "");
                                $.each(data,function(k,v){
                                    $("#create-stock-container tbody").append(
                                        $("<tr>").append(
                                            $("<td>").text(v.mixproductid),
                                            $("<td>").text(v.productCode),
                                            $("<td>").text(v.product_name),
                                            $("<td>").text(v.productType),
                                            $("<td>").append(
                                                $("<button>")
                                                    .addClass("btn btn-success")
                                                    .text("Create")
                                                    .click(function(){
                                                      
                                                      
                                                        let inputsHtml = '';
                                                        let hasNoData = false;
                                                        const parseData = JSON.parse(v.mix_components);
                                                        // const productIds = parseData.map(component => component.productid);
                                                       
                                                        for (let index = 0; index < parseData.length; index++) {
                                                            let components = stockData.filter(item => 
                                                                parseInt(item.productid) == parseInt(parseData[index].productid) && 
                                                                parseInt(item.unitid) == parseInt(parseData[index].unit) &&
                                                                parseFloat(item.total) >= parseInt(parseData[index].quantity)
                                                            );
                                                            // console.log(JSON.stringify(components));return false;
                                                            let option = "";
                                                            if(Object.keys(components).length == 0){
                                                                hasNoData = true;
                                                                option += `<option data-value='' >No stock available.. </option>`;
                                                            }else{
                                                                $.each(components,function(k,v){
                                                                    v['materials'] = parseData[index];
                                                                    option += `<option data-value='${JSON.stringify(v)}' >${v.product_name} ( ${v.companyName} ) - ${parseData[index].quantity}${v.abbreviations} </option>`;
                                                                })
                                                            }

                                                            inputsHtml += `
                                                            <div class="form-group">
                                                                <select id="selected-product-mix" class="form-control selected-product-mix">
                                                                    ${option}
                                                                </select>
                                                            </div>`;
                                                        }

                                                     


                                                        Swal.fire({
                                                            title: 'Conversion Details',
                                                            html: `
                                                                ${inputsHtml}
                                                                <div class="form-group">
                                                                    <b for="quantity" class="float-left">Quantity: ${v.quantity} ${v.unit}</b>
                                                                </div><br>
                                                                <div class="form-group mt-2">
                                                                    <b for="quantity" class="float-left">Selling Price: ${v.selling_price}</b>
                                                                </div> <br>
                                                                <div class="form-group">
                                                                    <label for="mp_description" class="float-left">Description</label>
                                                                    <textarea class="form-control form-control-lg" name="mp_description" id="mp_description"></textarea>
                                                                </div>
                                                            `,
                                                            focusConfirm: false,
                                                            showCancelButton: true,
                                                            showConfirmButton:!hasNoData,
                                                            confirmButtonColor: '#3085d6',
                                                            cancelButtonColor: '#d33',
                                                            confirmButtonText: 'Convert',
                                                            preConfirm: () => {
                                                                const mp_description = document.getElementById('mp_description').value;
                                                                // const sellingPrice = document.getElementById('sellingPrice').value;
                                                                // const unit = document.getElementById('unit').value;
                                                
                                                                if (!mp_description) {
                                                                    Swal.showValidationMessage('Please enter description');
                                                                }
                                                
                                                                return { mp_description };
                                                            }
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                // // You can use result.value to access the input values
                                                                const { mp_description } = result.value;
                                                                // console.log(`Quantity: ${quantity}, Selling Price: ${sellingPrice}, Unit: ${unit}`);
                                                                // Swal.fire('Success!', `Quantity: ${quantity}, Selling Price: ${sellingPrice}, Unit: ${unit}`, 'success');
                                                                let conversion_product = [];
                                                                $('.selected-product-mix').each(function() {
                                                                    let data = $(this).find("option:selected").data("value");

                                                                    conversion_product.push({
                                                                        stockid:data.stockid,
                                                                        productid:data.productid,
                                                                        quantity:data.materials.quantity
                                                                    })
                                                                    // You can do something with 'data' here
                                                                });
                                                                let payload = {
                                                                    conversion_product:JSON.stringify(conversion_product),
                                                                    quantity:v.quantity,
                                                                    selling_price:v.selling_price,
                                                                    productid:v.productid,
                                                                    unit:v.unitid,
                                                                    description:mp_description,
                                                                }
                                                                pos.ajax.mixproduct(payload);
                                                            }
                                                        });
                                                    })
                                            ),
                                        )
                                    );
                                    if(Object.keys(data).length - 1 == k){
                                        resolve(true);
                                        $("#create-stock-loading").remove();
                                        $("#create-stock-container").parent().removeClass("hidden")
                                    }
                                })
                               
                            }else{
                                $("#create-stock-loading").remove();
                                $("#create-stock-container").parent().removeClass("hidden")
                                resolve(true);
                            }
                        }else{
                            $("#create-stock-loading").remove();
                            $("#create-stock-container").parent().removeClass("hidden")
                            resolve(true);
                        }
                    })
                }).then(()=>{
                    jsAddon.display.removefullPageLoader()
                    csc = $("#create-stock-container").DataTable()
    
                })
            },
            getProductsWConversion:(payload,productid,productTypeId)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:getProductsApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            if(Object.keys(response.data).length > 0){
                                let data = response.data.filter(item => parseInt(item.productid) != parseInt(productid) && parseInt(item.productTypeId) == parseInt(productTypeId));
                                // let data = response.data.filter(item => item.productid != productid);
                                $("#c_productid")
                                .empty()
                                .append(
                                    $("<option>")
                                    .css({
                                        display:'none'
                                    })
                                    .attr({
                                        value:''
                                    })
                                    .text('Select')
                                )

                                $.each(data,function(k,v){
                                    $("#c_productid").append(
                                        $("<option>")
                                        .attr({
                                            value:v.productid,
                                            'data-value':JSON.stringify(v),
                                        })
                                        .text(v.product_name)
                                    )
                                })
                                resolve(true);
                            }else{
                                resolve(true);
                            }
                        }else{
                            resolve(true);
                        }
                    })
                }).then(()=>{
                    jsAddon.display.removefullPageLoader()
                    pos.display.displayProductList()
                    pos.display.displayProductListWithConvertion();
                    setTimeout(() => {
                        pos.ajax.getProductsRecor();
                    }, 10000);
                    // activeTable = $('#product-container').DataTable({});
                })
            },
            getProductsRecor:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:getPOSStocksApi,
                        dataType:'json',
                    }).then((response)=>{
                        if(!response._isError){
                            if(Object.keys(response.data).length > 0){
                                stockData = response.data;
                                resolve(true);
                            }else{
                                resolve(true);
                            }
                        }else{
                            resolve(true);
                        }
                    })
                }).then(()=>{
                    jsAddon.display.removefullPageLoader()
                    setTimeout(() => {
                        pos.ajax.getProductsRecor();
                    }, 10000);
                    // activeTable = $('#product-container').DataTable({});
                })
            },
            addTransaction:(payload,showAmount)=>{

                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:addTransactionApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            draftransactionid= null;
                            total = 0,
                            subtotal = 0,
                            discount = 0,
                            change = 0,
                            discountPercentage = 0;
                            canSubmit = false;
                            objectMenu = {};
                            note = '';
                            discountItems = {};
                            cash = 0;
                            $("#cash").val("");
                            $("#transactions-button").empty();
                            $("#transaction-header").find(".fa-trash").remove();
                            pos.display.calculatePOS()
                            .then(data=>{
                                $("#selected-menu-list").empty();
                            })

                            pos.ajax.getDraftTransaction();
                            pos.display.printReceipt(response.data,showAmount);
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            addPayLater:(payload,showAmount)=>{

                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:payLaterTransactionApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            draftransactionid= null;
                            total = 0,
                            subtotal = 0,
                            discount = 0,
                            change = 0,
                            discountPercentage = 0;
                            canSubmit = false;
                            objectMenu = {};
                            note = '';
                            discountItems = {};
                            cash = 0;
                            $("#cash").val("");
                            $("#transactions-button").empty();
                            $("#transaction-header").find(".fa-trash").remove();
                            pos.display.calculatePOS()
                            .then(data=>{
                                $("#selected-menu-list").empty();
                            })

                            pos.ajax.getDraftTransaction();
                            pos.display.printReceipt(response.data,showAmount);
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            addEndTransaction:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:addEndTransactionApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            pos.ajax.getEndTransaction();
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            addDraftTransaction:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:addDraftTransactionApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            pos.ajax.getDraftTransaction();
                            resolve(true);
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            editDraftTransaction:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:editDraftTransactionApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            pos.ajax.getDraftTransaction();
                            resolve(true);
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            getTransaction:()=>{
                let date = $(":input[name=transaction-date]").val();
               
                jsAddon.display.addfullPageLoader()

                if ( $.fn.DataTable.isDataTable('#transaction-table') ) {
                    activeTable.clear();
                    activeTable.destroy();

                    $("#transaction-table")
                    .find("tbody")
                    .empty()
                }
                return new Promise((resolve,reject)=>{
                    
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getTransactionApi}`,
                        dataType:'json',
                        payload:{
                            date:date,
                            userid:jsAddon.display.userdata().userid,
                        }
                    }).then((response)=>{
                        if(response._isError){
                            jsAddon.display.swalMessage(response._isError,response.reason);
                            resolve(true)
                        }else{
                            transactions = response.data;
                            if(response.data.length > 0){
                                let overall_discount_amount = 0;
                                let overall_cash = 0;
                                let overall_total_price = 0
                                let overall_total_discount = 0;
                                $.each(response.data,function(k,v){
                                    
                                    let  orderItems = $("<table>");
                                    let  discountItems = $("<ul>").addClass("list-group list-group-flush");
                                    if(v.data != ""){
                                        if(v.transaction_category == "Transaction" || v.transaction_category == "Payables"){
                                            orderItems                                        
                                            .addClass("table table-borderd")
                                            .append(
                                                $("<thead>")
                                                .append(
                                                    $("<td>").text("Item"),
                                                    $("<td>").text("Price"),
                                                    $("<td>").text("Quanity"),
                                                    $("<td>").text("Total")
                                                ),
                                                $("<tbody>")
                                            )

                                            $.each(JSON.parse(v.data),function(k,v){
                                                orderItems.find('tbody').append(
                                                    $("<tr>").append(
                                                        $("<td>").text(v.type == "transaction" ? v.product_name : 'Delivery Fee'),
                                                        $("<td>").text(v.price),
                                                        $("<td>").text(v.quantity),
                                                        $("<td>").text(parseFloat(v.price) * parseFloat(v.quantity)),
                                                    )
                                                )
                                            })
                                        }else if(v.transaction_category == "Payment"){
                                            orderItems                                        
                                            .addClass("table table-borderd")
                                            .append(
                                                $("<thead>")
                                                .append(
                                                    $("<td>").text("OR #"),
                                                ),
                                                $("<tbody>")
                                            )

                                            $.each(JSON.parse(v.data),function(k,v){
                                                orderItems.find('tbody').append(
                                                    $("<tr>").append(
                                                        $("<td>").text(v.ornumber),
                                                    )
                                                )
                                            })
                                        }
                                        else{
                                            orderItems                                        
                                            .addClass("table table-borderd")
                                            .append(
                                                $("<thead>")
                                                .append(
                                                    $("<td>").text("Category"),
                                                    $("<td>").text("Amount"),
                                                    $("<td>").text("Date"),
                                                ),
                                                $("<tbody>")
                                            )

                                            $.each(JSON.parse(v.data),function(key_expense,value_expense){
                                                orderItems.find('tbody').append(
                                                    $("<tr>").append(
                                                        $("<td>").text(value_expense.expense_category),
                                                        $("<td>").text(value_expense.price),
                                                        $("<td>").text(v.transactionDate),
                                                    )
                                                )
                                            })
                                        }
                                    }
                                    $.each(JSON.parse(v.discount_items),function(k,v){
                                        discountItems.append(
                                            $("<li>").addClass("list-group-item d-flex justify-content-between align-items-center list-group-item-action").text(`${v.discount}`)
                                            .append(
                                                $("<span>")
                                                .addClass('badge badge-primary badge-pill')
                                                .text(`${v.percentage}%`)
                                            )
                                        )
                                    })

                                    let discountedPrice = parseFloat(v.amount) - parseFloat(v.discount_amount??0);

                                    overall_discount_amount +=  v.discount_amount > 0 || v.discount_amount != null ?  parseFloat(v.discount_amount) : 0;
                                    overall_cash += parseFloat( v.cash);
                                    if(v.transaction_type == "Cash-in"){
                                        overall_total_price += parseFloat(discountedPrice);
                                    }else if(v.transaction_type == "Cash-out"){
                                        overall_total_price -= parseFloat(discountedPrice);
                                    }
                                   
                                    // overall_total_discounted_price += v.discount_amount > 0 || v.discount_amount != null ? parseFloat(v.discount_amount) : 0;
                                    $("#transaction-table")
                                    .find("tbody").eq(0)
                                    .append(
                                        $("<tr>")
                                            .append(
                                                $("<td>").text(v.transactionid),
                                                $("<td>").append(
                                                    $("<span>")
                                                        .addClass(`${v.transaction_type == "Cash-in" ? 'badge badge-success' : 'badge badge-danger'}`)
                                                        .text(v.transaction_type)
                                                ),
                                                $("<td>").append(
                                                    v.transaction_category
                                                ),
                                                $("<td>").text(v.transactionDate),
                                                $("<td>").append(
                                                    orderItems
                                                ),
                                                $("<td>").text(`${v.discount}%`),
                                                $("<td>").text(v.discount_amount),
                                                $("<td>").append(
                                                    discountItems
                                                ),
                                                // $("<td>").text(v.cash),
                                                // $("<td>").text( v.discount_amount > 0 || v.discount_amount != null ? v.discount_amount : 0 ),
                                                // $("<td>").text(discountedPrice),
                                                $("<td>").text(v.amount),
                                                $("<td>").text(v.note),
                                                $("<td>").append(
                                                    $("<button>")
                                                    .addClass("btn btn-info btn-sm")
                                                    .text("Print")
                                                    .click(function(){
                                                        Swal.fire({
                                                            title: 'Print Receipt',
                                                            html: `
                                                                <div class="row">
                                                                    <div class="col-12 text-left ml-3">
                                                                        <input class="form-check-input" type="checkbox" checked="true" id="showAmount">
                                                                        <label class="form-check-label" for="defaultCheck1">
                                                                            Display Amount
                                                                        </label>
                                                                    </div>
                                                                </div>`,
                                                            preConfirm: () => {
                                                                const showAmount = $('#showAmount').is(':checked');
                                                                
                                                                // if (!ornumber) {
                                                                //     Swal.showValidationMessage(`Please enter or number`);
                                                                // }
                                                                return { showAmount:showAmount };
                                                            },
                                                            
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#3085d6',
                                                            cancelButtonColor: '#d33',
                                                            confirmButtonText: 'Submit'
                                                        }).then((result) => {
                                                        
                                                            if (result.value) {
                                                                pos.display.printReceipt(v.transactionid,result.value.showAmount);
                                                            }
                                                        })

                                                        
                                                    }),
                                                    $("<button>")
                                                    .addClass("btn btn-danger btn-sm ml-2")
                                                    .text("Void")
                                                    .click(function(){
                                                        pos.ajax.generateVoidOTP({
                                                            transactionid:v.transactionid,
                                                            fullName:jsAddon.display.userdata().fullName,
                                                            userid:jsAddon.display.userdata().userid,
                                                            storeid:jsAddon.display.userdata().storeid,
                                                            email:jsAddon.display.userdata().email,
                                                        }).then((data)=>{
                                                            if(data){
                                                                pos.display.showOTPValidationForm(v);
                                                            }
                                                        })
                                                    }),
                                                ),
                                            )
                                    )

                                    if(Object.keys(response.data).length - 1 == k){
                                       

                                        $("#transaction-table")
                                        .find("tfoot").eq(0).find("tr").eq(0).find("th").eq(6).text(overall_discount_amount)
                                        // $("#transaction-table")
                                        // .find("tfoot").eq(0).find("tr").eq(0).find("th").eq(8).text(overall_total_price)
                                        // $("#transaction-table")
                                        // .find("tfoot").eq(0).find("tr").eq(0).find("td").eq(9).text(overall_total_discounted_price)
                                        $("#transaction-table")
                                        .find("tfoot").eq(0).find("tr").eq(0).find("th").eq(8).text(overall_total_price)
                                       
                                        resolve(true)
                                    }
                                })
                            }else{
                                resolve(true)
                            }
                        }
                        
                   
                    })
                     
                }).then(data=>{
                    if(data){
                      
                        jsAddon.display.removefullPageLoader()
                        activeTable = $("#transaction-table").DataTable({});
                    }
                })
            },     
            validateDeleteTranasctionOTP:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:validateDeleteTranasctionOTPApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        resolve(response);
                    })
                })
            },
            voidTranasction:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:voidTranactionApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            pos.ajax.getTransaction();
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            generateVoidOTP:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:generateVoidTranactionOTPApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        resolve(!response._isError)
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            addDelivery:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:addDeliveryApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        resolve(!response._isError)
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            getDraftTransaction:()=>{          
                jsAddon.display.addfullPageLoader()

                $("#draft-transaction-container").empty()
              
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getDraftTransactionApi}`,
                        dataType:'json',
                        payload:{
                            userid:jsAddon.display.userdata().userid,
                            storeid:jsAddon.display.userdata().storeid,
                        }
                    }).then((response)=>{
                        if(response._isError){
                            jsAddon.display.swalMessage(response._isError,response.reason);
                        }else{
                            $.each(response.data,function(k,v){
                                $("#draft-transaction-container").append(
                                    $("<div>")
                                    .addClass("col-2 btn-link")
                                    .attr({
                                        title:`View Draft ${k + 1}`
                                    })
                                    .append(
                                        $("<i>")
                                            .addClass("fa fa-shopping-cart"),
                                        ` Draft ${k + 1}`
                                    ).click(function(){
                                        if(draftransactionid == null){
                                            if(Object.keys(objectMenu).length > 0){

                                                Swal.fire({
                                                    title: 'Save current transaction?',
                                                    text: "Do you want to save your current transction before showing draft transaction",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#3085d6',
                                                    cancelButtonColor: '#d33',
                                                    confirmButtonText: 'Save'
                                                }).then((result) => {
                                                    if (result.value) {
                                                        pos.display.saveAsDraf();
                                                    }else{
                                                        draftransactionid  = v.draftransactionid;
                                                        objectMenu = JSON.parse(v.data);
                                                        discountItems = JSON.parse(v.discount_items);
                                                        $("#cash").val(v.cash)
                                                        displaySelectedMenu();
                                                        pos.display.calculatePOS();
                                                    }
                                                })

                                                
                                            }else{
                                                draftransactionid  = v.draftransactionid;
                                                objectMenu = JSON.parse(v.data);
                                                discountItems = JSON.parse(v.discount_items);
                                                $("#cash").val(v.cash)
                                                displaySelectedMenu();
                                                pos.display.calculatePOS();
                                            }
                                        }else{
                                            draftransactionid  = v.draftransactionid;
                                            objectMenu = JSON.parse(v.data);
                                            discountItems = JSON.parse(v.discount_items);
                                            $("#cash").val(v.cash)
                                            displaySelectedMenu();
                                            pos.display.calculatePOS();
                                        }
                                        
                                    })
                                        
                                )
                            })
                        }
                        jsAddon.display.removefullPageLoader()
              
                    })
                     
                })
            },
            getEndTransaction:()=>{
        

                payload = {
                    date:jsAddon.display.getDate(now),
                    userid:jsAddon.display.userdata().userid,
                    storeid:jsAddon.display.userdata().storeid,
                }
               
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getEndTransactionApi}`,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(response.data.length > 0){
                            $("#btn-end-of-day").addClass("hidden")
                            isEndOfDay = true;
                        }else{
                            $("#btn-end-of-day").removeClass("hidden")
                            isEndOfDay= false;
                        }
                    })
                     
                }).then(data=>{
                   []
                })
            },
            getDiscounts:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getDiscountsApi}?accessKey=${accesskey}`,
                        dataType:'json',
                    }).then((response)=>{
                        resolve(response);
                    })
                     
                })
            },
            deAuth:()=>{
                Swal.fire({
                    title: 'Ready to Leave?',
                    text: "Select (Logout) below if you are ready to end your current session.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Logout'
                }).then((result) => {
                    return new Promise((resolve,reject)=>{
                        jsAddon.display.addfullPageLoader();
                        jsAddon.display.ajaxRequest({
                            type:'post',
                            url:deautnApi,
                            dataType:'json',
                        }).then((response)=>{
                            if(!response._isError){
                                localStorage.clear();
                                setTimeout(() => {
                                    window.location.href = baseUrl;
                                }, 2000);
                            }
                        })
                         
                    })
                })
            },

        },
        display:{
            showDeliverFeeForm:()=>{
                if(Object.keys(objectMenu).length == 0){
                    jsAddon.display.swalMessage(true,"No transaction need to add delivery info");return false;
                }
        
                let date = now;
                Swal.fire({
                    title: 'Add delivery info',
                    html: `
                        <div>
                            <div class="input-group mb-3 col-12">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" id="inputGroup-sizing-default">Customer</span>
                                </div>
                                <select type="text" class="form-control form-control-lg" id="deliver-customerid" name="deliver-customerid" aria-describedby="store"></select>
                            </div>
                        </div>
                        <div>
                            <div class="input-group mb-3 col-12">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" id="inputGroup-sizing-default">Contact #</span>
                                </div>
                                <input class="form-control form-control-lg" type="text" name="delivery-contact" id="delivery-contact">
                            </div>
                        </div>
                        <div>
                            <div class="input-group mb-3 col-12">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" id="inputGroup-sizing-default">Delivery Address</span>
                                </div>
                                <input class="form-control form-control-lg" type="text" name="delivery-address" id="delivery-address">
                            </div>
                        </div>
                        <div>
                            <div class="input-group mb-3 col-12">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" id="inputGroup-sizing-default">Delivery Price</span>
                                </div>
                                <input class="form-control form-control-lg" type="text" name="delivery-price" id="delivery-price">
                            </div>
                        </div>
                        <div>
                            <div class="input-group mb-3 col-12">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" id="inputGroup-sizing-default">Delivery Date</span>
                                </div>
                                <input class="form-control form-control-lg" type="date" name="delivery-date" id="delivery-date">
                            </div>
                        </div>
                        <div>
                            <div class="input-group mb-3 col-12">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" id="inputGroup-sizing-default">Delivery Note</span>
                                </div>
                                <textarea class="form-control form-control-lg" name="delivery-note" id="delivery-note"></textarea>
                            </div>
                        </div>`,
                    didOpen:()=>{
                        $("#deliver-customerid").empty()
                        new Promise((resCustomer,rejCustomer)=>{
                          $.each(customerData,function(k,v){
                              $("#deliver-customerid").append(
                                  $("<option>")
                                      .attr({
                                          value:v.customerid,
                                          'data-extra':JSON.stringify(v),
                                      })
                                      .text(v.name)
                              )
                              if(Object.keys(customerData).length - 1 == k){
                                  resCustomer(true);
                              }
                              
                          })
                        }).then(()=>{
                          $("#deliver-customerid").select2({
                            placeholder: 'Select or Enter an customer',
                            tags: true,
                            createTag: function(params) {
                                var term = $.trim(params.term);
                    
                                if (term === '') {
                                    return null;
                                }
                    
                                // Return a custom object for the new tag
                                return {
                                    id: term,
                                    text: term,
                                    newTag: true // Add a custom property to identify new tags
                                };
                            }
                          })
                          
                          $('#deliver-customerid').on('select2:select', function(e) {
                            var value = $(this).val();
                            var data = e.params.data; // Get the selected data
                            var selectedOption = $(this).find('option:selected');
                            var extraData = selectedOption.data('extra'); // Get the custom data attribute

                            console.log('Selected item:', data);
                            console.log('Extra data:', extraData);


                            $("#delivery-contact")
                            .attr({
                                readonly:!data.newTag,
                            })
                            .val(data.newTag ? '' : extraData.contact_number)
                                
                            $("#delivery-address")
                            .attr({
                                readonly:!data.newTag,
                            })
                            .val( data.newTag ? '' : extraData.address)

                            // Custom logic based on selected item
                            // alert('You selected: ' + data.text + '\nExtra data: ' + );
                        });
                          
                        })
                    },
                    preConfirm: () => {
                        const delivery_name          = $('#deliver-customerid').find('option:selected').text();
                        const delivery_customerid   = Swal.getPopup().querySelector('#deliver-customerid').value;
                        const delivery_date         = Swal.getPopup().querySelector('#delivery-date').value;
                        const delivery_note         = Swal.getPopup().querySelector('#delivery-note').value;
                        const delivery_contact      = Swal.getPopup().querySelector('#delivery-contact').value;
                        const delivery_address      = Swal.getPopup().querySelector('#delivery-address').value;
                        const price                 = Swal.getPopup().querySelector('#delivery-price').value;
                       
  
                        
                        if (!delivery_customerid) {
                            Swal.showValidationMessage(`Please enter customer`);
                        }
                        else if (!delivery_date) {
                            Swal.showValidationMessage(`Please enter delivery date`);
                        }
                        else if (!delivery_note) {
                            Swal.showValidationMessage(`Please enter delivery note`);
                        }
                        else if (!delivery_contact) {
                            Swal.showValidationMessage(`Please enter delivery contact`);
                        }
                        else if (!delivery_address) {
                            Swal.showValidationMessage(`Please enter delivery address`);
                        }
                        else if (!price) {
                            Swal.showValidationMessage(`Please enter delivery price`);
                        }
                        else{
                            return { 
                                delivery_customerid: delivery_customerid,
                                delivery_date:delivery_date,
                                delivery_note:delivery_note,
                                price:price,
                                delivery_contact:delivery_contact,
                                delivery_address:delivery_address,
                                delivery_name:delivery_name
                            };
                        }
                       
                    },
                    
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Submit'
                  }).then((result) => {
                    if (result.value) {
                        let delivery_id = pos.display.getDeliveryId();
                        objectMenu[delivery_id] = {
                            type:'delivery',
                            delivery_id:delivery_id,
                            delivery_customerid:result.value.delivery_customerid,
                            delivery_date:result.value.delivery_date,
                            delivery_note:result.value.delivery_note,
                            delivery_contact:result.value.delivery_contact,
                            delivery_address:result.value.delivery_address,
                            delivery_name:result.value.delivery_name,
                            quantity:1,
                            price:result.value.price,
                        }
                        displaySelectedMenu()
                        pos.display.calculatePOS();
                    }
                  })
            },
            getDeliveryId:()=>{
                const now = new Date();

                // Get individual components
                const year = now.getFullYear(); // 2024
                const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1. Pad to 2 digits.
                const day = String(now.getDate()).padStart(2, '0'); // Pad day to 2 digits
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                
                // Format date and time
                const formattedDate = `${year}${month}${day}`; // e.g., "2024-09-04"
                const formattedTime = `${hours}${minutes}${seconds}`; // e.g., "12:34:56"
                return `delivery-${formattedDate}${formattedTime}`
            },
            getExpenseId:()=>{
                const now = new Date();

                // Get individual components
                const year = now.getFullYear(); // 2024
                const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1. Pad to 2 digits.
                const day = String(now.getDate()).padStart(2, '0'); // Pad day to 2 digits
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                
                // Format date and time
                const formattedDate = `${year}${month}${day}`; // e.g., "2024-09-04"
                const formattedTime = `${hours}${minutes}${seconds}`; // e.g., "12:34:56"
                return `delivery-${formattedDate}${formattedTime}`
            },
            addTransactionButtons:()=>{
                $("#transactions-button").empty();
                if(Object.keys(objectMenu).length > 0){
                    $("#transactions-button").append(
                        $("<button>")
                        .addClass("btn btn-sm btn-outline-info col")
                        .append(
                            $("<i>").addClass("fa-solid fa-shipping-fast"),
                            ` Deliver`
                        ).click(function(){
                            pos.display.showDeliverFeeForm();
                        })
                    )
                }else{
                    $("#transactions-button").empty();
                }
            },
            addObjectMenuItem:(data)=>{
               
                
                if(!objectMenu.hasOwnProperty(data.value.stockid)){
                    objectMenu[data.value.stockid] = {
                        type:'transaction',
                        stockid:data.value.stockid,
                        product_name:data.value.product_name,
                        price:data.value.selling_price,
                        total_price:data.value.selling_price,
                        quantity:data.quantity,
                        unit:data.value.unit,
                        abbreviations:data.value.abbreviations,
                        productType:data.value.productType,
                    }
                }else{
                    let newPrice = parseFloat(objectMenu[data.value.stockid].total_price);
                    let newName = `${data.value.product_name} x(${newPrice / data.value.selling_price})`
                    let newQuantity = parseFloat(objectMenu[data.value.stockid].quantity) + parseFloat(data.quantity);
    
                    objectMenu[data.value.stockid] = {
                        type:'transaction',
                        stockid:data.value.stockid,
                        product_name:newName,
                        price:data.value.selling_price,
                        total_price:newPrice.toString(),
                        quantity:newQuantity,
                        unit:data.value.unit,
                        abbreviations:data.value.abbreviations,
                        productType:data.value.productType,
                    }
                }
            },
            updateObjectMenu:(data)=>{
                if(!objectMenu.hasOwnProperty(data.value.stockid)){
                    objectMenu[data.value.stockid] = {
                        type:'transaction',
                        stockid:data.value.stockid,
                        product_name:data.value.product_name,
                        price:data.value.price,
                        total_price:data.value.price,
                        quantity:data.quantity,
                        unit:data.value.unit,
                        abbreviations:data.value.abbreviations,
                        productType:data.value.productType
                    }
                }else{
                    let newPrice = parseFloat(objectMenu[data.value.stockid].total_price) + parseFloat(data.value.selling_price);
                    let newName = `${data.value.product_name} x(${newPrice / data.value.price})`
                    objectMenu[data.value.stockid] = {
                        type:'transaction',
                        stockid:data.value.stockid,
                        product_name:newName,
                        price:data.value.price,
                        total_price:newPrice.toString(),
                        quantity:data.quantity,
                        unit:data.value.unit,
                        abbreviations:data.value.abbreviations,
                        productType:data.value.productType
                    }
                }
            },
            addToCart:()=>{
            // if ($('#searchProducts').hasClass('show') && currentRowIndex != null) {
                if ( currentRowIndex != null ) {
                        
                    let v = JSON.parse(selectedStack);
                    let value = stockData.find(p => p.stockid === v.stockid);
                    const image = value.image != "" ? `${baseApiUrl}/uploads/product/${value.productid}/${value.image}` : 'https://th.bing.com/th/id/OIP.n0lQ1Wu8fn90-UEDS6-FBAHaGv?w=197&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7';
                    (async () => {
                        Swal.fire({
                            title: "Add to Cart",
                            html: `
                                        <div class="">
                                        <div class="row">
                                            <div class="col-6 text-center">
                                                <img src="${image}" alt="Product Image" class="product-image">
                                            </div>
                                            <div class="col-6 text-left">
                                                <div>
                                                    <b class="product-type">Name: </b>
                                                    <span>${value.product_name}</span>
                                                </div>
                                                <div>
                                                    <b class="product-type">Type: </b>
                                                    <span>${value.productType}</span>
                                                </div>
                                                <div>
                                                    <b class="product-type">Supplier: </b>
                                                    <span>${value.companyName}</span>
                                                </div>
                                                <div>
                                                    <b class="product-type">Price: </b>
                                                    <span>${jsAddon.display.formatNumber(parseFloat(value.selling_price))}</span>
                                                </div>
                                                <div>
                                                    <b class="product-type">Quantity: </b>
                                                    <span>${parseFloat(value.total)}</span>
                                                </div>
                                                <div>
                                                    <b class="product-type">Unit: </b>
                                                    <span>${value.unit} (${value.abbreviations})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div><br>
                                     <div class="col-12 text-left">
                                        <b class="product-type">Description: </b>
                                        <span>${value.description??'N/A'}</span>
                                    </div><br>
                                    <div class="col-12 text-left">
                                        <input id="quantity" class="form-control form-control-lg swal2-input-product" placeholder="Enter quantity">
                                        <br>
                                        <h4 id="prod-subtotal">Sub Total : 0</h4>
                                    </div>
                            `,
                            showCancelButton: true,
                            confirmButtonText: 'Submit',
                            cancelButtonText: 'Cancel',
                            focusConfirm: false,
                            allowEnterKey: true,
                            didOpen: () => {
                                const input = document.querySelector('#quantity');
                                const confirmButton = Swal.getConfirmButton();
                        
                                input.addEventListener('keydown', function(e) {
                                    if (e.key === 'Enter') {
                                    e.preventDefault(); // Prevent default Enter key action
                                    confirmButton.click(); // Trigger confirm button click
                                    }
                                });
                            },
                            preConfirm: () => {
                                const quantity = Swal.getPopup().querySelector('#quantity').value;
                    
                                if (!quantity) {
                                    Swal.showValidationMessage(`Please enter quantity`);
                                }
                                if(parseInt(value.total) < parseInt(quantity)){
                                    Swal.showValidationMessage(`You enter ${quantity} available stack is ${value.total} only`);
                                }
                                return { quantity: quantity };
                            }
                        }).then((result) => {
                            let quantity = result.value.quantity;
        
                            if (quantity) {
                                if($("#transaction-header").find("span.fa-trash").length <= 0){
                                    $("#transaction-header")
                                    .append(
                                        $("<span>")
                                        .addClass("fa fa-trash text-danger float-right")
                                        .attr({
                                            title:'Remove all'
                                        })
                                        .css({
                                            'cursor':'pointer'
                                        })
                                        .click(function(){
    
    
                                            Swal.fire({
                                                title: 'Are you sure?',
                                                text: `Remove all`,
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#3085d6',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'Yes, remove it!'
                                            }).then((result) => {
                                                if (result.value) {
                                                    $('#selected-menu-list').fadeOut(500,function(){
                                                        $("#selected-menu-list").empty();
                                                        subtotal            = 0 ;
                                                        discount            = 0 ;
                                                        total               = 0 ;
                                                        discountPercentage  = 0;
                                                        canSubmit           = false;
                                                        note                = '';
                                                        discountItems       = {};
                                                        objectMenu          = {},   
                                                        pos.display.calculatePOS();
                                                    
                                                        $('#selected-menu-list').show()
                                                    })
                                                    $("#transaction-header").find("span.fa-trash").remove();
                                                }
                                            })
    
                                        })
                                    )
                                }
                                
                                pos.display.addObjectMenuItem({
                                    value:value,
                                    quantity:quantity
                                })
    
    
                                displaySelectedMenu();
                                pos.display.calculatePOS();
                            }
                            // canAddToCartOnEnter= false;
                            setTimeout(() => {
                                jsAddon.display.swalMessage(false,'New item is added to cart')
                            }, 500);
                        });
                    })()
                }
            },
            displayDimensionConvesion:(selectedValue)=>{
                let totalBoardFeet = (selectedValue.quantity * selectedValue.size) - selectedValue.used_total;
                let length = 0;
                let width = 0;
                let thickness = 0;
                let materialid = selectedValue.materialid;
                Swal.fire({
                    title: 'Dimension Conversion',
                    html: `
                        <div class="mb-3">
                            <div class="text-left"><b>Size: </b> ${selectedValue.size} ${selectedValue.unit}</div>
                            <div class="text-left"><b>Quantity: </b> ${selectedValue.quantity}</div>
                            <div class="text-left"><b>Total: </b> ${totalBoardFeet} ${selectedValue.unit}</div>
                            <div class="text-left"><b>Price per ${selectedValue.unit}: </b> ${(selectedValue.selling_price / selectedValue.size).toFixed(2)}</div>
                        </div>
                        <div class="form-group">
                            <label for="c_productid" class="float-left">Product #</label>
                            <select class="form-control form-control-lg dimension-size" id="c_productid" name="c_productid" aria-describedby="c_productid">
                            
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="conversion_unit" class="float-left">Unit</label>
                            <select class="form-control form-control-lg" id="conversion_unit" name="conversion_unit" aria-describedby="conversion_unit">
                            
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="quantity" class="float-left">Quantity</label>
                            <input type="number" id="c_quantity" name="c_quantity" class="form-control dimension-size" placeholder="Enter quantity" required min="1">
                        </div>
                        <div class="form-group">
                            <label for="c_description" class="float-left">Description</label>
                            <textarea class="form-control form-control-lg" name="c_description" id="c_description"></textarea>
                        </div>
                        
                        <div id="conversion-calculation">
                        </div>
                    `,
                    /**
                     * sample :  2x3x12
                     * 
                     * Board feet
                     * bd.ft =   wxtxl
                     *         ----------
                     *             12
                     *       = 2x3x12
                     *         -------
                     *           12
                     *        = 6bd.ft ( x 40 price/bd.ft ) 
                     *        = Price:  240
                     */
                    focusConfirm: false,
                    preConfirm: () => {
                        const c_productid           = document.getElementById('c_productid').value;
                        const conversion_unit       = document.getElementById('conversion_unit').value;
                        const conversion_quantity   = document.getElementById('c_quantity').value;
                        const c_description         = document.getElementById('c_description').value;


                        
                        let selected = $("#c_productid").find("option:selected")
                        let value = selected.data("value");
                        
                        length = value.length;
                        width = value.width;
                        thickness = value.thickness; 


                        const bf = (parseFloat(length) * parseFloat(width) * parseFloat(thickness)) / 12;
                        const bfFixed = isNaN(bf) ? 0 : bf.toFixed(2);
                        
                        

                        if (c_productid  == "") {
                            Swal.showValidationMessage('Please select a product');
                        }
                        else if(totalBoardFeet <= bfFixed){
                            Swal.showValidationMessage(`Please enter ${selectedValue.unit} not more than ${bfFixed}`);
                        }
                        else if (conversion_quantity == "") {
                            Swal.showValidationMessage('Please enter quantity');
                        }
                        else if ( c_description == "") {
                            Swal.showValidationMessage('Please enter valid description');
                        }
                        else if ( conversion_unit == "") {
                            Swal.showValidationMessage('Please enter valid unit');
                        }
                        return { conversion_quantity,c_description,conversion_unit,c_productid };
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Convert',
                    cancelButtonText: 'Cancel',
                }).then((result) => {
                    if (result.isConfirmed) {
                       
                        const { conversion_quantity,c_description,conversion_unit,c_productid } = result.value;


                       
                        pos.ajax.boardFeetToDimensions({
                            'materialid':materialid,
                            'length':length,
                            'width':width,
                            'thickness':thickness,
                            'price':(selectedValue.selling_price / selectedValue.size).toFixed(2),
                            'quantity':conversion_quantity,
                            'description':c_description,
                            'unitid':conversion_unit,
                            'productid':c_productid
                        })

                       
                    }
                });
                pos.ajax.getProductsWConversion({productTypeId:selectedValue.productTypeId},selectedValue.productid,selectedValue.productTypeId);
                pos.ajax.getConvertionMaterialUnit();
                
            },
            displayConvesion:()=>{
                $("#convertion-container tbody").empty();
    
                let v = JSON.parse(selectedConvedtionStack);
                let value = stockData.find(p => p.stockid === v.stockid);
                let stockid = value.stockid;
                pos.ajax.getStockConversion({
                    stockid:stockid
                }).then(()=>{
                    $(".modal").modal("hide");

                    $.each(conversionData,function(k,v){
                        $("#convertion-container tbody").append(
                            $("<tr>").append(
                                $("<td>").text(v.product_name),
                                $("<td>").text(v.productType),
                                $("<td>").text(v.conversion_price),
                                $("<td>").text(v.abbreviations),
                                $("<td>").append(
                                    $("<button>")
                                        .addClass("btn btn-success")
                                        .text("Convert")
                                        .click(function(){
                                            Swal.fire({
                                                title: 'Convert Items',
                                                html: `
                                                    <label for="quantity" class="mb-1 float-left">Conversion Details</label>
                                                    <div class="form-group text-left">
                                                        <table class="table table-bordered table-sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>Item</th>
                                                                    <th>From</th>
                                                                    <th>To</th>
                                                                </tr>
                                                            </thead>
                                                            </tbody>
                                                                <tr>
                                                                    <td>Unit</td>
                                                                    <td>${v.stock_unit_abbreviations}</td>
                                                                    <td>${v.abbreviations}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Price</td>
                                                                    <td>Per ${v.stock_unit_abbreviations} - ${v.selling_price}</td>
                                                                    <td>Per ${v.abbreviations} -${v.conversion_price}</td>
                                                                </tr>
                                                                                                                                <tr>
                                                                    <td>Conversion</td>
                                                                    <td>1 ${v.stock_unit_abbreviations}</td>
                                                                    <td>${v.conversion} ${v.abbreviations}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div class="form-group">
                                                        <label for="quantity" class="mb-1 float-left">Quantity</label>
                                                        <input type="number" data-value='${JSON.stringify(v)}' id="conversion_quantity" name="conversion_quantity" class="form-control" placeholder="Enter quantity base from ${v.stock_unit_abbreviations}" min="1" required>
                                                    </div>
                                                    <div>
                                                     <b class="mb-1 float-left">Conversion Calculation: </b>
                                                    </div>
                                                    <div id="stock-conversion-details" class="row">

                                                    </div>
                                                `,
                                                focusConfirm: false,
                                                showCancelButton: true,
                                                confirmButtonText: 'Submit',
                                                preConfirm: () => {

                                                    let usedStocks = 0;
                                                    if(objectMenu.hasOwnProperty(v.stockid)){
                                                        usedStocks = objectMenu[v.stockid].quantity;
                                                    }
                                                    let Instock = v.total - usedStocks;
                                                    
                                                    const conversion_quantity = Swal.getPopup().querySelector('#conversion_quantity').value;
                                                    if (!conversion_quantity || conversion_quantity < 1) {
                                                        Swal.showValidationMessage('Please enter a valid quantity');
                                                    }
                                                    if(conversion_quantity > Instock){
                                                        Swal.showValidationMessage(`Please enter a quantity not greater than ${Instock}`);
                                                    }
                                                    return conversion_quantity;
                                                }
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    const conversion_quantity = result.value;
                                                    // Swal.fire(`You entered: ${quantity}`);

                                                    pos.ajax.convertStock({
                                                        'conversionid':v.conversionid,
                                                        'quantity':conversion_quantity,
                                                        'description':`Converted stock from ${v.stock_unit_abbreviations} to ${v.abbreviations}`,
                                                    })
                                                    
                                                    // You can handle the quantity value here
                                                }
                                            });
                                        })
                                ),
                            )
                        )
                        if(Object.keys(conversionData).length - 1 == k){
                            $("#convertion-loading").remove();
                            $("#convertion-container").parent().removeClass("hidden")
                        }
                    })

                    $("#displayConvertion").modal("show");
                })
            },
            showOTPValidationForm:(v)=>{
                (async () => {
                    Swal.fire({
                        title: "Void Transaction",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        allowEnterKey: false,
                        html: `
                            <div class="row">
                                <div class="col-12 text-left">
                                    <h4>Please enter OTP</h4>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="input-group mb-3 col-12">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text" id="inputGroup-sizing-default">OTP Code</span>
                                    </div>
                                    <input id="otp" class="form-control" placeholder="Enter OTP">
                                </div>
                            </div>
                        `,
                        showCancelButton:true,
                        focusConfirm: false,
                        preConfirm: async () => {
                            const otp = Swal.getPopup().querySelector('#otp').value;
                            
                            if (!otp) {
                                Swal.showValidationMessage(`Please enter otp`);
                                return false;
                            }

                            return new Promise((resolve,reject)=>{
                                pos.ajax.validateDeleteTranasctionOTP({
                                    otp:otp,
                                    transactionid:v.transactionid,
                                    userid:jsAddon.display.userdata().userid,
                                    storeid:jsAddon.display.userdata().storeid,
                                }).then((data)=>{
                                    if(data._isError){
                                        Swal.showValidationMessage(data.reason);
                                        resolve(false);
                                    }else{
                                        resolve({ otp: otp });
                                    }
                                })
                            })
                            
                            
                        }
                    }).then((result) => {
             
                        otp = result.value.otp;
                        let payload = {
                            otp:otp,
                            userid:jsAddon.display.userdata().userid,
                            storeid:jsAddon.display.userdata().storeid,
                            transactionid:v.transactionid
                        }
                        pos.ajax.voidTranasction(payload);
                    });
                })()
            },
            printReceipt:(data,showAmount)=>{
                data = btoa(JSON.stringify(data));
                window.open(`${baseApiUrl}/generate/sreceipt?showPrice=${showAmount}&data=${data}`, '_blank');
            },
            displayProductListWithConvertion:() => {
                // if ($.fn.DataTable.isDataTable("#product-container")) {
                //     activeTable.clear();
                //     activeTable.destroy();
                //     $("#product-container tbody").displayMaterialsempty();
                // }
                $("#product-container-w-convertion tbody").empty();
                console.log(`stockDataWithConvertion : ${stockDataWithConvertion}`)
                if(stockDataWithConvertion != null && stockDataWithConvertion != ""){
                    
                    $.each(stockDataWithConvertion,function(key,value){
                        let usedStocks = 0;
                        if(objectMenu.hasOwnProperty(value.stockid)){
                            usedStocks = objectMenu[value.stockid].quantity;
                        }

                    
        
                        $("#product-container-w-convertion tbody").append(
                            $("<tr>")
                            .attr({
                                id:`product-menu-convertion-${value.stockid}`,
                                'data-stack':JSON.stringify(value)
                            })
                            .click(function(){
                                selectedConvedtionStack = JSON.stringify(value);
                                currentConvertionRowIndex = $(this).index();
                                $('#product-container-w-convertion tbody tr.table-secondary').removeClass("table-secondary");
                                $('#product-container-w-convertion tbody tr').eq(currentConvertionRowIndex).addClass('table-secondary');
                            })
                            .dblclick(function(){
                                // if(value.isConvertable == true){
                                //     pos.display.displayDimensionConvesion(value)
                                // }else{
                                
                                // }
                                pos.display.displayConvesion()
                            })
                            .append(
                                $("<td>").text(key + 1),
                                $("<td>").text(value.productCode),
                                $("<td>").text(value.product_name),
                                $("<td>").text(value.productType),
                                $("<td>").text(value.selling_price),
                                $("<td>").text(`${value.unit} (${value.abbreviations})`),
                                $("<td>").text(`${value.size == null ? value.total - usedStocks : (value.total - usedStocks).toFixed(2)}`),
                            )
                        )

                        if(Object.keys(stockDataWithConvertion).length - 1 == key){
                            $("#menu-convertion-loading").remove();
                            $("#product-container-w-convertion").parent().removeClass("hidden")
                        }

                        
                    })
                }else{
                    $("#menu-convertion-loading").remove();
                    $("#product-container-w-convertion").parent().removeClass("hidden")
                }
            },
            displayMaterials:() => {
                // if ($.fn.DataTable.isDataTable("#product-container")) {
                //     activeTable.clear();
                //     activeTable.destroy();
                //     $("#product-container tbody").empty();
                // }
                $("#material-container tbody").empty();
                if(materialsData != null){
                    $.each(materialsData,function(key,value){
                    
        
                        $("#material-container tbody").append(
                            $("<tr>")
                            .attr({
                                id:`product-menu-convertion-${value.stockid}`,
                                'data-stack':JSON.stringify(value)
                            })
                            .click(function(){
                                selectedConvedtionStack = JSON.stringify(value);
                                currentConvertionRowIndex = $(this).index();
                                $('#material-container tbody tr.table-secondary').removeClass("table-secondary");
                                $('#material-container tbody tr').eq(currentConvertionRowIndex).addClass('table-secondary');
                            })
                            .dblclick(function(){
                                pos.display.displayDimensionConvesion(value)
                            })
                            .append(
                                $("<td>").text(key + 1),
                                $("<td>").text(value.productCode),
                                $("<td>").text(value.product_name),
                                $("<td>").text(value.productType),
                                $("<td>").text(value.selling_price),
                                $("<td>").text(`${value.unit} (${value.abbreviations})`),
                                $("<td>").text(`${value.size == null ? value.total  : parseFloat(value.total - value.used_total).toFixed(2)}`),
                            )
                        )

                        if(Object.keys(materialsData).length - 1 == key){
                            $("#material-loading").remove();
                            $("#material-container").parent().removeClass("hidden")
                        }

                        
                    })
                }else{
                    $("#material-loading").remove();
                    $("#material-container").parent().removeClass("hidden")
                }
            },
            displayProductList:() => {
                // if ($.fn.DataTable.isDataTable("#product-container")) {
                //     activeTable.clear();
                //     activeTable.destroy();
                //     $("#product-container tbody").empty();
                // }
                $("#product-container tbody").empty();
                $.each(stockData,function(key,value){
                    let usedStocks = parseFloat(value.used_quantity);
                    if(objectMenu.hasOwnProperty(value.stockid)){
                        usedStocks += parseFloat(objectMenu[value.stockid].quantity);
                    }

                    
       
                    $("#product-container tbody").append(
                        $("<tr>")
                        .attr({
                            id:`product-menu-${value.stockid}`,
                            'data-stack':JSON.stringify(value)
                        })
                        .click(function(){
                            selectedStack = JSON.stringify(value);
                            currentRowIndex = $(this).index();
                            $('#product-container tbody tr.table-secondary').removeClass("table-secondary");
                            $('#product-container tbody tr').eq(currentRowIndex).addClass('table-secondary');
                        })
                        .dblclick(function(){
                            selectedStack = JSON.stringify(value);
                            pos.display.addToCart()
                        })
                        .append(
                            $("<td>").text(key + 1),
                            $("<td>").text(value.productCode),
                            $("<td>").text(value.product_name),
                            $("<td>").text(value.productType),
                            $("<td>").text(value.selling_price),
                            $("<td>").text(value.companyName),
                            $("<td>").text(value.dateCreated.split(" ")[0]),
                            $("<td>").text(`${value.unit} (${value.abbreviations})`),
                            $("<td>").text(`${value.size == null ? value.total - usedStocks : (value.total - usedStocks).toFixed(2)}`),
                        )
                    )

                    if(Object.keys(stockData).length - 1 == key){
                        $("#menu-loading").remove();
                        $("#product-container").parent().removeClass("hidden")
                    }

                    
                })
            },
            addDiscount:()=>{
                discount = parseFloat($("#discount-amount").val());
                pos.display.calculatePOS()
                .then(data=>{
                    $("#addDiscount").modal("hide")
                })
            },
            calculatePOS:()=>{
                return new Promise((res,rej)=>{
                    subtotal = 0;
                    discountPercentage = 0;
                    discount_amount = 0;
                    total = 0;
                    change = 0;
                    $.each(objectMenu,function(dk,dv){
                        subtotal += parseFloat(dv.price) * dv.quantity;
                        if(dv.type == 'transaction'){
                            updateInStack(dv.quantity);
                        }
                    })
                   
                    

                    $.each(discountItems,function(disk,disv){
                        discountPercentage += parseFloat(disv.percentage);
                    })
                  

                    discountDecimal     = discountPercentage/ 100;
                    discount_amount  =  subtotal > 0 ? ((subtotal * discountDecimal)).toFixed(2) : 0;
                    total           = discount_amount < subtotal ? (subtotal - discount_amount).toFixed(2) : 0 ;
                    change          = (cash - total)

                    if(isNaN(change)){
                        change = 0.00;
                    }
                    
                    if(isNaN(discount_amount)){
                        discount_amount = 0.00;
                    }
                    if(isNaN(discount_amount)){
                        subtotal = 0.00;
                    }

                    if(isNaN(total)){
                        total = 0.00;
                    }

                    if(change >= 0 && total > 0){
                        canSubmit = true;
                    }else{
                        canSubmit = false;
                    }
                    

                    
                    $("#subtotal")
                        .text(subtotal.toFixed(2))
                    $("#cash-label")
                        .text(cash.toFixed(2))
                    $("#discount")
                        .text(`${discount}%`)
                    $("#change")
                        .text(change)
                    $("#discount-amount")
                        .text(discount_amount)
                    $("#total")
                        .text( total )
                    
                    res(true);
                }).then(()=>{
                    pos.display.addTransactionButtons()
                })
            },
            emptyAll:()=>{
                if(Object.keys(objectMenu).length <= 0){
                    jsAddon.display.swalMessage(true,"No transaction to cancel");
                    return false;
                }
                Swal.fire({
                    title: 'Are you sure?',
                    text: `Cancel transaction`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, cancel it!'
                }).then((result) => {
                    if (result.value) {
                        total               = 0;
                        discount_amount      = 0;
                        subtotal            = 0;
                        discount            = 0;
                        objectMenu          = {};
                        discountPercentage  = 0;
                        discountItems       = {};
                        cash                = 0;
                        canSubmit           = 0;
                        note                = '';
                        $("#cash")
                            .val("")
                        $("#subtotal")
                            .text("0.00")
                        $("#subtotal")
                            .text("0.00")
                        $("#discount")
                            .text('0.00')
                        $("#change")
                            .text('0.00')
                        $("#discount-amount")
                            .text('0.00')
                        $("#total")
                            .text('0.00')
                        pos_table.empty();
                        pos_message.empty();
                        $("#transaction-header").find("span.fa-trash").remove();
                    }
                })
            },
            saveAsDraf:()=>{

                if(Object.keys(objectMenu).length == 0){
                    jsAddon.display.swalMessage(true,"No transaction need to save as draft");return false;
                }

                Swal.fire({
                    title: 'Are you sure?',
                    text: `Save as draf current transaction`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, save it!',
                }).then((result) => {
                    if (result.value) {
                        let payload = {
                            accessKey:accesskey,
                            data:JSON.stringify(objectMenu),
                            discount:discountPercentage,
                            discount_amount:discount_amount,
                            discountItems:JSON.stringify(discountItems),
                            userid:jsAddon.display.userdata().userid,
                            storeid:jsAddon.display.userdata().storeid,
                            note:note,
                            cash:cash,
                        }

                        if(draftransactionid != null){
                            payload['draftransactionid'] = draftransactionid
                            pos.ajax.editDraftTransaction(payload)
                            .then(()=>{
                                draftransactionid = null;
                                total               = 0;
                                discount_amount      = 0;
                                subtotal            = 0;
                                discount            = 0;
                                objectMenu          = {};
                                discountPercentage  = 0;
                                discountItems       = {};
                                cash                = 0;
                                canSubmit           = 0;
                                note                = '';
                                $("#cash")
                                    .val("")
                                $("#subtotal")
                                    .text("0.00")
                                $("#subtotal")
                                    .text("0.00")
                                $("#discount")
                                    .text('0.00')
                                $("#change")
                                    .text('0.00')
                                $("#discount-amount")
                                    .text('0.00')
                                $("#total")
                                    .text('0.00')
                                pos_table.empty();
                                pos_message.empty();
                                $("#transaction-header").find("span.fa-trash").remove();
                            })
                        }else{
                            pos.ajax.addDraftTransaction(payload)
                            .then(()=>{
                                draftransactionid   = null;
                                total               = 0;
                                discount_amount      = 0;
                                subtotal            = 0;
                                discount            = 0;
                                objectMenu          = {};
                                discountPercentage  = 0;
                                discountItems       = {};
                                cash                = 0;
                                canSubmit           = 0;
                                note                = '';
                                $("#cash")
                                    .val("")
                                $("#subtotal")
                                    .text("0.00")
                                $("#subtotal")
                                    .text("0.00")
                                $("#discount")
                                    .text('0.00')
                                $("#change")
                                    .text('0.00')
                                $("#discount-amount")
                                    .text('0.00')
                                $("#total")
                                    .text('0.00')
                                pos_table.empty();
                                pos_message.empty();
                                $("#transaction-header").find("span.fa-trash").remove();
                            })
                        }

                            
                       
                        
                    }
                })
            }
        }
    }
    
    $("#add-expenses").click(function(){

        const entries = Object.values(objectMenu);
    
        // Filter entries to find those with type 'transaction'
        const transactions = entries.filter(entry => entry.type === 'transaction');
        
        // Check if there are any filtered entries
        if(transactions.length > 0){
            jsAddon.display.swalMessage(true,"Already have an transation");
            return false;
        }

        let expenseCategoryOption = "";
        $.each(expenseCategoryData,function(k,v){
            expenseCategoryOption += `<option value='${v.expense_category_id }'>${v.expense_categories}</option>`
        })

        Swal.fire({
            title: 'Add Expenses',
            html: `
                <div>
                    <div class="input-group mb-3 col-12">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="inputGroup-sizing-default">Amount</span>
                        </div>
                        <input type="number" class="form-control form-control-lg" name="expense-amount" id="expense-amount"></input>
                    </div>
                    <div class="input-group mb-3 col-12">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="inputGroup-sizing-default">Expense Type</span>
                        </div>
                        <select class="form-control form-control-lg" id="expense-category" name="expense-category" aria-describedby="expense-category">
                        ${expenseCategoryOption}
                        </select>
                    </div>
                    <div class="input-group mb-3 col-12">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="inputGroup-sizing-default">Description</span>
                        </div>
                        <textarea class="form-control form-control-lg" name="description" id="description"></textarea>
                    </div>
                </div>`,
            preConfirm: () => {
                const expenseamount = Swal.getPopup().querySelector('#expense-amount').value;
                const expense_category_id = Swal.getPopup().querySelector('#expense-category').value;
                const description = Swal.getPopup().querySelector('#description').value;
                if (!expenseamount) {
                    Swal.showValidationMessage(`Please enter amount`);
                }
                else if (!expense_category_id) {
                    Swal.showValidationMessage(`Please expense type`);
                }
                else if (!description) {
                    Swal.showValidationMessage(`Please enter description`);
                }else{
                    return { expenseamount:expenseamount,expense_category_id:expense_category_id,description:description };
                }
                
            },
            
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Submit'
          }).then((result) => {
        
            if (result.value) {

                let expense_id = pos.display.getExpenseId();
                let category = $('#expense-category option:selected').text();
                objectMenu[expense_id] = {
                    expense_id:expense_id,
                    type:'expense',
                    expense_category_id:result.value.expense_category_id,
                    description:result.value.description,
                    expense_category:category,
                    quantity:1,
                    price:result.value.expenseamount,
                }
                displaySelectedMenu()
                pos.display.calculatePOS();
            }
          })
    })
    
    $("#btn-end-of-day").click(function(){
        let cash = 0;
        let transactionAmount = 0;
        Swal.fire({
            title: 'Return daily transaction',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, return it!',
            html: `
                <div class="row">
                    <div class="col-12 text-left">
                        <span class="text-muted">Enter cash per pcs</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                         <input id="deno-1k" data-value='1000' class="swal2-input swal-2-input-deno" placeholder="Enter 1000">
                    </div>
                    <div class="col-6">
                         <input id="deno-5h" data-value='500' class="swal2-input swal-2-input-deno" placeholder="Enter 500">
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                         <input id="deno-2h" data-value='200' class="swal2-input swal-2-input-deno" placeholder="Enter 200">
                    </div>
                    <div class="col-6">
                        <input id="deno-1h"  data-value='100' class="swal2-input swal-2-input-deno" placeholder="Enter 100">
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <input id="deno-50" data-value='50' class="swal2-input swal-2-input-deno" placeholder="Enter 50">
                    </div>
                    <div class="col-6">
                       <input id="deno-20" data-value='20' class="swal2-input swal-2-input-deno" placeholder="Enter 20">
                    </div>
                </div>
               
                <div class="row">
                    <div class="col-6">
                         <input id="deno-10" data-value='10' class="swal2-input swal-2-input-deno" placeholder="Enter 10">
                    </div>
                    <div class="col-6">
                         <input id="deno-5" data-value='5' class="swal2-input swal-2-input-deno" placeholder="Enter 5">
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <input id="deno-1" data-value='1' class="swal2-input swal-2-input-deno" placeholder="Enter 1">
                    </div>
                    <div class="col-6">
                       <input id="deno-cent" data-value='.50' class="swal2-input swal-2-input-deno" placeholder="Enter centavous">
                    </div>
                </div>
               
                <h4 id="deno-subtotal">Sub Total : 0</h4>
            `,
            preConfirm: () => {
        
                $.each(denomonation,function(k,v){
                    cash += parseFloat(v.value) * parseFloat(v.pcs);
                })

                $.each(transactions,function(k,v){
                    transactionAmount += parseFloat(v.total_price);
                })

                if(cash != transactionAmount){
                    Swal.showValidationMessage("Return cash in not equal to the transaction amount");
                }
                return { value: true };
            }
            
        }).then((result) => {
            if (result.value) {
                
                pos.ajax.addEndTransaction({
                    end_transaction_date:$("#from-date-transaction").val(),
                    transactions:JSON.stringify(transactions),
                    denomonation:JSON.stringify(denomonation),
                    userid:jsAddon.display.userdata().userid,
                    storeid:jsAddon.display.userdata().storeid,
                    cash:cash,
                });
            }
        })
        
       
    })

    

    $('#create-stock-modal').on('shown.bs.modal', function() {
        pos.ajax.getProductsWithComposition()
        $(document).off('focusin.modal');
    });

    $('#displayConvertion').on('shown.bs.modal', function() {
        $(document).off('focusin.modal');
    });


    $('#searchProducts').on('shown.bs.modal', function() {
        pos.display.displayProductList()
        $(document).off('focusin.modal');
    });

    $('#convertion-modal').on('shown.bs.modal', function() {
        pos.display.displayProductListWithConvertion()
        $(document).off('focusin.modal');
    });

    $('#material-convertion-modal').on('shown.bs.modal', function() {
        pos.display.displayMaterials()
        $(document).off('focusin.modal');
    });

    $('#transaction-history').on('shown.bs.modal', function() {
        pos.ajax.getEndTransaction();
        $(document).off('focusin.modal');
    });

    $("#product-search").on('keyup',function(){
        let searchValue = $(this).val().toLowerCase();
        $('#product-container tbody tr').each(function() {
            let rowText = $(this).text().toLowerCase();
            
            // Check if the row text includes the search value
            if (rowText.indexOf(searchValue) !== -1) {
                $(this).show(); // Show the row
            } else {
                $(this).hide(); // Hide the row
            }
        });
    })
    
    
    pos.init();

    // activeTable.on('draw.dt', function(e, settings) {
    //     $(`#product-container tbody tr.table-secondary`).removeClass("table-secondary");
    // });
    


    $(document).on('keydown', function(e) {
        if (e.key === 'F2') {
            if(isEndOfDay){
                jsAddon.display.swalMessage(true,"Already end of day");
            }else{
                $("#searchProducts").modal("show")
            }
            e.preventDefault(); // Prevent default behavior (if necessary)
        }
        
        if (e.key === "ArrowDown") { // Down arrow key
            if ($('#searchProducts').hasClass('show')) {
                let rows = $('#product-container tbody tr');
               
                if (currentRowIndex < rows.length - 1) {
                    currentRowIndex++;
                    updateSelectedRow();
                }
            }
        } 
        if (e.key === "ArrowUp") { // Up arrow key
            if ($('#searchProducts').hasClass('show')) {
               
                if (currentRowIndex > 0) {
                    currentRowIndex--;
                    updateSelectedRow();
                }
            }
        }

        
        if (e.key === "ArrowDown") { // Down arrow key
            if ($('#convertion-modal').hasClass('show')) {
                let rows = $('#product-container-w-convertion tbody tr');
               
                if (currentConvertionRowIndex < rows.length - 1) {
                    currentConvertionRowIndex++;
                    updateSelectedConvertedRow();
                }
            }
        } 
        if (e.key === "ArrowUp") { // Up arrow key
            if ($('#convertion-modal').hasClass('show')) {
               
                if (currentConvertionRowIndex > 0) {
                    currentConvertionRowIndex--;
                    updateSelectedConvertedRow();
                }
            }
        }

        

        if (e.key === "Enter") {
            if(Swal.isVisible()){
                Swal.getConfirmButton().click(); // Simulate clicking the confirm button
            }else{
                if ($('#searchProducts').hasClass('show') && currentRowIndex > -1 ) {
                    pos.display.addToCart();
                }
            }
          
        }


        if (e.key === "Enter") {
            if(Swal.isVisible()){
                Swal.getConfirmButton().click(); // Simulate clicking the confirm button
            }else{
                if ($('#convertion-modal').hasClass('show') && currentConvertionRowIndex > -1 ) {
                    pos.display.addToCart();
                }
            }
          
        }

    });

    
    $(document).on('change',".swal-2-input-deno", function() {
        $subtotal  = 0 ;
       
        $('.swal-2-input-deno').each(function() {
            let value = $(this).data("value")
            let pcs = $(this).val();
            denomonation[value] = {
                value:value,
                pcs:pcs != "" ? pcs : 0,
            }
            if(pcs != ""){
                $subtotal += parseFloat(value) * parseFloat(pcs);
                $("#deno-subtotal").text(`Sub Total : ${$subtotal}`)
            }
        });

        
        
    })
    $(document).on('change',".swal2-input-product", function() {
        let val = $(this).val()
        let value = JSON.parse(selectedStack);
        let subtotal = parseFloat(val) * parseFloat(value.selling_price);
        $("#prod-subtotal").text(`Sub Total : ${subtotal}`)
        
    })
    function displaySelectedMenu(){
        $("#selected-menu-list").empty();
        $.each(objectMenu,function(key,value){

            if(value.type == 'transaction'){
                $("#selected-menu-list")
                .append(
                    $("<tr>")
                        .append(
                            $("<td>")
                                .text(`${value.product_name} (${value.productType})`),
                            $("<td>")
                                .append(
                                    $("<span>")
                                    .text(value.price),
                                ),
                            $("<td>")
                            .append(
                                $("<span>")
                                .text(value.quantity),
                            ),
                            $("<td>")
                            .append(
                                $("<span>")
                                .text(`${value.unit} (${value.abbreviations})`),
                            ),
                            $("<td>")
                            .append(
                                $("<span>")
                                .text(parseFloat(value.price) * parseFloat(value.quantity)),
                            ),
                            $("<td>")
                                .addClass("float-right")
                                .append(
                                    $("<button>")
                                    .addClass("text-success btn btn-link")
                                    .attr({'title':`Update ${value.product_name}`})
                                    .css({'cursor':'pointer',})
                                    .append(
                                        $("<i>").addClass("fa fa-pen")
                                    )
                                    .click(function(){
                                    
                                        var data = objectMenu[value.stockid];
                                        $this = $(this);
                                        
                                        (async () => {
                                            const { value: quantity } = await Swal.fire({
                                                title: `Update Cart ${value.product_name}`,
                                                input: "text",
                                                inputLabel: "Quantity",
                                                inputValue:data.quantity,
                                                inputPlaceholder: "Enter quantity"
                                            });
                                            if (quantity) {
                                                    pos.display.updateObjectMenu({
                                                        value:value,
                                                        quantity:quantity
                                                    });
                                                    
                                                    $this.parents("tr").find('td:eq(2)').text(quantity)
                                                    $this.parents("tr").find('td:eq(3)').text(value.price * quantity)
                                                    pos.display.calculatePOS();
                                                }
                                            })()
                                    }),
                                    $("<button>")
                                    .addClass("text-danger btn btn-link")
                                    .attr({'title':`Remove ${value.product_name}`})
                                    .css({'cursor':'pointer',})
                                    .append(
                                        $("<i>").addClass("fa fa-trash")
                                    )
                                    .click(function(){
                                        // console.log("objectMenu",objectMenu);return false;
                                        Swal.fire({
                                            title: 'Are you sure?',
                                            text: `Remove item ${value.product_name} item (${$(this).parents("li").index() + 1})`,
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'Yes, remove it!'
                                        }).then((result) => {
                                            if (result.value) {
                                                let _this = $(this).parents("tr");
                                                let total = objectMenu[value.stockid].selling_price * objectMenu[value.stockid].quantity;
                                            
                                                if(objectMenu[value.stockid].total_price > total){
                                                    objectMenu[value.stockid].total_price = parseFloat(objectMenu[value.stockid].total_price) - total
                                                }else{
                                                    delete objectMenu[value.stockid];  
                                                    $("#transaction-header").find("span.fa-trash").remove();  
                                                }
    
                                                _this.fadeOut(500,function(){
                                                    _this.remove();
                                                    pos.display.calculatePOS();
                                                })
                                                
    
                                            }
                                        })
                                        
                                    }),
                            )
                        )
                )
            }else if(value.type == 'delivery'){
                $("#selected-menu-list")
                .append(
                    $("<tr>")
                        .append(
                            $("<td>")
                                .text(`Delivery Fee`),
                            $("<td>")
                                .append(
                                    $("<span>")
                                    .text(value.price),
                                ),
                            $("<td>")
                            .append(
                                $("<span>")
                                .text('1'),
                            ),
                            $("<td>")
                            .append(
                                $("<span>")
                                .text(`Addres:${value.delivery_address}`),
                                $("<br>"),
                                $("<span>")
                                .text(`Contact: ${value.delivery_contact}`),
                            ),
                            $("<td>")
                            .append(
                                $("<span>")
                                .text(parseFloat(value.price)),
                            ),
                            $("<td>")
                                .addClass("float-right")
                                .append(
                                    $("<button>")
                                    .addClass("text-danger btn btn-link")
                                    .attr({'title':`Remove ${value.product_name}`})
                                    .css({'cursor':'pointer',})
                                    .append(
                                        $("<i>").addClass("fa fa-trash")
                                    )
                                    .click(function(){
                                        // console.log("objectMenu",objectMenu);return false;
                                        Swal.fire({
                                            title: 'Are you sure?',
                                            text: `Remove item delivery item`,
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'Yes, remove it!'
                                        }).then((result) => {
                                            if (result.value) {
                                                let _this = $(this).parents("tr");
                                                let total = objectMenu[value.delivery_id].price;
                                            
                                                if(objectMenu[value.delivery_id].price > total){
                                                    objectMenu[value.delivery_id].price = parseFloat(objectMenu[value.delivery_id].price) - total
                                                }else{
                                                    delete objectMenu[value.delivery_id];  
                                                    $("#transaction-header").find("span.fa-trash").remove();  
                                                }
    
                                                _this.fadeOut(500,function(){
                                                    _this.remove();
                                                    pos.display.calculatePOS();
                                                })
                                                
    
                                            }
                                        })
                                        
                                    }),
                            )
                        )
                )
            }else if(value.type == 'expense'){
                $("#selected-menu-list")
                .append(
                    $("<tr>")
                        .append(
                            $("<td>")
                                .text(value.expense_category),
                            $("<td>")
                                .append(
                                    $("<span>")
                                    .text(value.price),
                                ),
                            $("<td>")
                            .append(
                                $("<span>")
                                .text('1'),
                            ),
                            $("<td>")
                            .append(
                                $("<span>")
                                .text('Expense'),
                            ),
                            $("<td>")
                            .append(
                                $("<span>")
                                .text(parseFloat(value.price)),
                            ),
                            $("<td>")
                                .addClass("float-right")
                                .append(
                                    $("<button>")
                                    .addClass("text-danger btn btn-link")
                                    .attr({'title':`Remove ${value.expense_category}`})
                                    .css({'cursor':'pointer',})
                                    .append(
                                        $("<i>").addClass("fa fa-trash")
                                    )
                                    .click(function(){
                                        // console.log("objectMenu",objectMenu);return false;
                                        Swal.fire({
                                            title: 'Are you sure?',
                                            text: `Remove item delivery item`,
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'Yes, remove it!'
                                        }).then((result) => {
                                            if (result.value) {
                                                let _this = $(this).parents("tr");
                                                let total = objectMenu[value.expense_id].price;
                                            
                                                if(objectMenu[value.expense_id].price > total){
                                                    objectMenu[value.expense_id].price = parseFloat(objectMenu[value.expense_id].price) - total
                                                }else{
                                                    delete objectMenu[value.expense_id];  
                                                    $("#transaction-header").find("span.fa-trash").remove();  
                                                }
    
                                                _this.fadeOut(500,function(){
                                                    _this.remove();
                                                    pos.display.calculatePOS();
                                                })
                                                
    
                                            }
                                        })
                                        
                                    }),
                            )
                        )
                )
            }

           
        })
    }

    function updateInStack(quantity){
        pos.display.displayProductList()
    }

   
    function updateSelectedRow(){
       
        $('#product-container tbody tr.table-secondary').removeClass("table-secondary");
        $('#product-container tbody tr').eq(currentRowIndex).addClass('table-secondary');
        let rows = $('#product-container tbody tr');
        let stack = rows.eq(currentRowIndex).data('stack');
        if (currentRowIndex >= 0 && currentRowIndex < rows.length) {
            selectedStack = JSON.stringify(stack)
        } 
    }
    function updateSelectedConvertedRow(){
       
        $('#product-container-w-convertion tbody tr.table-secondary').removeClass("table-secondary");
        $('#product-container-w-convertion tbody tr').eq(currentConvertionRowIndex).addClass('table-secondary');
        let rows = $('#product-container-w-convertion tbody tr');
        let stack = rows.eq(currentConvertionRowIndex).data('stack');
        if (currentConvertionRowIndex >= 0 && currentConvertionRowIndex < rows.length) {
            selectedConvedtionStack = JSON.stringify(stack)
        } 
    }

    $("#add-cash").click(function(){

        if(Object.keys(objectMenu).length <= 0){
            jsAddon.display.swalMessage(true,"No transaction to add cash");
            return false;
        }

        Swal.fire({
            title: 'Add Cash',
            html: `
                <div>
                    <div class="input-group mb-3 col-12">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="inputGroup-sizing-default">CASH</span>
                        </div>
                        <input type="number" class="form-control form-control-lg" name="cash" id="cash"></input>
                    </div>
                </div>`,
            preConfirm: () => {
                const cash = Swal.getPopup().querySelector('#cash').value;
                
                // if (!ornumber) {
                //     Swal.showValidationMessage(`Please enter or number`);
                // }
                return { cash:cash };
            },
            
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Submit'
          }).then((result) => {
        
            if (result.value) {
                let c = result.value.cash;
                if(!isNaN(parseFloat(c)) && cash != c){
                    cash = parseFloat(c);
                    pos.display.calculatePOS();
                }
            }
          })
    })
    $('#productTypeId').change(function(){
        let val = $(this).val();
        productTypeId  = val ;
        pos.ajax.getProducts();
    })
    $("#submit-discount").click(function(){
        pos.display.addDiscount();
    })
    $("#submit-transaction").click(function(){

        if(Object.keys(objectMenu).length == 0){
            jsAddon.display.swalMessage(true,"No transaction need to save");return false;
        }

        const entries = Object.values(objectMenu);
    
        // Filter entries to find those with type 'transaction'
        const transactions = entries.filter(entry => entry.type === 'transaction');
        const expense = entries.filter(entry => entry.type === 'expense');
        
        // Check if there are any filtered entries
        if(transactions.length > 0){
            if(cash < total){
                jsAddon.display.swalMessage(true,"Insuficient cash");
                canSubmit = 0;
                return false;
            }
            Swal.fire({
                title: 'Preview Transaction',
                html: `
                    <div>
                        <div class="input-group mb-3 col-12">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">Note</span>
                            </div>
                            <textarea class="form-control form-control-lg" name="note" id="note"></textarea>
                        </div>
                        <div class="col-12 text-left">
                            <input class="form-check-input ml-1" type="checkbox" checked="true" id="showAmount">
                            <label class="form-check-label ml-4" for="defaultCheck1">
                                Display Amount
                            </label>
                        </div>
                    </div>`,
                preConfirm: () => {
                    const note = Swal.getPopup().querySelector('#note').value;
                    const showAmount = $('#showAmount').is(':checked');
                    
                    // if (!ornumber) {
                    //     Swal.showValidationMessage(`Please enter or number`);
                    // }
                    return { showAmount:showAmount,note:note };
                },
                
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Submit'
              }).then((result) => {
            
                if (result.value) {
    
                    let payload = {
                        accessKey:accesskey,
                        data:JSON.stringify(objectMenu),
                        discount:discountPercentage,
                        discount_amount:discount_amount,
                        discountItems:JSON.stringify(discountItems),
                        userid:jsAddon.display.userdata().userid,
                        storeid:jsAddon.display.userdata().storeid,
                        total_price:total,
                        note:result.value.note,
                        cash:cash
                    }
    
                    var objectMenuEntries = Object.entries(objectMenu);
                    var deliveryEntries = objectMenuEntries.filter(([key, value]) => value.type === 'delivery');
                    var delivery_payload = Object.fromEntries(deliveryEntries);
                    
                    if(Object.keys(delivery_payload).length > 0){
                        payload['delivery_payload'] = JSON.stringify(delivery_payload);
                        payload['isDeliver'] = true;
                    }else{
                        payload['isDeliver'] = false;
                    }
    
                    if(draftransactionid != null){
                        payload['draftransactionid'] = draftransactionid;
                    }
                    pos.ajax.addTransaction(payload,result.value.showAmount);
                }
              })
        }else if(expense.length > 0){
            Swal.fire({
                title: 'Preview Exepense Transaction',
                html: `
                    <div>
                        <div class="input-group mb-3 col-12">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="inputGroup-sizing-default">Note</span>
                            </div>
                            <textarea class="form-control form-control-lg" name="note" id="note"></textarea>
                        </div>
                    </div>`,
                preConfirm: () => {
                    const note = Swal.getPopup().querySelector('#note').value;
                    
                    // if (!ornumber) {
                    //     Swal.showValidationMessage(`Please enter or number`);
                    // }
                    return { note:note };
                },
                
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Submit'
              }).then((result) => {
            
                if (result.value) {
    
                    let payload = {
                        description:result.value.note,
                        data:JSON.stringify(objectMenu),
                    }
                    pos.ajax.addExpenses(payload);
                }
              })
        }


        
      

        
        
    })
    $("#pay-later").click(function(){
        if(Object.keys(objectMenu).length == 0){
            jsAddon.display.swalMessage(true,"No transaction need to pay");return false;
        }

        let date = now;
        Swal.fire({
            title: 'Preview Transaction',
            html: `
                <div>
                    <div class="input-group mb-3 col-12">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="inputGroup-sizing-default">Customer</span>
                        </div>
                        <select type="text" class="form-control form-control-lg customer-selection" id="customerid" name="customerid" aria-describedby="store"></select>
                    </div>
                </div>
                <div>
                    <div class="input-group mb-3 col-12">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="inputGroup-sizing-default">Due Date</span>
                        </div>
                        <input class="form-control form-control-lg" type="date" name="due_date" id="due_date">
                    </div>
                </div>
                <div>
                    <div class="input-group mb-3 col-12">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="inputGroup-sizing-default">Note</span>
                        </div>
                        <textarea class="form-control form-control-lg" name="note" id="note"></textarea>
                    </div>
                </div>
                <div>
                    <div class="col-12 text-left">
                        <input class="form-check-input ml-1" type="checkbox" checked="true" id="showAmount">
                        <label class="form-check-label ml-4" for="defaultCheck1">
                            Display Amount
                        </label>
                    </div>
                </div>`,
            preConfirm: () => {
                const customerid = Swal.getPopup().querySelector('#customerid').value;
                const showAmount = $('#showAmount').is(':checked');
                const due_date = Swal.getPopup().querySelector('#due_date').value;
                const note = Swal.getPopup().querySelector('#note').value;
                
                if (!customerid) {
                    Swal.showValidationMessage(`Please enter customer`);
                }
                if (!due_date) {
                    Swal.showValidationMessage(`Please enter due date`);
                }
                return { customerid: customerid,showAmount:showAmount,due_date:due_date,note:note };
            },
            
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Submit'
          }).then((result) => {
        
            if (result.value) {
                let payload = {
                    accessKey:accesskey,
                    data:JSON.stringify(objectMenu),
                    discount:discountPercentage,
                    discount_amount:discount_amount,
                    discountItems:JSON.stringify(discountItems),
                    total_price:total,
                    note:result.value.note,
                    cash:cash,
                    userid:jsAddon.display.userdata().userid,
                    storeid:jsAddon.display.userdata().storeid,
                    customerid:result.value.customerid,
                    due_date:result.value.due_date,
                }

                if(draftransactionid != null){
                    payload['draftransactionid'] = draftransactionid;
                }
                pos.ajax.addPayLater(payload,result.value.showAmount);
            }
          })

          $(".customer-selection").empty()
          $.each(customerData,function(k,v){
            $(".customer-selection").append(
                $("<option>")
                    .attr({
                        value:v.customerid
                    })
                    .text(v.name)
            )
          })
        
    })
   
    $("#v-transaction").click(function(){
        pos.ajax.getTransaction();
        pos.ajax.getEndTransaction();
    })

    $("input[type=date]").change(function(){
        pos.ajax.getTransaction();
        pos.ajax.getEndTransaction();
    })

    $('#addDiscount').on('shown.bs.modal', function (e) {
        pos.ajax.getDiscounts()
        .then(data=>{
            if(!data.isError){
                $("#discounts-items").empty();
                $.each(data.data,function(k,v){
                    $("#discounts-items").append(
                        $("<div>")
                            .addClass("custom-control custom-switch col-12")
                            .append(
                                $("<input>")
                                    .addClass("custom-control-input")
                                    .prop({
                                        'checked':discountItems.hasOwnProperty(v.discountId) ? true : false
                                    })
                                    .attr({
                                        id:v.tag,
                                        type:'checkbox',
                                        name:v.tag,
                                        value:v.percentage
                                    }).click(function(){
                                        let checkboxdiscount = $(this);
                                        
                                        if(checkboxdiscount.is(':checked')){
                                            discountItems[v.discountId] = {
                                                'discountId':v.discountId,
                                                'discount':v.discount,
                                                'percentage':v.percentage,
                                            }
                                            
                                          //    discountPercentage 
                                        }else{
                                            delete discountItems[v.discountId];
                                        }
                                        pos.display.calculatePOS();
                                    }),
                                $("<label>")
                                    .addClass("custom-control-label")
                                    .attr({
                                        for:v.tag
                                    })
                                    .text(`${v.discount} ${v.percentage} %`)
                            )
                    )
                })
            }
        })
    })

    // $("#add-note").click(function(){
    //     (async () => {

    //         const { value: text } = await Swal.fire({
    //           title: 'Add note',
    //           input: 'textarea',
    //           allowOutsideClick: false,
    //           inputValue:note,
    //           inputPlaceholder: 'Type your message here...',
    //           inputAttributes: {
    //             'aria-label': 'Type your message here'
    //           },
    //           showCancelButton: true
    //         }).then((result) => {
    //             if (result.value) {
    //                 note = result.value;
    //             }else{
    //                 note = note;
    //             }
    //           })

            
    //     })()
        
    // })

    // $("#cash").keyup(function(){
    //     if(!isNaN(parseFloat($(this).val())) && cash != $(this).val()){
    //         cash = $(this).val();
    //         pos.display.calculatePOS();
    //     }

    // })

    $("#cancel").click(function(){
        pos.display.emptyAll();
    })

    $("#save-as-draft").click(function(){
        pos.display.saveAsDraf();
    })

    window.addEventListener('beforeunload',(event) =>{
        if(!isLogout){
            jsAddon.display.setSessionData('session',session);
        }
    });

    $(".logout").click(function(){
        isLogout = true;
        pos.ajax.deAuth();
    })

    
    $("#frm-customer").validate({
        errorElement: 'span',
		errorClass: 'text-danger',
	    highlight: function (element, errorClass, validClass) {
	      $(element).closest('.form-group').addClass("has-warning");
	      $(element).closest('.form-group').find("input").addClass('is-invalid');
	      $(element).closest('.form-group').find("select").addClass('is-invalid');
	    },
	    unhighlight: function (element, errorClass, validClass) {
	      $(element).closest('.form-group').removeClass("has-warning");
	      $(element).closest('.form-group').find("input").removeClass('is-invalid');
	      $(element).closest('.form-group').find("select").removeClass('is-invalid');
	    },
        rules:{
            firstname:{
                required:true,
            },
            lastname:{
                required:true,
            },
            mobile:{
                required:true,
            },
            birthdate:{
                required:true,
            },
            store:{
                required:true,
            },
            role:{
                required:true,
            },
        },
        submitHandler: function(form) {
            
            var payload = {
                'firstname':$(form).find(':input[name=firstname]').val(),
                'middlename':$(form).find(':input[name=middlename]').val(),
                'lastname':$(form).find(':input[name=lastname]').val(),
                'email':$(form).find(':input[name=email]').val(),
                'contact_number':$(form).find(':input[name=mobile]').val(),
                'address':$(form).find(':input[name=address]').val(),
                 userid:jsAddon.display.userdata().userid,
                 storeid:jsAddon.display.userdata().storeid,
            };
            if(customerid == null){
                pos.ajax.addCustomer(payload);
            }else{
                payload.customerid = customerid;
                pos.ajax.updateCustomer(payload);
            }
        }
    })
   
    $(document).ready(function(){
        // localStorage.removeItem('session');
        $("#btn-customer").click(function(){
            pos.ajax.getCustomer();
            $("#customerModal").modal("show")
        })

        $("#btn-form-modal").click(function(){
            $("#customerFormModal").modal("show");
            $("#frm-customer")[0].reset()
            customerid = null;
        })

        $('#customerFormModal').on('shown.bs.modal', function() {
            $.fn.modal.Constructor.prototype._enforceFocus = function() {};
        });

    })
    

    $(document).on('change',"#conversion_quantity", function() {
        let value = $(this).val();
    
        let stock_value = $(this).data("value");
        let stockConversion = stock_value.conversion;
        let stockConversionUnit = stock_value.abbreviations;
        let stockunit = stock_value.stock_unit_abbreviations;

        let convertedQuantity = value * stockConversion;

        $("#stock-conversion-details").html(
            $("<label>")
            .addClass("mb-1 float-left col")
            .text(`${value} ${stockunit} Converted to ${convertedQuantity} ${stockConversionUnit}`),
        )
    })

    $(document).on("change",'.dimension-size',function(){

        let length = 0;
        let width = 0;
        let thickness = 0;

        if ($(this).is('select')) {
            let selected = $(this).find("option:selected")
            let value = selected.data("value");
            length = value.length;
            width = value.width;
            thickness = value.thickness; 
        }else{
            let selected = $("#c_productid").find("option:selected")
            let value = selected.data("value");
            
            length = value.length;
            width = value.width;
            thickness = value.thickness; 
        }
        let quantity = $("#c_quantity").val()
        length = length == "" ? 0 : length;
        width = width == "" ? 0 : width;
        thickness = thickness == "" ? 0 : thickness;
        quantity = quantity == "" ? 0 : quantity;

        let bf = ( (parseFloat(thickness) * parseFloat(width) ) * parseFloat(length) );
        bf = bf / 12

        let fixedBf =  bf.toFixed(2);
        
        let totalbf = parseFloat(fixedBf) * parseFloat(quantity == "" ? 1 : quantity);
      
        $("#conversion-calculation")
        .empty()
        .append(
            $("<div>")
            .append(
                $("<b>").text("Conver to:"),
                $("<b>").text(`${thickness}x${width}x${length}`)
            ),
            $("<div>")
            .append(
                $("<b>").text("Board Foot:"),
                $("<b>").text(`${fixedBf}`)
            ),
            $("<div>")
            .append(
                $("<b>").text("Total Board Foot:"),
                $("<b>").text(`${totalbf.toFixed(2)}`)
            )
        )
    })
   
})