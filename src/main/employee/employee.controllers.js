const employeeScript = require("./employee.scripts");


const checkRoleAccess = (req,res)  => {
    employeeScript.checkRoleAccess(req,res);
}

const updateRoleId = (req,res)  => {
    employeeScript.updateRoleId(req,res);
}

module.exports = {
    checkRoleAccess,
    updateRoleId
}