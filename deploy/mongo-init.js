const username = encodeURIComponent(process.env.MONGO_INITDB_ROOT_USERNAME);
const password = encodeURIComponent(process.env.MONGO_INITDB_ROOT_PASSWORD);
const connection = new Mongo(
  `mongodb://${username}:${password}@mongo:27017/admin?directConnection=true`,
);
const admin = connection.getDB("admin");
let status;
try {
  status = admin.runCommand({ replSetGetStatus: 1 });
} catch (error) {
  if (error.code !== 94) throw error;
  status = { ok: 0, code: 94 };
}
if (!status.ok) {
  if (status.code !== 94) throw new Error(status.errmsg);
  const initiated = admin.runCommand({
    replSetInitiate: { _id: "rs0", members: [{ _id: 0, host: "mongo:27017" }] },
  });
  if (!initiated.ok) throw new Error(initiated.errmsg);
}
let ready = false;
for (let attempt = 0; attempt < 60; attempt++) {
  if (admin.runCommand({ hello: 1 }).isWritablePrimary) {
    ready = true;
    break;
  }
  sleep(1000);
}
if (!ready) throw new Error("MongoDB replica set did not elect a primary");
print("MongoDB replica set ready");
