const pool = require("../../configs/databaseConnection");
const sendMail = require('../../utils/sendEmails/sendMailFunction');
const bcrypt = require('bcrypt');
const employeeQueries = require('./employee.queries');
const EmployeeModel = require("./employee.model");
const { generateOtp } = require("../Authentication/Authentication.scripts");

let saltRounds = 10;

const filterResponse = (databaseResponse) => {
    const parsed = defaultEmployeeSchema.safeParse(databaseResponse);
    if (!parsed.success) {
        console.error("Validation failed for response:", parsed.error);
        return null;
    }
    return parsed.data;
};

const checkRoleAccess = async (req,res) => {
    const { user_id } = req.body;
    try {
        let user = await pool.query(employeeQueries.checkUserRole, [user_id]);
        if(user.rows[0].user_id){
            let role_id = user.rows[0].role_id;
            if(typeof role_id != 'undefined' && role_id != null){
                if(role_id == 1){
                    res.status(200).json({data:true,role_id:role_id,msg:"You are authorized.", isComplete:true});
                }else{
                    res.status(202).json({data:true,role_id:role_id, msg:"You are not authorized.",  isComplete:false});
                }
            }else{
                res.status(203).json({data: false,role_id:role_id, msg:"your role is not defined.",  isComplete:false});
            }
        } else{
            res.status(204).json({msg : "user not found" , isComplete:false});   
        }
    } catch (error) {
        res.status(500).json({msg : "something went wrong",error:error.message, isComplete:false});
    }
}

const updateRoleId = async (req,res) => {
    const { role_id,user_id } = req.body;
    try {
        let user = await pool.query(employeeQueries.updateRole, [user_id,role_id]);
        let upUser = await pool.query(employeeQueries.checkUserRole, [user_id]);
        await sendMail.module.sendNotificationRequest({user_name : upUser.rows[0].full_name , to : upUser.rows[0].email},"accountUppdated");
        res.status(200).json({data: user.rows[0], msg : "Role is updated" , isComplete:true});
    } catch (error) {
        console.log(error, error.message)
        res.status(210).json({msg : "Token Expired" , code :210, isComplete:false});
    }
}

const getRoles = async (req,res) => {
    const { user_id } = req.body; 
    try {
        let roleInfo = await pool.query(employeeQueries.getRoles);
        res.status(200).json({data:roleInfo.rows,msg:"success.", isComplete:true});
    } catch (error) {
        console.log(error, error.message);
        res.status(500).json({msg : "Something Went Wrong" ,error: error.message, code :500, isComplete:false});
    }
}

const RequestForEmailWhatsappVerification = async (req,res) => {
    const { user_id,emailReqest,whatsappRequest } = req.body;
    let emailupdate = false;
    let numberupdate = false;
    try {
        let user = await pool.query(employeeQueries.checkUserRole, [user_id]);
        if(emailReqest) {
            const emailotp = await generateOtp();
            await pool.query(employeeQueries.requestOtpForEmail, [user_id,emailotp]);
            await sendMail.module.sendNotificationRequest({otp_code : emailotp , to : user.rows[0].email},"verificationEmail");
            emailupdate = true;
        }

        if(whatsappRequest){
            const numberotp = await generateOtp();
            await pool.query(employeeQueries.requestOtpForNumber, [user_id,numberotp]);
            await sendMail.module.sendNotificationRequest({otp_code : numberotp , to : user.rows[0].email},"verificationEmail");
            numberupdate = true;
        }

        if(numberupdate && emailupdate){
            res.status(200).json({data:true,msg:"email and number verification request raised.", code:'f', isComplete:true});
        }else if(numberupdate) {
            res.status(200).json({data:true,msg:"number verification request raised.", code:'n', isComplete:true});
        }else if(emailupdate) {
            res.status(200).json({data:true,msg:"email verification request raised.", code:'e', isComplete:true});
        }else{
            res.status(210).json({data:false,msg:"No request has been raised please try again later.", code:'na', isComplete:false});
        }


    } catch (error) {
        console.log(error, error.message);
        res.status(500).json({msg : "Something Went Wrong" ,error: error.message, code :500, isComplete:false});
    }
}

