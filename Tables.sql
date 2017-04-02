CREATE TABLE Employees
(
	FirstName VARCHAR(20) NOT NULL,
	LastName VARCHAR(20) NOT NULL,
    UserID VARCHAR(15) NOT NULL,
    Wage FLOAT NOT NULL,
    DepartmentID VARCHAR(20) NOT NULL,
    Username VARCHAR(20) NOT NULL,
    Password VARCHAR(20) NOT NULL,
    PRIMARY KEY(UserID)
);
CREATE TABLE Customers
(
	Name VARCHAR(40) NOT NULL,
    CustomerID INT AUTO_INCREMENT,
    Email VARCHAR(40),
    Password VARCHAR(20) NOT NULL,
    PRIMARY KEY(CustomerID)
);
CREATE TABLE Projects
(
	Name VARCHAR(40) NOT NULL,
    ProjectID INT AUTO_INCREMENT,
    DepartmentID VARCHAR(20) NOT NULL,
    CustomerID INT NOT NULL,
    ExpectedHours FLOAT NOT NULL,
    BillDue FLOAT DEFAULT 0,
    BillTotal FLOAT DEFAULT 0,
    PRIMARY KEY(ProjectID)
);
CREATE TABLE Departments
(
	Name VARCHAR(40) NOT NULL,
    DepartmentID INT AUTO_INCREMENT,
    ManagerID VARCHAR(15) NOT NULL,
    PRIMARY KEY(DepartmentID)
);
CREATE TABLE TimeEntries
(
	UserID VARCHAR(15) NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME,
    ProjectID INT,
    Hours Float
);