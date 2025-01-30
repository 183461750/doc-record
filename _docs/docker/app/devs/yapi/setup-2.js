db.auth("admin", "admin123456")
db.createUser({
    user: 'yapi',
    pwd: 123456,
    roles: [
        {role: "dbAdmin", db: "yapi"},
        {role: "readWrite", db: "yapi"}
    ]
});