const verifyemailandwhatsapp = async (req,res) => {
    const { user_id,Number,email,emailotp,whatotp } = req.body;
    let emailupdate = false;
    let numberupdate = false;
    let upFlagEmail = false;
    let upFlagNumber = false;
    try {
        let userInfo = await pool.query(employeeQueries.checkUserRole, [user_id]);
        let employeeInfo = await pool.query(employeeQueries.getEmployeeInfo, [user_id]);
        if((typeof Number!='undefined' && Number!=null && Number!="") && (typeof whatotp!='undefined' && whatotp!=null && whatotp!="")){
           if((new Date() - new Date(employeeInfo.rows[0].whatsapp_otp_created_at)) / (1000 * 60) >= 10){
            res.status(210).json({data:false,msg:"Otp is expired for whastapp.", isComplete:false});
           }else{
            if(whatotp == employeeInfo.rows[0].whatsapp_verification_otp_temp){
                upFlagNumber = await pool.query(employeeQueries.updateFlagNumber, [user_id]);
                numberupdate = true;
            }else{
                res.status(210).json({data:false,msg:"Wrong Otp.", isComplete:false});
            }
           }
        }
        if((typeof email!='undefined' && email!=null && email!="") && (typeof emailotp!='undefined' && emailotp!=null && emailotp!="")){
            if((new Date() - new Date(employeeInfo.rows[0].email_otp_created_at)) / (1000 * 60) >= 10){
                res.status(210).json({data:false,msg:"Otp is expired for email.", isComplete:false});
               }else{
                if(emailotp == employeeInfo.rows[0].email_verification_otp_temp){
                    upFlagEmail = await pool.query(employeeQueries.updateFlagEmail, [user_id]);
                    emailupdate = true;
                }else{
                    res.status(210).json({data:false,msg:"Wrong Otp.", isComplete:false});
                }
               }
        }

        if(upFlagNumber && upFlagEmail){
            await sendMail.module.sendNotificationRequest({user_name : userInfo.rows[0].full_name , to : userInfo.rows[0].email},"verificationSuccess");
            res.status(200).json({data:true,msg:"email and number verified.", isComplete:true});
        }else if(upFlagNumber) {
            await sendMail.module.sendNotificationRequest({user_name : userInfo.rows[0].full_name , to : userInfo.rows[0].email},"verificationSuccess");
            res.status(200).json({data:true,msg:"number verified.", isComplete:true});
        }else if(upFlagEmail) {
            await sendMail.module.sendNotificationRequest({user_name : userInfo.rows[0].full_name , to : userInfo.rows[0].email},"verificationSuccess");
            res.status(200).json({data:true,msg:"email verified.", isComplete:true});
        }else{
            res.status(210).json({data:false,msg:"data are not provided.", isComplete:false});
        }
    } catch (error) {
        console.log(error, error.message);
        res.status(500).json({msg : "Something Went Wrong" ,error: error.message, code :500, isComplete:false});
    }
}

const getEmployeeList = async (req,res) => {
    const { user_id,role_id,admin_id } = req.body; 
    try {
        let userList = ""
        if(role_id > 1 && admin_id != null && admin_id != undefined){
            userList = await pool.query(employeeQueries.getUserList, [admin_id]);
        }else if(role_id == 1){
            userList = await pool.query(employeeQueries.getUserList, [user_id]);
        }else{
            res.status(200).json({data:[],msg:"No data found.", isComplete:true});
            return;
        }
        const userIds = userList.rows.map(user => user.user_id);
        let employeeList = await pool.query(employeeQueries.getEmployeeList, [userIds]);
        if(userList.rows[0]){
        userList.rows.forEach(e => {
            delete e.password;
            delete e.temp_otp; 
        });}

        if(employeeList.rows[0]){
        employeeList.rows.forEach(e => {
            delete e.whatsapp_verification_otp_temp;
            delete e.email_verification_otp_temp;
        });}
        const getRoles = await pool.query(employeeQueries.getRoles);
        const array2Map = Object.fromEntries(employeeList.rows.map(item => [item.user_id, item]));
        const mergedArray = userList.rows.map(item1 => ({ ...item1, ...(array2Map[item1.user_id] || {}) }));
        let updatedDataArray = mergedArray.map(row => {
            return {
              ...row,
              admin_name: userList.rows.find(user => user.user_id === row.admin_id)?.full_name || null,
              snr_name: userList.rows.find(user => user.user_id === row.snr_id)?.full_name || null,
              tl_name: userList.rows.find(user => user.user_id === row.tl_id)?.full_name || null,
              mngr_name: userList.rows.find(user => user.user_id === row.mngr_id)?.full_name || null,
              role_name: getRoles.rows.find(user => user.role_master_id === row.role_id)?.role_desc || null,
            };
          });
        if(role_id){
            updatedDataArray = updatedDataArray.filter(fn => fn.role_id >= parseInt(role_id));
        }
        
        res.status(200).json({data:updatedDataArray,msg:"success.", isComplete:true});
    } catch (error) {
        console.log(error, error.message);
        res.status(500).json({msg : "Something Went Wrong" ,error: error.message, code :500, isComplete:false});
    }
}

