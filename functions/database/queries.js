const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config.firebase);

const db = admin.firestore();


module.exports = {

    add(collectionName, data) {
        return db.collection(collectionName).add(data)
    },

    getCollection(collectionName) {
        return db.collection(collectionName).get()
    },

    getRecordByDocumentId(collectionName, documentId) {
        return db.collection(collectionName).doc(documentId).get()
    },

    getRecordByDocumentIdAndCondition(collectionName, documentId, options) {
        const dbRef = db.collection(collectionName).doc(documentId);
        options.forEach(option => {
            dbRef.where(option.key, option.operator, option.value);
        });
        return dbRef.get();
    },

    getByCondition(collectionName, options) {
        const dbRef = db.collection(collectionName);
        options.forEach(option => {
            dbRef.where(option.key, option.operator, option.value);
        });
        return dbRef.get();

    },

    getByConditionAndLimit(collectionName, options, limit) {
        const dbRef = db.collection(collectionName);
        options.forEach(option => {
            dbRef.where(option.key, option.operator, option.value);
        });
        return dbRef.limit(limit).get();
    },

    updateByDocumentId(collectionName, documentId, data) {
        return db.collection(collectionName).doc(documentId).update(data)
    },

    updateByDocumentIdAndCondition(collectionName, documentId, options, data) {
        const dbRef = db.collection(collectionName).doc(documentId);
        options.forEach(option => {
            dbRef.where(option.key, option.operator, option.value);
        });
        return dbRef.update(data);
    },

    updateByCondition(collectionName, options, data) {
        const dbRef = db.collection(collectionName);
        options.forEach(option => {
            dbRef.where(option.key, option.operator, option.value);
        });
        return dbRef.update(data);
    },

    removeChildByCondition(collectionName, options, data) {
        const dbRef = db.collection(collectionName);
        options.forEach(option => {
            dbRef.where(option.key, option.operator, option.value);
        });
        dbRef.get().then((snapshot) => {
            snapshot.forEach((doc) => {
                dbRef.doc(doc.id).child().remove().catch();
            });
        })
            .catch((err) => {
                console.log('Error getting documents', err);
            });
    },

    deleteByDocumentId(collectionName, documentId) {
        return db.collection(collectionName).doc(documentId).delete();
    },

    deleteByCondition(collectionName, options) {
        const dbRef = db.collection(collectionName);
        options.forEach(option => {
            dbRef.where(option.key, option.operator, option.value);
        });
        return dbRef.delete();
    }

}
