const checkEmailExits = "select s from methi_user_master s where s.email = $1";
const addUser = "INSERT INTO methi_user_master(email, password, full_name, number, is_active, temp_otp,role_id) VALUES ($1, $2, $3, $4, $5, $6, $7)";
const getUser = "select * from methi_user_master where email = $1";
const getotp = "select * from methi_user_master where user_id = $1"
const getUserId = "select user_id from methi_user_master where email = $1";
const getisactivetrue = "update methi_user_master set is_active = true where user_id = $1";
const updateOtp = "update methi_user_master set temp_otp = $2 where user_id = $1";
const getotpbyEmail = "select * from methi_user_master where email = $1";
const addEmployMasterEntry = "INSERT INTO methi_employee_master_details(user_id, joining_date ,is_active) VALUES ($1, $2, $3)";

module.exports={
    checkEmailExits,
    addUser,
    getUser,
    getotp,
    getUserId,
    getisactivetrue,
    updateOtp,
    getotpbyEmail,
    addEmployMasterEntry
}