const getEmployeeDetailsById = async (req,res) => {
    const { user_id } = req.body; 
    try {
        let userInfo = await pool.query(employeeQueries.checkUserRole, [user_id]);
        let employeeInfo = await pool.query(employeeQueries.getEmployeeInfo, [user_id]);
        delete userInfo.rows[0].password;
        delete userInfo.rows[0].temp_otp;
        if(employeeInfo.rows[0]){
            delete employeeInfo.rows[0].whatsapp_verification_otp_temp;
            delete employeeInfo.rows[0].email_verification_otp_temp;
        }
        const normalizedDataForUser = EmployeeModel.normalizeUser(userInfo.rows[0]);
        const normalizedDataForEmployee = EmployeeModel.normalizeEmployee(employeeInfo.rows[0]);
        const combinedResponse = { ...normalizedDataForUser, ...normalizedDataForEmployee };
        res.status(200).json({data:combinedResponse,msg:"success.", isComplete:true});
    } catch (error) {
        console.log(error, error.message);
        res.status(500).json({msg : "Something Went Wrong" ,error: error.message, code :500, isComplete:false});
    }
}

const createEmployee = async (req,res) => {
    try {
        let user = await pool.query(employeeQueries.checkUserByEmail, [req.body.email]);
        if(user.rows.length > 0){
            res.status(210).json({data:false,msg:"user alredy exists with this email.", isComplete:true});
        }else {
            const userData = EmployeeModel.fromPayloadUserMaster(req.body);
            const hashPassword = await bcrypt.hash(userData.password, saltRounds);
            userData.password = hashPassword;
            const keysUser = Object.keys(userData).join(', ');
            const valuesUser = Object.values(userData);
            const placeholdersUser = valuesUser.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO methi_user_master (${keysUser}) VALUES (${placeholdersUser}) RETURNING *`;
            const result = await pool.query(query, valuesUser);
            let userList = await pool.query(employeeQueries.getUserList, [req.body.user_id]);
            let array = ['admin_id', 'mngr_id', 'tl_id', 'snr_id']
            array.forEach((field, index) => {
                userData[field] = userData.role_id === index + 1 
                  ? userList.rows.find(users => users.user_id === result.rows[0].user_id).user_id
                  : userData[field];
            });
            const keysUserup = Object.keys(userData);
            const valuesUserup = Object.values(userData);
            const UpdatesUser = keysUserup.map((key, index) => `${key} = $${index + 1}`).join(', ');
            const queryup = `UPDATE methi_user_master set ${UpdatesUser} where user_id = ${result.rows[0].user_id} RETURNING *`;
            const resultup = await pool.query(queryup,valuesUserup);

            const { employee_id, ...employeeData } = EmployeeModel.fromPayloadEmployeeMaster(req.body);
            employeeData.user_id = result.rows[0].user_id;
            if(employeeData.is_email === "true"){ employeeData.is_email = true } else { employeeData.is_email = false };
            if(employeeData.is_whatsapp === "true"){ employeeData.is_whatsapp = true } else { employeeData.is_whatsapp = false };
            const keysEmplyee = Object.keys(employeeData).join(', ');
            const valuesEmplyee = Object.values(employeeData);
            const placeholdersEmplyee = valuesEmplyee.map((_, i) => `$${i + 1}`).join(', ');
            const queryEmplyee = `INSERT INTO methi_employee_master_details (${keysEmplyee}) VALUES (${placeholdersEmplyee}) RETURNING *`;
            const resultEmployee = await pool.query(queryEmplyee, valuesEmplyee);

            let data = Object.assign({}, resultup.rows[0], resultEmployee.rows[0]);

            res.status(200).json({data:data,msg:"success.", isComplete:true});
        }
    } catch (error) {
        console.log(error, error.message);
        res.status(500).json({msg : "Something Went Wrong" ,error: error.message, code :500, isComplete:false});
    }
}

const updateEmployee = async (req,res) => {
    try {
        let user = await pool.query(employeeQueries.checkUserByEmail, [req.body.email]);
        if(user.rows.length == 0){
            res.status(210).json({data:false,msg:"user does not exists with this email.", isComplete:true});
        }else {
            let userList = await pool.query(employeeQueries.getUserList, [req.body.user_id]);
            const { password, ...userData } = EmployeeModel.fromPayloadUserMaster(req.body);
            ['admin_id', 'mngr_id', 'tl_id', 'snr_id'].forEach((field, index) => {
                userData[field] = userData.role_id === index + 1 
                  ? userList.rows.find(users => users.user_id === user.rows[0].user_id).user_id
                  : userData[field];
            });
            const keysUser = Object.keys(userData);
            const valuesUser = Object.values(userData);
            const UpdatesUser = keysUser.map((key, index) => `${key} = $${index + 1}`).join(', ');
            const query = `UPDATE methi_user_master set ${UpdatesUser} where user_id = ${user.rows[0].user_id} RETURNING *`;
            const result = await pool.query(query,valuesUser);

            const { employee_id, ...employeeData } = EmployeeModel.fromPayloadEmployeeMaster(req.body);
            employeeData.user_id = result.rows[0].user_id;
            if(employeeData.is_email == "true"){ employeeData.is_email = true } else { employeeData.is_email = false };
            if(employeeData.is_whatsapp == "true"){ employeeData.is_whatsapp = true } else { employeeData.is_whatsapp = false };
            const keysEmplyee = Object.keys(employeeData);
            const valuesEmplyee = Object.values(employeeData);
            const updateEmplyee = keysEmplyee.map((key, index) => `${key} = $${index + 1}`).join(', ');
            const queryEmplyee = `UPDATE methi_employee_master_details set ${updateEmplyee} where user_id = ${employeeData.user_id} RETURNING *`;
            const resultEmployee = await pool.query(queryEmplyee, valuesEmplyee);
            let data = Object.assign({}, result.rows[0], resultEmployee.rows[0]);
            res.status(200).json({data:data,msg:"success.", isComplete:true});
        }
    } catch (error) {
        console.log(error, error.message);
        res.status(500).json({msg : "Something Went Wrong" ,error: error.message, code :500, isComplete:false});
    }
}

const getRoleWiseEmployeeList = async (req,res) => {
    const { user_id,admin_id } = req.body; 
    try {
        let userList = await pool.query(employeeQueries.getUserList, [admin_id]);
        const userIds = userList.rows.map(user => user.user_id);
        let employeeList = await pool.query(employeeQueries.getEmployeeList, [userIds]);
        if(userList.rows[0]){
        userList.rows.forEach(e => {
            delete e.password;
            delete e.temp_otp; 
        });}

        if(employeeList.rows[0]){
        employeeList.rows.forEach(e => {
            delete e.whatsapp_verification_otp_temp;
            delete e.email_verification_otp_temp;
        });}

        const array2Map = Object.fromEntries(employeeList.rows.map(item => [item.user_id, item]));
        const mergedArray = userList.rows.map(item1 => ({ ...item1, ...(array2Map[item1.user_id] || {}) }));
        const updatedDataArray = mergedArray.map(row => {
            return {
              ...row,
              admin_name: userList.rows.find(user => user.user_id === row.admin_id)?.full_name || null,
              snr_name: userList.rows.find(user => user.user_id === row.snr_id)?.full_name || null,
              tl_name: userList.rows.find(user => user.user_id === row.tl_id)?.full_name || null,
              mngr_name: userList.rows.find(user => user.user_id === row.mngr_id)?.full_name || null
            };
          });

        /* logic of creating different on basis of their role */
        const groupedArray = updatedDataArray.reduce(
            (acc, user) => {
              const baseObject = {
                user_id: user.user_id,
                role_id: user.role_id,
                full_name: user.full_name,
                admin_id: user.admin_id,
                mngr_id: user.mngr_id,
                snr_id: user.snr_id,
                tl_id: user.tl_id,
                admin_name: user.admin_name,
                mngr_name: user.mngr_name,
                snr_name: user.snr_name,
                tl_name: user.tl_name,
              };
          
              switch (user.role_id) {
                case 1: // Admin
                  acc.adminList.push(baseObject);
                  break;
                case 2: // Manager
                  acc.managerList.push(baseObject);
                  break;
                case 3: // Team Leader
                  acc.teamLeaderList.push(baseObject);
                  break;
                case 4: // Senior
                  acc.seniorList.push(baseObject);
                  break;
                default:
                  acc.otherList.push(baseObject);
                  break;
              }
          
              return acc;
            },
            {
              adminList: [],
              managerList: [],
              teamLeaderList: [],
              seniorList: [],
              otherList: [],
            }
          );
        res.status(200).json({data:groupedArray,msg:"success.", isComplete:true});
    } catch (error) {
        console.log(error, error.message);
        res.status(500).json({msg : "Something Went Wrong" ,error: error.message, code :500, isComplete:false});
    }
}

module.exports = {
    checkRoleAccess,
    updateRoleId,
    getEmployeeDetailsById,
    getRoles,
    verifyemailandwhatsapp,
    getEmployeeList,
    createEmployee,
    RequestForEmailWhatsappVerification,
    updateEmployee,
    getRoleWiseEmployeeList
}