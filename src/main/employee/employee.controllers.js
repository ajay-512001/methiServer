const employeeScript = require("./employee.scripts");


const checkRoleAccess = (req,res)  => {
    employeeScript.checkRoleAccess(req,res);
}

const updateRoleId = (req,res)  => {
    employeeScript.updateRoleId(req,res);
}

const getEmployeeDetailsById = (req,res)  => {
    employeeScript.getEmployeeDetailsById(req,res);
}

const getRoles = (req,res)  => {
    employeeScript.getRoles(req,res);
}

const verifyemailandwhatsapp = (req,res)  => {
    employeeScript.verifyemailandwhatsapp(req,res);
}

const getEmployeeList = (req,res)  => {
    employeeScript.getEmployeeList(req,res);
}

const createEmployee = (req,res)  => {
    employeeScript.createEmployee(req,res);
}

const RequestForEmailWhatsappVerification = (req,res)  => {
    employeeScript.RequestForEmailWhatsappVerification(req,res);
}

const updateEmployee = (req,res)  => {
    employeeScript.updateEmployee(req,res);
}

const getRoleWiseEmployeeList = (req,res)  => {
    employeeScript.getRoleWiseEmployeeList(req,res);
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