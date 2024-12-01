const checkUserRole = "select * from methi_user_master s where s.user_id = $1";
const getEmployeeInfo = "select * from methi_employee_master_details s where s.user_id = $1";
const getRoles = "select * from user_role_master;";
const updateRole = "update methi_user_master set role_id = $2,admin_id =$1 where user_id = $1";
const updateFlagEmail = "update methi_user_master set isemailverified = true where user_id = $1";
const updateFlagNumber = "update methi_user_master set isnumberverified = true where user_id = $1";
const getUserList = "select * from methi_user_master s where s.admin_id = $1 order by user_id";
const getUserListbyRole = "select * from methi_user_master s where s.role_id >= $1 and s.admin_id = $2 order by user_id";
const getEmployeeList = "select * from methi_employee_master_details s where s.user_id =  ANY($1) order by user_id";
const checkUserByEmail = "select * from methi_user_master s where s.email = $1";
const requestOtpForNumber = "update methi_employee_master_details set whatsapp_verification_otp_temp = $2 where user_id = $1";
const requestOtpForEmail = "update methi_employee_master_details set email_verification_otp_temp = $2 where user_id = $1";

module.exports={
    checkUserRole,
    updateRole,
    getEmployeeInfo,
    getRoles,
    updateFlagEmail,
    updateFlagNumber,
    getUserList,
    getEmployeeList,
    checkUserByEmail,
    requestOtpForNumber,
    requestOtpForEmail,
    getUserListbyRole
}