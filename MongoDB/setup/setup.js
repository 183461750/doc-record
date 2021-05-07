db = db.getSiblingDB('newDB');  // 创建一个名为"newDB"的DB
db.createUser(  // 创建一个名为"shon"的用户，设置密码和权限
    {
        user: "shon",
        pwd: "shonlovescoding",
        roles: [
            { role: "dbOwner", db: "newDB"}
        ]
    }
);
db.createCollection("newCollection");  // 在"newDB"中创建一个名为"newCollection"的Collection
