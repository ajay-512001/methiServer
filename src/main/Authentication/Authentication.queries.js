const checkEmailExits = "select s from methi_user_master s where s.email = $1";
const addUser = "INSERT INTO methi_user_master(email, password, full_name, number, is_active, temp_otp) VALUES ($1, $2, $3, $4, $5, $6)";
const getUser = "select * from methi_user_master where email = $1";
const getotp = "select temp_otp from methi_user_master where user_id = $1"
const getUserId = "select user_id from methi_user_master where email = $1";
const getisactivetrue = "update methi_user_master set is_active = true where user_id = $1";
const updateOtp = "update methi_user_master set temp_otp = $2 where user_id = $1";

module.exports={
    checkEmailExits,
    addUser,
    getUser,
    getotp,
    getUserId,
    getisactivetrue,
    updateOtp
}