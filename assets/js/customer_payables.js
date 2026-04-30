$(()=>{
    var activeTable = null,
    paymentTable = null,
    ornumber= null,
    accesskey   = session.key;
    payableStatus = 'active';
    payables = {
        init:()=>{
            ornumber = jsAddon.display.getQueryParam('id');
            payables.ajax.getCustomerPayables();
            payables.ajax.getPayments();
        },
        ajax:{
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
                            ornumber:ornumber
                        }
                    }).then((response)=>{
                        if(!response._isError){
                            if(response.data.length > 0){
                                console.log('response.data',response.data)
                                let data = response.data[0];
                                let balance = parseFloat(data.amount) - parseFloat(data.total_payments)
                                payableStatus = data.status;
                                data.status == "active" ? 
                                $("#add-payment-container")
                                .empty()
                                .append(
                                    $("<button>")
                                    .addClass("btn btn-primary")
                                    .append(
                                        $("<i>")
                                            .addClass("fa fa-plus"),
                                        ' Payment'
                                    ).click(function(){
                                        (async () => {
                                            Swal.fire({
                                                title: "Add Payment",
                                                html: `
                                                    <div class="row">
                                                        <div class="col-12 text-left">
                                                            <h4>Customer : ${data.customer}</h4>
                                                            <h4>Balance : ${data.amount}</h4>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="row">
                                                    <div class="input-group mb-3 col-12">
                                                        <div class="input-group-prepend">
                                                            <span class="input-group-text" id="inputGroup-sizing-default">Amount</span>
                                                        </div>
                                                        <input id="amount" class="form-control" placeholder="Enter amount">
                                                    </div>
                                                </div>
                                                `,
                                                showCancelButton:true,
                                                focusConfirm: false,
                                                preConfirm: () => {
                                                    const amount = Swal.getPopup().querySelector('#amount').value;
                                                    if (!amount) {
                                                        Swal.showValidationMessage(`Please enter amount`);
                                                    }
                                                    return { amount: amount };
                                                }
                                            }).then((result) => {
                                                amount = result.value.amount;
                                                let data = {};

                                                data[1] = {
                                                    amount:result.value.expenseamount,
                                                    ornumber:ornumber
                                                }
                                
                                                let payload = {
                                                    amount:amount,
                                                    ornumber:ornumber,
                                                    fromPOS:true,
                                                    data:JSON.stringify(data)
                                                }

                                                payables.ajax.createPayment(payload);
                                            });
                                        })()
                                    })
                                ): ''

                                $("#payable-details")
                                .empty()
                                .append(
                                    $("<p>")
                                    .addClass("text-muted")
                                    .text(`Name: ${data.customer}`),
                                    $("<p>")
                                    .addClass("text-muted")
                                    .text(`Address: ${data.address}`),
                                    $("<p>")
                                    .addClass("text-muted")
                                    .text(`Contact #: ${data.contact_number}`),
                                );
                                $("#store-details")
                                .empty()
                                .append(
                                        $("<p>")
                                        .addClass("text-muted")
                                        .text(`Store: ${data.storeName}`),
                                        $("<p>")
                                        .addClass("text-muted")
                                        .text(`Store Address: ${data.store_address}`),
                                        $("<p>")
                                        .addClass("text-muted")
                                        .text(`Store Contact: ${data.storeMobile}`)
                                );
                               
                                $("#payables-table tbody")
                                .empty()
                                .append(
                                    $("<td>")
                                        .text(data.amount),
                                    $("<td>")
                                        .text(data.total_payments),
                                    $("<td>")
                                        .text(balance),
                                    $("<td>")
                                        .text(data.date_added),
                                    $("<td>")
                                        .text(data.due_date),
                                    $("<td>")
                                        .text(data.status),
                                )
                            }
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
            validateDeletePaymentOTP:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:validateDeletePaymentOTPApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        resolve(response);
                    })
                })
            },
            getPayments:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getPaymentsApi}`,
                        dataType:'json',
                        payload:{
                            ornumber:ornumber
                        }
                    }).then((response)=>{
                        if ($.fn.DataTable.isDataTable("#payment-table")) {
                            paymentTable.clear();
                            paymentTable.destroy();
                            $("#payment-table tbody").empty();
                        }
                        if(!response._isError){
                            if(Object.keys(response.data).length > 0){
                                $.each(response.data,function(k,v){
                                    $("#payment-table tbody")
                                        .addClass("small")
                                        .append(
                                            $("<tr>")
                                                .append(
                                                    $("<td>")
                                                        .text(v.paymentid),
                                                    $("<td>")
                                                        .text(v.amount),
                                                    $("<td>")
                                                        .text(v.payment_type),
                                                    $("<td>")
                                                        .text(v.date_added),
                                                    $("<td>")
                                                        .text(v.transact_by),
                                                    $("<td>")
                                                        .append(
                                                            payableStatus == 'active'?
                                                            $("<button>")
                                                                .addClass("btn btn-danger btn-sm")
                                                                .text("Void")
                                                                .click(function(){
                                                                    payables.ajax.generateVoidOTP({
                                                                        paymentid:v.paymentid
                                                                    }).then((data)=>{
                                                                        if(data){
                                                                            (async () => {
                                                                                Swal.fire({
                                                                                    title: "Void payment",
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
                                                                                            payables.ajax.validateDeletePaymentOTP({
                                                                                                otp:otp,
                                                                                                paymentid:v.paymentid
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
                                                                                        paymentid:v.paymentid
                                                                                    }
                                                                                    payables.ajax.voidPayment(payload);
                                                                                });
                                                                            })()
                                                                        }
                                                                    })
                                                                }) : ''
                                                        ) 
                                                )
                                        )
                                    if (Object.keys(response.data).length - 1 == k) {
                                        resolve(true);
                                    }
                                })
                            }else{
                                resolve(true);
                            }
                        }
                       
                    })
                        
                })
                .then(data=>{
                    if(data){
                        jsAddon.display.removefullPageLoader()
                        paymentTable = $('#payment-table').DataTable({});
                    }
                })
            },
            voidPayment:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:voidPaymentApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            payables.init();
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            generateVoidOTP:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:generateVoidPaymentOTPApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        resolve(!response._isError)
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            createPayment:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:createPaymentApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            payables.init();
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            
            
        },
    }
    payables.init();
    $("#customer-button").click(function(){
        $("#customerFormModal").modal("show")
        ornumber = null;
    })
    $("#storeFilter").on("change",function(){
        payables.ajax.getpayables();
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
            };
            if(ornumber == null){
                payables.ajax.addCustomer(payload);
            }else{
                payload.ornumber = ornumber;
                payables.ajax.updateCustomer(payload);
            }
        }
    })
})