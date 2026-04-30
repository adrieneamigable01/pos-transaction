$(()=>{
    var activeTable = null,
    customerid= null,
    accesskey   = session.key;
    customer = {
        init:()=>{
            customerid = jsAddon.display.getQueryParam('id');
            customer.ajax.getCustomer();
            customer.ajax.getCustomerPayables()
        },
        ajax:{
            getCustomer:()=>{

                return new Promise((resolve,reject)=>{

                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getCustomerApi}`,
                        dataType:'json',
                        payload:{
                            customerid:customerid
                        }
                    }).then((response)=>{
                        if(!response._isError){
                            let data = response.data[0];
                            $("#customer-name").text(data.name)
                            $("#customer-address").text(data.address)
                            $("#customer-info").append(
                                $("<li>").append(
                                    $("<strong>").text("Email: "),
                                    ` ${data.email}`,
                                ),
                                $("<li>").append(
                                    $("<strong>").text("Contact: "),
                                    ` ${data.contact_number}`,
                                ),
                                $("<li>").append(
                                    $("<strong>").text("Store Added: "),
                                    ` ${data.storeName}`,
                                ),
                                $("<li>").append(
                                    $("<strong>").text("Date Added: "),
                                    ` ${data.date_added}`,
                                ),
                            )
                        }
                    })
                     
                })
                .then(data=>{
                    if(data){
                        activeTable = $("#customer-table").DataTable({
                            "autoWidth":false, 
                        });
                        jsAddon.display.removefullPageLoader()
                    }
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
            updatePayablesDue:(payload)=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'post',
                        url:updatePayablesDueApi,
                        dataType:'json',
                        payload:payload,
                    }).then((response)=>{
                        if(!response._isError){
                            customer.ajax.getCustomerPayables()
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            
        },
    }
    customer.init();
    $("#customer-button").click(function(){
        $("#customerFormModal").modal("show")
        customerid = null;
    })
    $("#storeFilter").on("change",function(){
        customer.ajax.getcustomer();
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
            if(customerid == null){
                customer.ajax.addCustomer(payload);
            }else{
                payload.customerid = customerid;
                customer.ajax.updateCustomer(payload);
            }
        }
    })
})