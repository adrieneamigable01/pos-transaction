


// let isLocal = true;
// if(isLocal){
//     var origin  = 'http://localhost/mikkostore_api';
//     var baseApiUrl = `${origin}`;
//     var base_url = 'http://localhost/mikkostore_pos';
//     var baseUrl = `${base_url}/mikkostore_admin/pages/`
// }else{
//     var origin  = 'https://mikkostore-api.doitcebu.com';
//     var baseApiUrl = `${origin}`;
//     var base_url = window.location.origin;
//     var host = window.location.host;
//     var pathname = window.location.pathname.split('/')
//     var baseUrl = `${base_url}/pages/`
// }

let isLocal = false;
if(isLocal){
    var origin  = 'http://localhost/mikkostore_api';
    var baseApiUrl = `${origin}`;
    var base_url = 'http://localhost/mikkostore_pos';
    var baseUrl = `${base_url}/mikkostore_pos/pages/`
}else{
    var origin  = 'https://pos-api.doitcebutech.com';
    var baseApiUrl = `${origin}`;
    var base_url = window.location.origin;
    var host = window.location.host;
    var pathname = window.location.pathname.split('/')
    var baseUrl = `${base_url}/pages/`
}



// auth api
var loginApi                = `${baseApiUrl}/auth/authenticate`;
var deautnApi               = `${baseApiUrl}/auth/logout`;
var getMenuApi              = `${baseApiUrl}/menu/getMenu`;
var addMenuApi              = `${baseApiUrl}/menu/addMenu`;
var updateMenuApi           = `${baseApiUrl}/menu/updateMenu`;
var getMenuTypeApi          = `${baseApiUrl}/menu/getMenuType`;
var addMenuTypeApi          = `${baseApiUrl}/menu/addMenuType`;
var updateMenuTypeApi       = `${baseApiUrl}/menu/updateMenuType`;
var getSuppliersApi         = `${baseApiUrl}/supplier/getSuppliers`;
var addSuppliersApi         = `${baseApiUrl}/supplier/addSuppliers`;
var updateSuppliersApi      = `${baseApiUrl}/supplier/updateSuppliers`;
var getProductsApi          = `${baseApiUrl}/product/getProducts`;
var getProductTypeApi       = `${baseApiUrl}/product/getProductType`;
var getStoresApi            = `${baseApiUrl}/store/getStores`;
var addProductApi           = `${baseApiUrl}/product/addProduct`;
var updateProductApi        = `${baseApiUrl}/product/updateProduct`;
var getStocksApi            = `${baseApiUrl}/stocks/getStocks`;
var getPOSStocksApi         = `${baseApiUrl}/stocks/getPOSStocks`;
var getPOSStocksConversionApi = `${baseApiUrl}/stocks/getPOSStocksConversion`;
var addStocksApi            = `${baseApiUrl}/stocks/addStocks`;
var updateStockApi          = `${baseApiUrl}/stocks/updateStock`;
var getProductListApi       = `${baseApiUrl}/stocks/getProductList`;
var getInventoryApi         = `${baseApiUrl}/inventory/getInventory`;
var getInventoryItemsApi    = `${baseApiUrl}/inventory/getInventoryItems`;
var addStoreApi             = `${baseApiUrl}/store/addStore`;
var updateStoreApi          = `${baseApiUrl}/store/updateStore`;
var addProductTypeApi       = `${baseApiUrl}/product/addProductType`;
var updateProductTypeApi    = `${baseApiUrl}/product/updateProductType`;
var getUsedProducts         = `${baseApiUrl}/product/getUsedProducts`;
var addTransactionApi       = `${baseApiUrl}/transaction/addTransaction`;
var payLaterTransactionApi       = `${baseApiUrl}/transaction/payLaterTransaction`;
var getTransactionApi       = `${baseApiUrl}/transaction/getTransaction`;
var getDraftTransactionApi  = `${baseApiUrl}/transaction/getDraftTransaction`;
var addEndTransactionApi    = `${baseApiUrl}/transaction/addEndOfDayTransaction`;
var getEndTransactionApi    = `${baseApiUrl}/transaction/getEndTransaction`;
var addDraftTransactionApi  = `${baseApiUrl}/transaction/addDraftTransaction`;
var editDraftTransactionApi  = `${baseApiUrl}/transaction/editDraftTransaction`;
var getDiscountsApi         = `${baseApiUrl}/discounts/getDiscounts`;
var createCustomerApi         = `${baseApiUrl}/customer/createCustomer`;
var editCustomerApi         = `${baseApiUrl}/customer/updateCustomer`;
var getCustomerApi         = `${baseApiUrl}/customer/getCustomer`;
var generateVoidTranactionOTPApi         = `${baseApiUrl}/transaction/generateVoidTransactionOTP`;
var voidTranactionApi         = `${baseApiUrl}/transaction/voidTransaction`;
var validateDeleteTranasctionOTPApi = `${baseApiUrl}/transaction/validateDeleteTranasctionOTP`; 
var checkTokenApi              = `${baseApiUrl}/user/checkToken`;
var addExpensesApi              = `${baseApiUrl}/expense/addExpenses`;
var getExpenseCategoryApi       = `${baseApiUrl}/expense/getExpenseCategory`;
var getCustomerPayablesApi         = `${baseApiUrl}/customer/getCustomerPayables`;
var getPaymentsApi         = `${baseApiUrl}/payment/getPayments`;
var createPaymentApi         = `${baseApiUrl}/payment/createPayment`;
var generateVoidPaymentOTPApi         = `${baseApiUrl}/payment/generateVoidPaymentOTP`;
var voidPaymentApi         = `${baseApiUrl}/payment/voidPayment`;
var updatePayablesDueApi   = `${baseApiUrl}/customer/updatePayablesDue`;
var validateDeletePaymentOTPApi = `${baseApiUrl}/payment/validateDeletePaymentOTP`; 
var addDeliveryApi  = `${baseApiUrl}/delivery/addDelivery`; 
var convertStockApi = `${baseApiUrl}/stocks/convertStock`;
var boardFeetToDimensionsApi = `${baseApiUrl}/materials/boardFeetToDimension`
var getStockUnitApi              = `${baseApiUrl}/stocks/getStockUnit`
var getMaterialsApi                 = `${baseApiUrl}/materials/getMaterials`
var addMaterialApi              = `${baseApiUrl}/materials/addMaterial`
var updateMaterialApi           = `${baseApiUrl}/materials/updateMaterial`
var getPOSMaterialsApi           = `${baseApiUrl}/materials/getPOSMaterials`
var getPOSMaterialsApi           = `${baseApiUrl}/materials/getPOSMaterials`
var getMixProductsApi           = `${baseApiUrl}/product/getMixProducts`
var mixproductApi               = `${baseApiUrl}/stocks/mixproduct`
