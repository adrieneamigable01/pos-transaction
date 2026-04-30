<?php
    /**
     * @author  Adriene Care Llanos Amigable <adrienecarreamigable01@gmail.com>
     * @version 0.1.0
    */ 
    class Transaction extends MY_Controller{
        /**
         * Class constructor.
         *
        */
        public function __construct() {
			parent::__construct();
            date_default_timezone_set('Asia/Manila');
            $this->load->model('TransactionModel');
            $this->load->model('CustomerModel');
            $this->load->library('Response',NULL,'response');
            $this->load->library('Otp',NULL,'otp');
            $this->load->helper('jwt');
        }
        /**
            * Add new transaction
            * 
            *
            * @return array Returns the _isError define if the request is error or not.
            * reason indicated the system message 
            * data where the data object has 
        */
        function gen_uuid()
        {
            $uuid =  sprintf(
                '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                // 32 bits for "time_low"
                mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),

                // 16 bits for "time_mid"
                mt_rand(0, 0xffff),

                // 16 bits for "time_hi_and_version",
                // four most significant bits holds version number 4
                mt_rand(0, 0x0fff) | 0x4000,

                // 16 bits, 8 bits for "clk_seq_hi_res",
                // 8 bits for "clk_seq_low",
                // two most significant bits holds zero and one for variant DCE1.1
                mt_rand(0, 0x3fff) | 0x8000,

                // 48 bits for "node"
                mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0xffff)
            );

            return $uuid;
        }
        public function generateORNumber(){
            return 'TRANS'.date("Ymdhis");
        }
        public function addTransaction(){

            $session = $this->session->userdata("personalInfo");
            /**
             * @var string post data $key
             * @var string session data $accessKey
             * @var string post object $data
             * @var string post int $total_price
            */
            $key             = $this->input->post('accessKey');
            $data            = $this->input->post('data');
            $discount        = $this->input->post('discount');
            $discount_amount = $this->input->post('discount_amount');
            $discountItems   = $this->input->post('discountItems');
            $note            = $this->input->post('note');
            $total_price     = $this->input->post('total_price');
            $cash     = $this->input->post('cash');
            $draftransactionid  = $this->input->post("draftransactionid");
            $userid  = $this->input->post("userid");
            $storeid  = $this->input->post("storeid");
            $transQuery = array();

            if(empty($data)){ //check the data is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty transaction data',
                );
            }
            else if(empty($total_price)){ //check if total_price is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty total price',
                );
            }
            else if(empty($userid)){ //check if total_price is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty user id',
                );
            }
            else if(empty($storeid)){ //check if total_price is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty store id',
                );
            }
            else{
                try{
                   
                    // $headers = $this->input->request_headers();
                    // $token = $headers['Authorization'];
                    // if (strpos($token, 'Bearer ') === 0) {
                    //     $token = substr($token, 7);
                    // }
                    // $decoded = decode_jwt($token, $this->config->item('jwt_key'));
                    $ornumber = $this->generateORNumber();
           
                    //set ayload
                    $payload = array(
                        'transaction.ornumber'          => $ornumber,
                        'transaction.data'              => $data,
                        'transaction.discount'          => $discount,
                        'transaction.total_price'       => $total_price,
                        // 'transaction.userid'            => $decoded->data->userid,
                        'transaction.userid'            => $userid,
                        'transaction.storeid'           => $storeid,
                        'transaction.discount_items'    => $discountItems,
                        'transaction.note'              => $note,
                        'transaction.cash'              => $cash,
                        'transaction.discount_amount'   => $discount_amount,
                        // 'transaction.storeid'           => $decoded->data->storeid,
                    );
                    
                    /** 
                        * Call the store model
                        * then call the addStore method
                        * @param array $payload.
                    */
                    $addTransactionResponse = $this->TransactionModel->addTransaction($payload);
                    array_push($transQuery, $addTransactionResponse['sql']);
                    
                    $last_id = $this->db->insert_id();


                    $addUSedStocksResponse = $this->TransactionModel->addUsedStocks($data,$ornumber);
                    array_push($transQuery, $addUSedStocksResponse);

                    $where = array(
                        'draftransactionid' => $draftransactionid,
                    );
                    $draftData = array(
                        'status' => 'Settled'
                    );
                    $addDraftTransactionResponse = $this->TransactionModel->updateDraftTransaction($draftData,$where);
                    array_push($transQuery, $addDraftTransactionResponse);

                    

                    $result = array_filter($transQuery);
			        $res = $this->mysqlTQ($result);


                    if($res){
                        $return = array(
                            '_isError'      => false,
                            // 'code'       =>http_response_code(),
                            'reason'        =>'Successfuly added transaction',
                            'data'          => $res[0]
                        );
                    }else{
                        $return = array(
                            '_isError' => true,
                            // 'code'     =>http_response_code(),
                            'reason'   => 'Error transaction',
                        );
                    }
                    
                }catch (Exception $e) {
                    //return the server error
                    $return = array(
                        '_isError' => true,
                        // 'code'     =>http_response_code(),
                        'reason'   => $e->getMessage(),
                    );
                }
                
            }
            $this->response->output($return); //echo the json encoded data
        }
        public function payLaterTransaction(){

            /**
             * @var string post data $key
             * @var string session data $accessKey
             * @var string post object $data
             * @var string post int $total_price
            */
            $data               = $this->input->post('data');
            $customerid         = $this->input->post('customerid');
            $discount           = $this->input->post('discount');
            $discount_amount    = $this->input->post('discount_amount');
            $discountItems      = $this->input->post('discountItems');
            $note               = $this->input->post('note');
            $total_price        = $this->input->post('total_price');
            $cash               = $this->input->post('cash');
            $ornumber           = $this->input->post("ornumber");
            $draftransactionid  = $this->input->post("draftransactionid");
            $due_date           = $this->input->post("due_date");

            $userid  = $this->input->post("userid");
            $storeid  = $this->input->post("storeid");
            $transQuery = array();

            if(empty($data)){ //check the data is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty transaction data',
                );
            }
            else if(empty($userid)){ //check if total_price is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty user id',
                );
            }
            else if(empty($storeid)){ //check if total_price is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty store id',
                );
            }
            else if(empty($total_price)){ //check if total_price is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty total price',
                );
            } else if(empty($due_date)){ //check if total_price is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty due date',
                );
            }
            else{
                try{
                    
                    //set ayload
                    $payload = array(
                        'transaction.ornumber'          => $ornumber,
                        'transaction.data'              => $data,
                        'transaction.discount'          => $discount,
                        'transaction.total_price'       => $total_price,
                        'transaction.userid'            => $userid,
                        'transaction.discount_items'    => $discountItems,
                        'transaction.note'              => $note,
                        'transaction.cash'              => $cash,
                        'transaction.discount_amount'   => $discount_amount,
                        'transaction.storeid'           => $storeid,
                    );
                    
                    /** 
                        * Call the store model
                        * then call the addStore method
                        * @param array $payload.
                    */
                    $addTransactionResponse = $this->TransactionModel->addTransaction($payload);
                    array_push($transQuery, $addTransactionResponse['sql']);
                   

                    $addUSedStocksResponse = $this->TransactionModel->addUsedStocks($data,$ornumber);
                    array_push($transQuery, $addUSedStocksResponse);

                    $where = array(
                        'draftransactionid' => $draftransactionid,
                    );
                    $draftData = array(
                        'status' => 'Settled'
                    );
                    $addDraftTransactionResponse = $this->TransactionModel->updateDraftTransaction($draftData,$where);
                    array_push($transQuery, $addDraftTransactionResponse);

                    $customerPlanPayload = array(
                        'customerid'   => $customerid,
                        'amount'        => $total_price,
                        'date_added'    => date("Y-m-d H:i:s"),
                        'due_date'      => $due_date,
                        'status'        => 'active',
                        'ornumber'      => $ornumber,
                    );
                   
                    $addPaymentLater = $this->TransactionModel->addCustomerPlan($customerPlanPayload);
               
                    array_push($transQuery, $addPaymentLater);

                  
                    $result = array_filter($transQuery);
			        $res = $this->mysqlTQ($result);
                  

                    if($res){
                        $return = array(
                            '_isError'      => false,
                            // 'code'       =>http_response_code(),
                            'reason'        =>'Successfuly added transaction',
                            'data'          => $res[0]
                        );
                    }else{
                        $return = array(
                            '_isError' => true,
                            // 'code'     =>http_response_code(),
                            'reason'   => 'Error transaction',
                        );
                    }
                    
                }catch (Exception $e) {
                    //return the server error
                    $return = array(
                        '_isError' => true,
                        // 'code'     =>http_response_code(),
                        'reason'   => $e->getMessage(),
                    );
                }
                
            }
            $this->response->output($return); //echo the json encoded data
        }
       
        /**
            * View transaction
            * By default the latest trastion date will be return
            *
            * @return array Returns the _isError define if the request is error or not.
            * reason indicated the system message 
            * data where the data object has 
        */

        public function getTransaction(){
            // print_r(date("Y-m-t"));exit;

            
            $session = $this->session->userdata("personalInfo");
            /**
             * @var string post data $key
             * @var string session data $accessKey
             * @var string post object $data
             * @var string post int $total_price
            */
           
            try{

                $headers = $this->input->request_headers();
                $token = $headers['Authorization'];
                if (strpos($token, 'Bearer ') === 0) {
                    $token = substr($token, 7);
                }
                $decoded = decode_jwt($token, $this->config->item('jwt_key'));
                
                $userid = $this->input->get("userid");
                $date = $this->input->get("date");
                $storeid  = $this->input->get("storeid");


                //set payload
                $payload = array(
                    'userid'   => $userid,
                    'date'     => !empty($date) ? $date : date("Y-m-d"),
                    'storeid'  => $storeid,
                );
                

                /** 
                    * Call the store model
                    * then call the addStore method
                    * @param array $payload.
                */
                $request = $this->TransactionModel->getTransaction($payload);
        
                $return = array(
                    '_isError'      => false,
                    // 'code'       =>http_response_code(),
                    'reason'        =>'Success',
                    'data'          => $request
                );
                
            }catch (Exception $e) {
                //return the server error
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   => $e->getMessage(),
                );
            }
                
            
            $this->response->output($return); //echo the json encoded data
        }

        public function getDraftTransaction(){
            // print_r(date("Y-m-t"));exit;

            
            $session = $this->session->userdata("personalInfo");
            /**
             * @var string post data $key
             * @var string session data $accessKey
             * @var string post object $data
             * @var string post int $total_price
            */
           
            try{

          
                $date = $this->input->get("date");
                $userid = $this->input->get("userid");
                $storeid = $this->input->get("storeid");

                //set ayload
                $payload = array(
                    'userid'   => $userid,
                    'storeid' => $storeid,
                    'date'      => !empty($date) ? $date : '',
                );

                /** 
                    * Call the store model
                    * then call the addStore method
                    * @param array $payload.
                */
                $request = $this->TransactionModel->getDraftTransaction($payload);
        
                $return = array(
                    '_isError'      => false,
                    // 'code'       =>http_response_code(),
                    'reason'        =>'Success',
                    'data'          => $request
                );
                
            }catch (Exception $e) {
                //return the server error
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   => $e->getMessage(),
                );
            }
                
            
            $this->response->output($return); //echo the json encoded data
        }

        public function addEndOfDayTransaction(){
            // print_r(date("Y-m-t"));exit;

            
    
            /**
             * @var string post data $key
             * @var string session data $accessKey
             * @var string post object $data
             * @var string post int $total_price
            */
           
            try{

                // $headers = $this->input->request_headers();
                // $token = $headers['Authorization'];
                // if (strpos($token, 'Bearer ') === 0) {
                //     $token = substr($token, 7);
                // }
                // $decoded = decode_jwt($token, $this->config->item('jwt_key'));

                $cash                   =  $this->input->post("cash");
                $userid                   =  $this->input->post("userid");
                $storeid                   =  $this->input->post("storeid");
                $transactions           = $this->input->post("transactions");
                $end_transaction_date   = $this->input->post("end_transaction_date");
                $denomonation           = $this->input->post("denomonation");
                

                //set ayload
                $payload = array(
                    'userid'        => $userid,
                    'storeid'       => $storeid,
                    'end_transaction_date'          => $end_transaction_date == null ? date("Y-m-d H:i:s") : date("Y-m-d H:i:s",strtotime($end_transaction_date)),
                    'transactions'  => $transactions,
                    'cash'          => $cash,
                    'denomonation'  => $denomonation
                );

                /** 
                    * Call the store model
                    * then call the addStore method
                    * @param array $payload.
                */
                $request = $this->TransactionModel->addEndTransaction($payload);
                if($request > 0 &&  $request!= null){
                    $return = array(
                        '_isError'      => false,
                        // 'code'       =>http_response_code(),
                        'reason'        =>'Successfuly added end transaction',
                        'data'          => $request
                    );
                }else{
                    $return = array(
                        '_isError' => true,
                        // 'code'     =>http_response_code(),
                        'reason'   => 'Error transaction',
                    );
                }
                
            }catch (Exception $e) {
                //return the server error
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   => $e->getMessage(),
                );
            }
                
            
            $this->response->output($return); //echo the json encoded data
        }

        public function getEndTransaction(){
            // print_r(date("Y-m-t"));exit;

            
            $session = $this->session->userdata("personalInfo");
            /**
             * @var string post data $key
             * @var string session data $accessKey
             * @var string post object $data
             * @var string post int $total_price
            */
           
            try{
                $userid = $this->input->get("userid");
                $date = $this->input->get("date");
                $storeid  = $this->input->get("storeid");
                //set ayload
                $payload = array(
                    'userid'    => $userid,
                    'storeid'   => $storeid,
                    'date'      => $this->input->get("date"),
                );

                /** 
                    * Call the store model
                    * then call the addStore method
                    * @param array $payload.
                */
                $request = $this->TransactionModel->getEndTransaction($payload);
        
                $return = array(
                    '_isError'      => false,
                    // 'code'       =>http_response_code(),
                    'reason'        =>'Success',
                    'data'          => $request
                );
                
            }catch (Exception $e) {
                //return the server error
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   => $e->getMessage(),
                );
            }
                
            
            $this->response->output($return); //echo the json encoded data
        }

        public function addDraftTransaction(){

            $transQuery      = array();
            $data            = $this->input->post('data');
            $discount        = $this->input->post('discount');
            $discount_amount = $this->input->post('discount_amount');
            $discountItems   = $this->input->post('discountItems');
            $note            = $this->input->post('note');
            $total_price     = $this->input->post('total_price');
            $cash            = $this->input->post('cash');
            $userid            = $this->input->post('userid');
            $storeid            = $this->input->post('storeid');
            $ornumber        = $this->input->post("ornumber");


            if(empty($data)){ //check the data is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty transaction data',
                );
            }
            else{
                try{
                   
                    // $headers = $this->input->request_headers();
                    // $token = $headers['Authorization'];
                    // if (strpos($token, 'Bearer ') === 0) {
                    //     $token = substr($token, 7);
                    // }
                    // $decoded = decode_jwt($token, $this->config->item('jwt_key'));
                    
                    //set ayload
                    $payload = array(
                        'draf_transaction.data'              => $data,
                        'draf_transaction.discount'          => $discount,
                        'draf_transaction.userid'            => $userid,
                        'draf_transaction.storeid'            => $storeid,
                        'draf_transaction.discount_items'    => $discountItems,
                        'draf_transaction.note'              => $note,
                        'draf_transaction.cash'              => $cash,
                        'draf_transaction.draftransactionDate' => date("Y-m-d H:i:s")
                    );
                    
                    /** 
                        * Call the store model
                        * then call the addStore method
                        * @param array $payload.
                    */
        


                    $addTransactionResponse = $this->TransactionModel->addDraftTransaction($payload);
                    array_push($transQuery, $addTransactionResponse['sql']);
                    $result = array_filter($transQuery);
			        $res = $this->mysqlTQ($result);


                    if($res){
                        $return = array(
                            '_isError'      => false,
                            // 'code'       =>http_response_code(),
                            'reason'        =>'Successfuly added draft transaction',
                            'data'          => $payload
                        );
                    }else{
                        $return = array(
                            '_isError' => true,
                            // 'code'     =>http_response_code(),
                            'reason'   => 'Error transaction',
                        );
                    }
                    
                }catch (Exception $e) {
                    //return the server error
                    $return = array(
                        '_isError' => true,
                        // 'code'     =>http_response_code(),
                        'reason'   => $e->getMessage(),
                    );
                }
                
            }
            $this->response->output($return); //echo the json encoded data
        }

        public function editDraftTransaction(){

            $transQuery             = array();
            $data                   = $this->input->post('data');
            $discount               = $this->input->post('discount');
            $discount_amount        = $this->input->post('discount_amount');
            $discountItems          = $this->input->post('discountItems');
            $note                   = $this->input->post('note');
            $total_price            = $this->input->post('total_price');
            $cash                   = $this->input->post('cash');
            $userid                   = $this->input->post('userid');
            $draftransactionid      = $this->input->post("draftransactionid"); 


            if(empty($data)){ //check the data is not empty
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   =>'Empty transaction data',
                );
            }
            else{
                try{
                   
                    // $headers = $this->input->request_headers();
                    // $token = $headers['Authorization'];
                    // if (strpos($token, 'Bearer ') === 0) {
                    //     $token = substr($token, 7);
                    // }
                    // $decoded = decode_jwt($token, $this->config->item('jwt_key'));
                    
                    //set ayload
                    $payload = array(
                        'draf_transaction.data'              => $data,
                        'draf_transaction.discount'          => $discount,
                        'draf_transaction.userid'            => $userid,
                        'draf_transaction.discount_items'    => $discountItems,
                        'draf_transaction.note'              => $note,
                        'draf_transaction.cash'              => $cash,
                        'draf_transaction.draftransactionDate' => date("Y-m-d H:i:s")
                    );
                    
                    /** 
                        * Call the store model
                        * then call the addStore method
                        * @param array $payload.
                    */
        

                    $where = array(
                        'draftransactionid' => $draftransactionid
                    );
                    $editTransactionResponse = $this->TransactionModel->updateDraftTransaction($payload,$where);
                    array_push($transQuery, $editTransactionResponse);
                    $result = array_filter($transQuery);
			        $res = $this->mysqlTQ($result);


                    if($res){
                        $return = array(
                            '_isError'      => false,
                            // 'code'       =>http_response_code(),
                            'reason'        =>'Successfuly edit draft transaction',
                            'data'          => $payload
                        );
                    }else{
                        $return = array(
                            '_isError' => true,
                            // 'code'     =>http_response_code(),
                            'reason'   => 'Error transaction',
                        );
                    }
                    
                }catch (Exception $e) {
                    //return the server error
                    $return = array(
                        '_isError' => true,
                        // 'code'     =>http_response_code(),
                        'reason'   => $e->getMessage(),
                    );
                }
                
            }
            $this->response->output($return); //echo the json encoded data
        }
        public function validateDeleteTranasctionOTP(){
            $transQuery         = array();
            $transactionid = $this->input->post("transactionid");
            $userid = $this->input->post("userid");
            $email = $this->input->post("email");
            $otp = $this->input->post("otp");
            if(empty($transactionid)){
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   => 'Empty transactionid id',
                );
            }else if(empty($otp)){
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   => 'Empty OTP cpde',
                );
            }else{
                // $headers = $this->input->request_headers();
                // $token = $headers['Authorization'];
                // if (strpos($token, 'Bearer ') === 0) {
                //     $token = substr($token, 7);
                // }
                // $decoded = decode_jwt($token, $this->config->item('jwt_key'));
                
                $payload= array(
                    'userid' => $userid,
                    'email' => $email,
                    'otp' => $otp,
                    'action' => 'delete_transaction',
                    'foreign_id' => $transactionid
                );
                $validOTP = $this->otp->validate_otp($payload,0);
              
                if($validOTP){
                    $return = array(
                        '_isError' => false,
                        // 'code'     =>http_response_code(),
                        'reason'   => "Success",
                    );
                }else{
                    $return = array(
                        '_isError' => true,
                        // 'code'     =>http_response_code(),
                        'reason'   => "Invalid or expired OTP.",
                    );
                }
                $this->response->output($return); //echo the json encoded data
            }
        }
        public function voidTransaction(){
            $transQuery         = array();
            $transactionid = $this->input->post("transactionid");
            $userid = $this->input->post("userid");
            $email = $this->input->post("email");
            $otp = $this->input->post("otp");
            if(empty($transactionid)){
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   => 'Empty transactionid id',
                );
            }else if(empty($otp)){
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   => 'Empty OTP cpde',
                );
            }
            else{
                try{
                    // $headers = $this->input->request_headers();
                    // $token = $headers['Authorization'];
                    // if (strpos($token, 'Bearer ') === 0) {
                    //     $token = substr($token, 7);
                    // }
                    // $decoded = decode_jwt($token, $this->config->item('jwt_key'));
                    
                    $payload= array(
                        'userid' => $userid,
                        'email' => $email,
                        'otp' => $otp,
                        'action' => 'delete_transaction',
                        'foreign_id' => $transactionid
                    );
                    $validOTP = $this->otp->validate_otp($payload);
                  
                    if($validOTP){
                        $payloadDel = array(
                            'isActive' => 0
                        );
                        $where = array(
                            'transactionid' => $transactionid
                        );
                        $delres = $this->TransactionModel->updateTransaction($payloadDel,$where);
                        array_push($transQuery, $delres);

                        $transaction = $this->TransactionModel->getTransaction(array('transactionid'=>$transactionid))[0];
                        
                        $deletePlanWhere = array(
                            'ornumber' => $transaction->ornumber
                        );
                        $delPlan = $this->CustomerModel->updatePlan($payloadDel,$deletePlanWhere);
                        array_push($transQuery, $delPlan);

                        $delUsedStocks = $this->TransactionModel->updateUsedStocks($payloadDel,$deletePlanWhere);
                        array_push($transQuery, $delUsedStocks);

                        $result = array_filter($transQuery);
                        $res = $this->mysqlTQ($result);

                        if($res){
                            $return = array(
                                '_isError' => false,
                                // 'code'     =>http_response_code(),
                                'reason'   => "Successfuly delete.",
                            );
                        }else{
                            $return = array(
                                '_isError' => true,
                                // 'code'     =>http_response_code(),
                                'reason'   => "Error deleting.",
                            );
                        }
                        
                    }else{
                        $return = array(
                            '_isError' => true,
                            // 'code'     =>http_response_code(),
                            'reason'   => "Invalid or expired OTP.",
                        );
                    }
                }catch (Exception $e) {
                    //return the server error
                    $return = array(
                        '_isError' => true,
                        // 'code'     =>http_response_code(),
                        'reason'   => $e->getMessage(),
                    );
                }
            }
            $this->response->output($return); //echo the json encoded data
        }
        public function generateVoidTransactionOTP(){
            
            $transactionid = $this->input->post("transactionid");
            $userid = $this->input->post("userid");
            $email = $this->input->post("email");
            $fullName = $this->input->post("fullName");

            if(empty($transactionid)){
                $return = array(
                    '_isError' => true,
                    // 'code'     =>http_response_code(),
                    'reason'   => "Empty transaction id",
                );
            }else{
                // $headers = $this->input->request_headers();
                // $token = $headers['Authorization'];
                // if (strpos($token, 'Bearer ') === 0) {
                //     $token = substr($token, 7);
                // }
                // $decoded = decode_jwt($token, $this->config->item('jwt_key'));
                
               
      
                $payload= array(
                    'userid' => $userid,
                    'email' => $email,
                    'name' => $fullName,
                    'action' => 'delete_transaction',
                    'foreign_id' => $this->input->post("transactionid")
                );
                $res = $this->otp->generate_otp($payload);
                if($res){
                    $return = array(
                        '_isError' => false,
                        // 'code'     =>http_response_code(),
                        'reason'   => "Please enter OTP",
                    );
                }else{
                    $return = array(
                        '_isError' => true,
                        // 'code'     =>http_response_code(),
                        'reason'   => "Error sending OTP",
                    );
                }
                
            }

            $this->response->output($return); //echo the json encoded data

        }

        public function mysqlTQ($arrQuery){
            $arrayIds = array();
            if (!empty($arrQuery)) {
                $this->db->trans_start();
                foreach ($arrQuery as $value) {
                    $this->db->query($value);
                    $last_id = $this->db->insert_id();
                    array_push($arrayIds,$last_id);
                }
                if ($this->db->trans_status() === FALSE) {
                    $this->db->trans_rollback();
                } else {
                    $this->db->trans_commit();
                   
                    return $arrayIds;
                }
            }
        }
    }
?>