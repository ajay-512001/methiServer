const pool = require("../../configs/databaseConnection");
const sendMail = require('../../utils/sendEmails/sendMailFunction');
const employeeQueries = require('./employee.queries');


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
        res.status(200).json({data: user.rows[0], msg : "Role is updated" , isComplete:true});
    } catch (error) {
        res.status(210).json({msg : "Token Expired" , code :210, isComplete:false});
    }
}


module.exports = {
    checkRoleAccess,
    updateRoleId
}