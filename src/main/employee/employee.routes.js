const employeeRouter = require('express')
const employeeController = require('./employee.controllers')
const employeerouter = employeeRouter();

employeerouter.post('/checkroleaccess', employeeController.checkRoleAccess);

employeerouter.post('/updateroleid', employeeController.updateRoleId);

module.exports = employeerouter;