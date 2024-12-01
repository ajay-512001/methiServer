const employeeRouter = require('express')
const employeeController = require('./employee.controllers')
const employeerouter = employeeRouter();

employeerouter.post('/checkroleaccess', employeeController.checkRoleAccess);

employeerouter.post('/updateroleid', employeeController.updateRoleId);

employeerouter.post('/getEmployeeDetailsById', employeeController.getEmployeeDetailsById);

employeerouter.post('/getRoles', employeeController.getRoles);

employeerouter.post('/verifyemailandwhatsapp', employeeController.verifyemailandwhatsapp);

employeerouter.post('/getEmployeeList', employeeController.getEmployeeList);

employeerouter.post('/createEmployee', employeeController.createEmployee);

employeerouter.post('/RequestForEmailWhatsappVerification', employeeController.RequestForEmailWhatsappVerification);

employeerouter.post('/updateEmployee', employeeController.updateEmployee);

employeerouter.post('/getRoleWiseEmployeeList', employeeController.getRoleWiseEmployeeList);

module.exports = employeerouter;