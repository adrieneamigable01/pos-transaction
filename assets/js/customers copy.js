$(()=>{
    var activeTable = null,
    customerid= null,
    accesskey   = session.key;
    customers = {
        init:()=>{
            customers.ajax.getCustomers();
            customers.ajax.getStores()
        },
        ajax:{
            getCustomers:()=>{

                return new Promise((resolve,reject)=>{
                    if ( $.fn.DataTable.isDataTable('#customers-table') ) {
                        activeTable.clear();
                        activeTable.destroy();
                        $("#customers-table").find("tbody").empty();
                    }
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getCustomerApi}`,
                        dataType:'json',
                        payload:{
                            storeid:$("#storeFilter").val()
                        }
                    }).then((response)=>{
                        if(!response._isError){
                            console.log('response.data',response.data)
                             $.each(response.data,function(k,v){
                                     $("#customers-table")
                                     .find("tbody")
                                     .append(
                                         $("<tr>")
                                             .append(
                                                 $("<td>")
                                                     .text(v.customerid),
                                                 $("<td>")
                                                     .text(v.name),
                                                 $("<td>")
                                                     .text(v.address),
                                                 $("<td>")
                                                     .text(v.email != null ? v.email : 'N/A'),
                                                 $("<td>")
                                                     .text(v.contact_number != null ? v.contact_number : 'N/A'),
                                                 $("<td>")
                                                     .text(v.date_added),
                                                 $("<td>")
                                                     .append(
                                                        $("<button>")
                                                         .addClass("btn btn-primary btn-sm")
                                                         .text("View")
                                                         .attr({
                                                             'data-toggle':'modal',
                                                             'data-target':'#updateUser'
                                                         })
                                                         .click(function(){
                                                            window.location.href = `customer.php?id=${v.customerid}`
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
                             })
                             resolve(true)
                        }
                    })
                     
                })
                .then(data=>{
                    if(data){
                        activeTable = $("#customers-table").DataTable({
                            "autoWidth":false, 
                        });
                        jsAddon.display.removefullPageLoader()
                    }
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
                            customers.ajax.getCustomers();
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
                            customers.ajax.getCustomers();
                        }
                        jsAddon.display.swalMessage(response._isError,response.reason);
                    })
                     
                })
            },
            getStores:()=>{
                return new Promise((resolve,reject)=>{
                    jsAddon.display.ajaxRequest({
                        type:'get',
                        url:`${getStoresApi}`,
                        dataType:'json',
                    }).then((response)=>{
                        if(!response._isError){
                            $(".store-type-menu")
                            .empty()

                            $(".store-type-menu-filter")
                            .empty()
                            .append(
                                $("<option>")
                                    .attr({
                                        value:'All',
                                        selected:'seleted'
                                    })
                                    .text("All")
                            )
                            
                            $.each(response.data,function(k,v){
                                $(".store-type-menu-filter")
                                .append(
                                    $("<option>")
                                        .text(v.storeName)
                                        .attr({
                                            value:v.storeid
                                        })
                                )

                                $(".store-type-menu")
                                .append(
                                    $("<option>")
                                        .text(v.storeName)
                                        .attr({
                                            value:v.storeid
                                        })
                                )
                            })
                        }
                    })
                })
            },
           
           
        },
    }
    customers.init();
    $("#customer-button").click(function(){
        $("#customerFormModal").modal("show")
        customerid = null;
    })
    $("#storeFilter").on("change",function(){
        customers.ajax.getCustomers();
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
                customers.ajax.addCustomer(payload);
            }else{
                payload.customerid = customerid;
                customers.ajax.updateCustomer(payload);
            }
        }
    })
})