//* @HfsUser*/
db.getCollection('@HfsUser').createIndex({ schoolId: 1 });
db.getCollection('@HfsUser').createIndex({ grade: 1 });
db.getCollection('@HfsUser').createIndex({ memberStatus: 1 });
db.getCollection('@HfsUser').createIndex({ memberExpireTime: 1 });