const checkUserRole = "select * from methi_user_master s where s.user_id = $1";
const updateRole = "update methi_user_master set role_id = $2 where user_id = $1";

module.exports={
    checkUserRole,
    updateRole
}