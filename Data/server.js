//Author - Ryder Schoon
/**
 * This is our Node.JS code, running server-side.
 */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var mysql = require('mysql');
var ioPort  = 5000;
var serverPort  = 4000;
	
var connection = mysql.createConnection(
    {
        host: 'us-cdbr-azure-east-c.cloudapp.net',
        user: 'b2291f79d4737a',
        password: '8569c35a',
        database: 'timeclock2',
    }
);

connection.connect();
console.log("database connected");

base_dir = __dirname.substr(0,__dirname.length-4);
app.use(express.static(base_dir));
	
//When somebody connects, add these handlers
io.sockets.on('connection', function (socket) {
    socket.on('login', function (email, password) {
        if(isCustomer){
			socket.emit('loginResponse','Customer');
		}
		else if(isManager){
			socket.emit('loginResponse','Manager');
		}
		else if(isEmployee){
			socket.emit('loginResponse','Employee');
		}
		else{
			socket.emit('loginResponse','Invalid username/password');
		}
    });
});

server.listen(4000);
console.log("app server readied");
io.listen(5000);
console.log("Web sockets readied");

//Database Classes
var Employee = function (FirstName, LastName, UserID, Wage, DepartmentID, Email, TimeEntries){
	this.FirstName = FirstName;
	this.LastName = LastName;
	this.UserID = UserID;
	this.Wage = Wage;
	this.DepartmentID = DepartmentID;
	this.Email = Email;
	this.TimeEntries = TimeEntries;
}
var Customer = function (Name, CustomerID, Email, Wage, DepartmentID, Email, Projects){
	this.Name = Name;
	this.CustomerID = CustomerID;
	this.Email = Email;
	this.Projects = Projects;
}
var Project = function (Name, ProjectID, DepartmentID, CustomerID, ExpectedHours, BillDue, BillTotal){
	this.Name = Name;
	this.ProjectID = ProjectID;
	this.DepartmentID = DepartmentID;
	this.CustomerID = CustomerID;
	this.ExpectedHours = ExpectedHours;
	this.BillDue = BillDue;
	this.BillTotal = BillTotal;
}
var Department = function (Name, DepartmentID, ManagerID, Projects, Employees){
	this.Name = Name;
	this.DepartmentID = DepartmentID;
	this.ManagerID = ManagerID;
	this.Projects = Projects;
	this.Employees = Employees;
}
var TimeEntry = function (Name, CustomerID, Email, Wage, DepartmentID, Email, Projects){
	this.Name = Name;
	this.CustomerID = CustomerID;
	this.Email = Email;
	this.Projects = Projects;
}
//Login class Identifier
function isCustomer(email,password){
	var sql = "SELECT * FROM Customers WHERE Email = '"+mysql.escape(email)+"' AND Password = '"+mysql.escape(password)+"';";
        connection.query(sql, function (err, result) {
            if (err)
                console.log("isCustomer select Customers SQL ERROR: " + err + ": " + sql);
            else {
                return rows[0] != undefined;
            }
        });
}
function isEmployee(email,password){
	var sql = "SELECT * FROM Employees WHERE Email = '"+mysql.escape(email)+"' AND Password = '"+mysql.escape(password)+"';";
        connection.query(sql, function (err, result) {
            if (err)
                console.log("isEmployee select Employees SQL ERROR: " + err + ": " + sql);
            else {
                return rows[0] != undefined;
            }
        })
}
function isManager(email,password){
	var sql = "SELECT * FROM Employees WHERE Email = '"+mysql.escape(email)+"' AND Password = '"+mysql.escape(password)+" AND (SELECT * FROM Departments WHERE ManagerID = Employees.userID;";
        connection.query(sql, function (err, result) {
            if (err)
                console.log("isManager select Employees, Departments SQL ERROR: " + err + ": " + sql);
            else {
                return rows[0] != undefined;
            }
        })
}
//PostObject Methods
function postAbility(abilityObject) {
    if (abilityObject == null) {
        return;
    }
    if (abilityObject.ItemID == undefined || abilityObject.ItemID == null) {
        //insert
        var sql = "INSERT INTO ABILITIES (ABILITY_NAME,IMAGE_PATH,SKILL,COST,DESCRIPTION,FLAVOR,IS_HOMEBREW,CREATED_BY,CREATED_DATE) ";
        sql += "VALUES(" + mysql.escape(abilityObject.AbilityName) + "," + mysql.escape(abilityObject.ImagePath) + "," + mysql.escape(abilityObject.Skill) + "," + mysql.escape(abilityObject.Cost) + "," + mysql.escape(abilityObject.Description) + "," + mysql.escape(abilityObject.Flavor) + "," + mysql.escape(abilityObject.IsHomebrew) + "," + mysql.escape(abilityObject.CreatedBy) + ",SYSDATE());";
        connection.query(sql, function (err, result) {
            if (err)
                console.log("postAbility insert ability SQL ERROR: " + err + ":" + sql);
            else {
                var itemID = result.insertId;
                if (abilityObject.Prerequisites != undefined) {
                    for (var i in abilityObject.Prerequisites) {
                        var prereq = abilityObject.Prerequites;
                        connection.query("INSERT INTO PREREQUISITES (ITEM_ID,ITEM_TYPE,DESCRIPTION,IS_HOMEBREW) VALUES(" + itemID + ",'ABILITIES'," + mysql.escape(abilityObject.Prerequisites[i]) + ",true);", function (err, result) {
                            if (err)
                                console.log("postAbility insert prereq SQL ERROR: " + err);
                        });
                    }
                }
                if (abilityObject.Tags != undefined) {
                    for (var i in abilityObject.Tags) {
                        connection.query("INSERT INTO ENTITY_TAGS (ENTITY_ID,ENTITY_TYPE,TAG) VALUES(" + itemID + ",'ABILITIES'," + mysql.escape(abilityObject.Tags[i]) + ");", function (err, result) {
                            if (err)
                                console.log("postAbility insert TAG SQL ERROR: " + err + ":" + sql);
                        });
                    }
                }
            }
        })
    }
    else {
        //update
        /*
        var sql = "UPDATE ABILITIES SET ABILITY_NAME = " + mysql.escape(abilityObject.AbilityName) + ",IMAGE_PATH=" + mysql.escape(abilityObject.ImagePath) + ",SKILL=" + mysql.escape(abilityObject.Skill) + ",COST=" + mysql.escape(abilityObject.Cost) + ",DESCRIPTION=" + mysql.escape(abilityObject.Description) + ",FLAVOR=" + mysql.escape(abilityObject.Flavor) + " WHERE ITEM_ID="+abilityObject.ItemID+";";
        connection.query(sql, function (err, result) {
            if (err)
                console.log("postAbility update ability SQL ERROR: " + err + ":" + sql);
            else {
                var itemID = result.updateId;
                if (abilityObject.Prerequisites != undefined) {
                    connection.query("DELETE FROM PREREQUISITES WHERE ITEM_ID = " + abilityObject.ItemID,function(err){
                        if (err)
                            console.log("postAbility update delete prereq SQL ERROR: " + err + ":" + sql);
                        else{
                            for (var i in abilityObject.Prerequisites) {
                                var prereq = abilityObject.Prerequites;
                                connection.query("INSERT INTO PREREQUISITES (ITEM_ID,ITEM_TYPE,DESCRIPTION,IS_HOMEBREW) VALUES(" + abilityObject.ItemID + ",'ABILITIES'," + mysql.escape(abilityObject.Prerequisites[i]) + ",true);", function (err, result) {
                                    if (err)
                                        console.log("postAbility update prereq SQL ERROR: " + err);
                                });
                            }
                        }
                    });
                }
            }
            if (abilityObject.Tags != undefined) {
                for (var i in abilityObject.Tags) {
                    connection.query("INSERT INTO ENTITY_TAGS (ENTITY_ID,ENTITY_TYPE,TAG) VALUES(" + itemID + ",'ABILITIES'," + mysql.escape(abilityObject.Tags[i]) + ");", function (err, result) {
                        if (err)
                            console.log("postAbility TAG SQL ERROR: " + err + ":" + sql);
                    });
                }
            }
        }
        })
        */
    }
}
//QuerySpecific Methods
function querySpecificAbility(abilityObject,callback) {
    connection.query("SELECT * FROM ABILITIES WHERE ITEM_ID = "+abilityObject.ItemID+";", function(err,rows){
        if(err){
            console.log("QuerySpecificAbility SQL ERROR: " + err);
        }
        else{
            var rowComplete = function (ability) {
                callback(ability);
            }
            toAbility(rows[0], true, rowComplete);
        }
    });
}
//Cast Methods
function toAbility(RowPacket, isShallow, callback) {
    var tagsSet = false;
    var prerequisitesSet = false;
    var ability = new Ability(RowPacket.ITEM_ID,
                        RowPacket.ABILITY_NAME,
                        RowPacket.IMAGE_PATH,
                        RowPacket.SKILL,
                        RowPacket.COST,
                        RowPacket.DESCRIPTION,
                        RowPacket.FLAVOR,
                        RowPacket.IS_HOMEBREW,
                        RowPacket.CREATED_BY,
                        RowPacket.CREATED_DATE,
                        RowPacket.MODIFIED_BY,
                        RowPacket.MODIFIED_DATE,
                        null,
                        null);
    if (isShallow) {
        var processCallback = function () {
            if (prerequisitesSet && tagsSet) {
                if (callback) callback(ability);
                return ability;
            }
        }
        var addTags = function (tags, callback) {
            ability.Tags = tags;
            tagsSet = true;
            processCallback()
        }
        var addPrerequisites = function (prerequisites, callback) {
            ability.Prerequisites = prerequisites;
            prerequisitesSet = true;
            processCallback()
        }
        FetchPrerequisites(RowPacket.ITEM_ID, 'ABILITIES', addPrerequisites);
        FetchTags(RowPacket.ITEM_ID, 'ABILITIES', addTags);
    }
    else {
        if (callback) callback(ability);
        return ability;
    }
}
function toAttack(RowPacket) {
    var attack = new Attack(RowPacket.MOB_ID,
                        RowPacket.MOB_TYPE,
                        RowPacket.ATTACK_NAME,
                        RowPacket.ATTACK_BONUS,
                        RowPacket.ATTACK_RANGE,
                        RowPacket.DAMAGE,
                        RowPacket.DESCRIPTION,
                        RowPacket.FLAVOR,
                        RowPacket.IS_HOMEBREW);
    return attack;
}
function toEquipment(RowPacket, isShallow, callback) {
    var tagsSet = false;
    var equipment = new Equipment(RowPacket.ITEM_ID,
                        RowPacket.EQUIPMENT_NAME,
                        RowPacket.IMAGE_PATH,
                        RowPacket.COST,
                        RowPacket.DESCRIPTION,
                        RowPacket.FLAVOR,
                        RowPacket.IS_HOMEBREW,
                        RowPacket.CREATED_BY,
                        RowPacket.CREATED_DATE,
                        RowPacket.MODIFIED_BY,
                        RowPacket.MODIFIED_DATE,
                        null);
    if (isShallow) {
        var processCallback = function () {
            if (tagsSet) {
                if (callback) callback(equipment);
                return equipment;
            }
        }
        var addTags = function (tags, callback) {
            equipment.Tags = tags;
            tagsSet = true;
            processCallback()
        }
        FetchTags(RowPacket.ITEM_ID, 'EQUIPMENT', addTags);
    }
    else {
        if (callback) callback(equipment);
        return equipment;
    }
}
function toMonster(RowPacket, isShallow, callback) {
    var attacksSet = false;
    var skillsSet = false;
    var abilitiesSet = false;
    var talentsSet = false;
    var equipmentSet = false;
    var tagsSet = false;
    var monster = new Monster(RowPacket.ITEM_ID,
                        RowPacket.MONSTER_NAME,
                        RowPacket.IMAGE_PATH,
                        RowPacket.INITIATIVE,
                        RowPacket.MOVEMENT,
                        RowPacket.HP,
                        RowPacket.AC,
                        RowPacket.REFLEX,
                        RowPacket.FORTITUDE,
                        RowPacket.WILL,
                        RowPacket.ABILITY_POINTS,
                        RowPacket.ABILITY_REGEN,
                        RowPacket.DESCRIPTION,
                        RowPacket.FLAVOR,
                        RowPacket.IS_HOMEBREW,
                        RowPacket.CREATED_BY,
                        RowPacket.CREATED_DATE,
                        RowPacket.MODIFIED_BY,
                        RowPacket.MODIFIED_DATE,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null);
    if (isShallow) {
        var processCallback = function () {
            if (attacksSet && skillsSet && abilitiesSet && talentsSet && equipmentSet && tagsSet) {
                if (callback) callback(monster);
                return monster;
            }
        }
        var addAttacks = function (attacks, callback) {
            monster.Attacks = attacks;
            attacksSet = true;
            processCallback();
        }
        var addSkills = function (skills, callback) {
            monster.Skills = skills;
            skillsSet = true;
            processCallback();
        }
        var addAbilities = function (abilities, callback) {
            monster.Abilities = abilities;
            abilitiesSet = true;
            processCallback()
        }
        var addTalents = function (talents, callback) {
            monster.Talents = talents;
            talentsSet = true;
            processCallback()
        }
        var addEquipment = function (equipment, callback) {
            monster.Equipment = equipment;
            equipmentSet = true;
            processCallback()
        }
        var addTags = function (tags, callback) {
            monster.Tags = tags;
            tagsSet = true;
            processCallback()
        }
        FetchAttacks(RowPacket.ITEM_ID, 'MONSTERS', addAttacks);
        FetchSkills(RowPacket.ITEM_ID, 'MONSTERS', addSkills);
        FetchAbilities(RowPacket.ITEM_ID, 'MONSTERS', addAbilities);
        FetchTalents(RowPacket.ITEM_ID, 'MONSTERS', addTalents);
        FetchEquipment(RowPacket.ITEM_ID, 'MONSTERS', addEquipment);
        FetchTags(RowPacket.ITEM_ID, 'MONSTERS', addTags);
    }
    else {
        if (callback) callback(monster);
        return monster;
    }
}
function toNPC(RowPacket, isShallow, callback) {
    var attacksSet = false;
    var skillsSet = false;
    var abilitiesSet = false;
    var talentsSet = false;
    var equipmentSet = false;
    var tagsSet = false;
    var npc = new NPC(RowPacket.ITEM_ID,
                        RowPacket.NPC_NAME,
                        RowPacket.IMAGE_PATH,
                        RowPacket.NPC_LEVEL,
                        RowPacket.INITIATIVE,
                        RowPacket.MOVEMENT,
                        RowPacket.HP,
                        RowPacket.AC,
                        RowPacket.REFLEX,
                        RowPacket.FORTITUDE,
                        RowPacket.WILL,
                        RowPacket.ABILITY_POINTS,
                        RowPacket.ABILITY_REGEN,
                        RowPacket.CHARISMA,
                        RowPacket.CONSTITUTION,
                        RowPacket.DEXTERITY,
                        RowPacket.INTELLIGENCE,
                        RowPacket.LUCK,
                        RowPacket.SPEED,
                        RowPacket.STRENGTH,
                        RowPacket.WISDOM,
                        RowPacket.DESCRIPTION,
                        RowPacket.FLAVOR,
                        RowPacket.IS_HOMEBREW,
                        RowPacket.CREATED_BY,
                        RowPacket.CREATED_DATE,
                        RowPacket.MODIFIED_BY,
                        RowPacket.MODIFIED_DATE,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null);
    if (isShallow) {
        var processCallback = function () {
            if (attacksSet && skillsSet && abilitiesSet && talentsSet && equipmentSet && tagsSet) {
                if (callback) callback(npc);
                return npc;
            }
        }
        var addAttacks = function (attacks, callback) {
            npc.Attacks = attacks;
            attacksSet = true;
            processCallback();
        }
        var addSkills = function (skills, callback) {
            npc.Skills = skills;
            skillsSet = true;
            processCallback();
        }
        var addAbilities = function (abilities, callback) {
            npc.Abilities = abilities;
            abilitiesSet = true;
            processCallback();
        }
        var addTalents = function (talents, callback) {
            npc.Talents = talents;
            talentsSet = true;
            processCallback()
        }
        var addEquipment = function (equipment, callback) {
            npc.Equipment = equipment;
            equipmentSet = true;
            processCallback();
        }
        var addTags = function (tags, callback) {
            npc.Tags = tags;
            tagsSet = true;
            processCallback()
        }
        FetchAttacks(RowPacket.ITEM_ID, 'NPC', addAttacks);
        FetchSkills(RowPacket.ITEM_ID, 'NPC', addSkills);
        FetchAbilities(RowPacket.ITEM_ID, 'NPC', addAbilities);
        FetchTalents(RowPacket.ITEM_ID, 'NPC', addTalents);
        FetchEquipment(RowPacket.ITEM_ID, 'NPC', addEquipment);
        FetchTags(RowPacket.ITEM_ID, 'NPC', addTags);
    }
    else {
        if (callback) callback(npc);
        return npc;
    }
}
function toPrerequisite(RowPacket) {
    var prerequisite = new Prerequisite(RowPacket.ITEM_ID,
                        RowPacket.ITEM_TYPE,
                        RowPacket.DESCRIPTION,
                        RowPacket.IS_HOMEBREW);
    return prerequisite;
}
function toSkill(RowPacket) {
    var skill = new Skill(RowPacket.MOB_ID,
                        RowPacket.MOB_TYPE,
                        RowPacket.SKILL_NAME,
                        RowPacket.SCORE,
                        RowPacket.ATTRIBUTE,
                        RowPacket.DESCRIPTION,
                        RowPacket.FLAVOR,
                        RowPacket.IS_HOMEBREW);
    return skill;
}
function toTag(RowPacket) {
    var tag = new Tag(RowPacket.ENTITY_ID,
                        RowPacket.ENTITY_TYPE,
                        RowPacket.TAG);
    return tag;
}
function toTalent(RowPacket, isShallow, callback) {
    var tagsSet = false;
    var prerequisitesSet = false;
    var talent = new Talent(RowPacket.ITEM_ID,
                        RowPacket.TALENT_NAME,
                        RowPacket.IMAGE_PATH,
                        RowPacket.DESCRIPTION,
                        RowPacket.FLAVOR,
                        RowPacket.IS_HOMEBREW,
                        RowPacket.CREATED_BY,
                        RowPacket.CREATED_DATE,
                        RowPacket.MODIFIED_BY,
                        RowPacket.MODIFIED_DATE,
                        FetchPrerequisites(RowPacket.ITEM_ID, 'Talent'),
                        FetchTags(RowPacket.ITEM_ID, 'Talent'));
    if (isShallow) {
        var processCallback = function () {
            if (prerequisitesSet && tagsSet) {
                if (callback) callback(talent);
                return talent;
            }
        }
        var addTags = function (tags, callback) {
            talent.Tags = tags;
            tagsSet = true;
            processCallback()
        }
        var addPrerequisites = function (prerequisites, callback) {
            talent.Prerequisites = prerequisites;
            prerequisitesSet = true;
            processCallback()
        }
        FetchPrerequisites(RowPacket.ITEM_ID, 'TALENTS', addPrerequisites);
        FetchTags(RowPacket.ITEM_ID, 'TALENTS', addTags);
    }
    else {
        if (callback) callback(talent);
        return talent;
    }
}
//Fetch Methods
function FetchAbilities(MOB_ID, MOB_TYPE, callback) {
    var abilities = [];
    connection.query("SELECT A.* FROM ABILITIES A, MOB_ABILITIES M WHERE M.MOB_TYPE = '" + MOB_TYPE + "' AND M.MOB_ID = " + MOB_ID + " AND A.ITEM_ID = M.ABILITY_ID;", function (err, rows) {
        if (err)
            console.log("FetchAbilities SQL ERROR: " + err);
        else {
            var rowComplete = function (ability) {
                abilities.push(ability);
                if (abilities.length == rows.length) {
                    if (callback) callback(abilities);
                }
            }
            for (var i of rows) {
                toAbility(i, true, rowComplete);
            }
        }
    });
}
function FetchAttacks(MOB_ID, MOB_TYPE, callback) {
    var attacks = [];
    connection.query("SELECT * FROM MOB_ATTACKS WHERE MOB_ID = '" + MOB_ID + "' AND MOB_TYPE = '" + MOB_TYPE + "';", function (err, rows) {
        if (err)
            console.log("FetchAttacks SQL ERROR: " + err);
        else {
            for (var i of rows) {
                attacks.push(toAttack(i));
            }
            if (callback) callback(attacks);
        }
    });
}
function FetchEquipment(MOB_ID, MOB_TYPE, callback) {
    var equipment = [];
    connection.query("SELECT E.* FROM EQUIPMENT E, MOB_EQUIPMENT M WHERE M.MOB_TYPE = '" + MOB_TYPE + "' AND M.MOB_ID = " + MOB_ID + " AND E.ITEM_ID = M.EQUIPMENT_ID;", function (err, rows) {
        if (err)
            console.log("FetchEquipment SQL ERROR: " + err);
        else {
            var rowComplete = function (item) {
                equipment.push(item);
                if (equipment.length == rows.length) {
                    if (callback) callback(equipment);
                }
            }
            for (var i of rows) {
                toEquipment(i, true, rowComplete);
            }
        }
    });
}
function FetchPrerequisites(ITEM_ID, ITEM_TYPE, callback) {
    var prerequisites = [];
    connection.query("SELECT * FROM PREREQUISITES WHERE ITEM_ID = '" + ITEM_ID + "' AND ITEM_TYPE = '" + ITEM_TYPE + "';", function (err, rows) {
        if (err)
            console.log("FetchPrerequisites SQL ERROR: " + err);
        else {
            for (var i of rows) {
                prerequisites.push(toPrerequisite(i));
            }
            if (callback) callback(prerequisites);
        }
    });

}
function FetchSkills(MOB_ID, MOB_TYPE, callback) {
    var skills = [];
    connection.query("SELECT * FROM MOB_SKILLS WHERE MOB_ID = '" + MOB_ID + "' AND MOB_TYPE = '" + MOB_TYPE + "';", function (err, rows) {
        if (err)
            console.log("FetchSkills SQL ERROR: " + err);
        else {
            for (var i of rows) {
                skills.push(toSkill(i));
            }
            if (callback) callback(skills);
        }
    });
}
function FetchTags(ENTITY_ID, ENTITY_TYPE, callback) {
    var tags = [];
    connection.query("SELECT * FROM ENTITY_TAGS WHERE ENTITY_ID = '" + ENTITY_ID + "' AND ENTITY_TYPE = '" + ENTITY_TYPE + "';", function (err, rows) {
        if (err)
            console.log("FetchTags SQL ERROR: " + err);
        else {
            for (var i of rows) {
                tags.push(toTag(i));
            }
            if (callback) callback(tags);
        }
    });
}
function FetchTalents(MOB_ID, MOB_TYPE, callback) {
    var talents = [];
    connection.query("SELECT T.* FROM TALENTS T, MOB_TALENTS M WHERE M.MOB_TYPE = '" + MOB_TYPE + "' AND M.MOB_ID = " + MOB_ID + " AND T.ITEM_ID = M.TALENT_ID;", function (err, rows) {
        if (err)
            console.log("FetchTalents SQL ERROR: " + err);
        else {
            var rowComplete = function (talent) {
                talents.push(talent);
                if (talents.length == rows.length) {
                    if (callback) callback(talents);
                }
            }
            for (var i of rows) {
                toTalent(i, true, rowComplete);
            }
        }
    });
}