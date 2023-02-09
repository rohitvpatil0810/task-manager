let sqlQuery1 = "CREATE DATABASE IF NOT EXISTS TaskManager; ";
let sqlQuery2 =
  "CREATE TABLE IF NOT EXISTS admin (id VARCHAR(255), name VARCHAR(255), email VARCHAR(255), mobile VARCHAR(255), password VARCHAR(255));";

let sqlQuery3 =
  "CREATE TABLE IF NOT EXISTS manager (managerId VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), mobile VARCHAR(255), password VARCHAR(255));";

let sqlQuery4 =
  "CREATE TABLE IF NOT EXISTS client (clientId VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), mobile VARCHAR(255), organization VARCHAR(255), password VARCHAR(255));";

let sqlQuery5 =
  "CREATE TABLE IF NOT EXISTS department (departmentId VARCHAR(255) PRIMARY KEY, departmentName VARCHAR(255), managerId VARCHAR(255), FOREIGN KEY (managerId) REFERENCES manager(managerId));";

let sqlQuery6 =
  "CREATE TABLE IF NOT EXISTS operator (operatorId VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), mobile VARCHAR(255), password VARCHAR(255), departmentId VARCHAR(255), active enum('Active', 'Deleted'), FOREIGN KEY (departmentId) REFERENCES department(departmentId));";

let sqlQuery7 =
  'CREATE TABLE IF NOT EXISTS task (taskID VARCHAR(255) PRIMARY KEY , clientId VARCHAR(255) , operatorId VARCHAR(255) , managerId VARCHAR(255) , ProjectName VARCHAR(255) , taskName VARCHAR(255) , taskDescription TEXT , openDate DATE , closeDate DATE , clientNote TEXT , managerNote TEXT , priority enum ("Low" , "Medium" , "High") , AssignationStatus enum ("Pending" , "Assigned" , "Reassigned") DEFAULT "Pending" , taskStatus enum ("Pending", "inProgress" , "Completed" , "Closed") DEFAULT "Pending" , clientApproval enum ("Pending" , "Accepted" , "Rejected") DEFAULT "Pending" , managerApproval enum ("Pending" , "Accepted" , "Rejected") DEFAULT "Pending" , taskCategory enum ("Scheduled" , "RunTime") , FOREIGN KEY (clientId) REFERENCES client(clientId) , FOREIGN KEY (operatorId) REFERENCES operator(operatorId) , FOREIGN KEY (managerId) REFERENCES manager(managerId));';

let sqlQuery8 =
  "CREATE TABLE IF NOT EXISTS taskTimeline (timelineId VARCHAR(255) PRIMARY KEY, taskId VARCHAR(255), openDate DATE, closeDate DATE, actualCloseDate DATE, managerApprovalDate DATE, clientApprovalDate DATE, managerRejectionDate DATE, clientRejection DATE, assignationDate DATE, completionDate DATE, lastReassignation DATE, operatorAcceptDate DATE, FOREIGN KEY (taskId) REFERENCES task(taskId) );";

let sqlQuery9 =
  "CREATE TABLE IF NOT EXISTS attachments (attachmentId VARCHAR(255) PRIMARY KEY, taskId VARCHAR(255), documentName VARCHAR(255), driveLink VARCHAR(255), FOREIGN KEY (taskId) REFERENCES task(taskId));";

let sqlQuery10 =
  'CREATE TABLE IF NOT EXISTS operatorStatus (statusId VARCHAR(255), operatorId VARCHAR(255), taskId VARCHAR(255), operatorNote VARCHAR(255), acceptStatus enum("Pending", "Accepted") DEFAULT "Pending", FOREIGN KEY (operatorId) REFERENCES operator(operatorId), FOREIGN KEY (taskId) REFERENCES task(taskId));';
module.exports = [
  sqlQuery1,
  sqlQuery2,
  sqlQuery3,
  sqlQuery4,
  sqlQuery5,
  sqlQuery6,
  sqlQuery7,
  sqlQuery8,
  sqlQuery9,
  sqlQuery10,
];
