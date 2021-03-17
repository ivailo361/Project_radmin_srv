
const ObjectId = require('mongodb').ObjectId;
const connectDB = require('../config/connectDB')

const paramsCooking = {
    email: (name) => {
        return { email: name }
    },
    type: (name) => {
        return { type: name}
    },
    authorId: (authorId) => {
        return { _id: new ObjectId(authorId) }
    },
    title: (name) => {
        const criteria = new RegExp(name, 'ig')
        return { title: { $regex: criteria } }
    }

}

class MongoDB {
    constructor() {
    }

    async getData(collection, param = {}) {
        const { connect, db } = await connectDB()

        let selector = Object.entries(param)
            .reduce((acc, b) => {
                let key = b[0];
                let value = b[1]
                if (!acc[key]) {
                    let obj = Object.assign(acc, paramsCooking[key](value))
                    return obj
                }
            }, {})
        const cursor = db.collection(collection).find(selector).sort({ _id: 1 });
        const results = await cursor.toArray();
        connect.close()
        if (results.length >= 1) {
            return results;
        } else {
            throw new Error('You do not have rights to do that')
        }
    }

    async insertDbFile(collectionName, record) {
        const { connect, db } = await connectDB()

        let obj = { modifiedCount: 0, upsertedCount: 0 }

        for await (let commit of updateCommits(record)) {
            obj.modifiedCount += commit.modifiedCount
            obj.upsertedCount += commit.upsertedCount
        }

        async function* updateCommits(data) {
            for (let value of data) {
                const query = { sapNum: value.sapNum }
                const update = value
                const options = { upsert: true, w: "majority", j: true, wtimeout: 60 };

                yield await db.collection(collectionName).updateOne(query, { $set: update }, options)

            }
        }
        connect.close()
        return obj
    }

    async updateComponentData(compId, data) {
        const { connect, db } = await connectDB()

        const o_id = new ObjectId(compId);
        const updatedData = { $set: data }

        let result = await db.collection('components').updateOne({ _id: o_id }, updatedData)
        connect.close()
        return result
    }

    async updateTypes(newType) {
        const { connect, db } = await connectDB()
        let result = await db.collection('types').findOne({ type: newType })
        if (result === null) {
            let res = await db.collection('types').insertOne({ type: newType })
            connect.close()
            return res
        } else {
            connect.close()
            throw new Error('The chosen type has already existed')
        }
    }

    async deleteType(type) {
        const { connect, db } = await connectDB()
        // const o_id = new ObjectId(id);
        let result = await db.collection('types').deleteOne({ type: type })
        connect.close()
        if (result.deletedCount >= 1) {
            return {deletedCount: 1, deletedModel: type}
        } else {
            throw new Error('Unsuccessful DELETE operation')
        }
    }

    async updateModels(id, newModel) {
        const { connect, db } = await connectDB()
        // const o_id = new ObjectId(id);
        let result = await db.collection('servers').findOne({ sap: id, models: { $elemMatch: { $eq: newModel } } })
        if (result === null) {
            let res = await db.collection('servers').updateOne({ sap: id }, { $push: { models: newModel } })
            connect.close()
            return res
        } else {
            connect.close()
            throw new Error('The model has already exist')
        }
    }

    async deleteModel(id, model) {
        const { connect, db } = await connectDB()
        // const o_id = new ObjectId(id);
        let result = await db.collection('servers').updateOne({ sap: id }, { $pull: { models: model } })
        connect.close()
        if (result.modifiedCount >= 1) {
            return {deletedCount: 1, deletedModel: model}
        } else {
            throw new Error('Unsuccessful DELETE operation')
        }
    }

    async insertUser(collection, userData) {
        const { connect, db } = await connectDB()
        const { email } = userData
        let result = await db.collection(collection).findOne({ email: email })
        if (result === null) {
            let res = await db.collection(collection).insertOne(userData)
            connect.close()
            return res
        } else {
            connect.close()
            throw new Error('The user has already existed')
        }
    }

    async deleteComponents(collection, compList) {
        const { connect, db } = await connectDB()
        const listForDel = compList.map(x => db.collection(collection).deleteOne({ sapNum: x }))
        let result = await Promise.all(listForDel)
        let count = result.reduce((acc, v) => {
            if(v.deletedCount === 1) {
                acc++
                return acc
            }
            return acc
        }, 0)
        connect.close()
        return count
    }
    // async getUser(collectionName, param) {
    //     const db = await connectDB();
    //     return db.collection(collectionName).findOne(param)

    // }

    // async getData(collectionName, courseId) {
    //     const db = await connectDB();
    //     let param = courseId ? { _id: new ObjectId(courseId) } : ""
    //     const cursor = db.collection(collectionName).find(param);
    //     const results = await cursor.toArray();

    //     if (results.length >= 1) {
    //         return results;
    //     } else {
    //         return Promise.reject({ message: `No record found` });
    //     }
    // }

    // async filterCourses(searchInput) {
    //     const db = await connectDB();
    //     const criteria = new RegExp(searchInput, 'ig')
    //     const param = { title: { $regex: criteria } }
    //     const cursor = db.collection('courses').find(param);
    //     return await cursor.toArray();
    // }
    // async addAccessories(cubesDb, accessDb, cubeId, accessoryId) {
    //     const db = await this.main();
    //     const cube_id = new ObjectId(cubeId);

    //     if (!accessoryId) throw new Error("no more accessories")

    //     const accessory_Id = new ObjectId(accessoryId);
    //     const resultCube = await db.collection(cubesDb).updateOne(
    //         { "_id": cube_id },
    //         {
    //             $push: { accessories: accessory_Id }
    //         }
    //     );
    //     const resultAccessories = await db.collection(accessDb).updateOne(
    //         { "_id": accessory_Id },
    //         {
    //             $push: { cubes: cube_id }
    //         }
    //     );

    //     return resultCube
    //     // `Modified records in ${cubesDb}: ${resultCube.modifiedCount} and ${accessDb}: ${resultAccessories.modifiedCount}`
    // }


    // async removeIdFromArray(collectionName, cubeId, accessId) {
    //     const db = await this.main();
    //     const o_cubeId = new ObjectId(cubeId);
    //     const o_accessId = new ObjectId(accessId);
    //     if (collectionName === 'cubesList') {
    //         const result = await db.collection(collectionName)
    //             .updateOne({ "_id": o_cubeId }, { $pull: { accessories: o_accessId } });
    //         return result
    //     }
    //     else if (collectionName === 'accessories') {
    //         const result = await db.collection(collectionName)
    //             .updateOne({ "_id": o_accessId }, { $pull: { cubes: o_cubeId } });
    //         return result
    //     }
    // }

    // async extractCubesFromAccessories(collectionName, cubeId, missing) {
    //     const db = await this.main();
    //     const o_cubeId = new ObjectId(cubeId);
    //     let param;
    //     if (missing) {
    //         param = { cubes: { '$ne': o_cubeId } }
    //     } else {
    //         param = { cubes: { '$eq': o_cubeId } }
    //     }
    //     const cursor = db.collection(collectionName).find(param);
    //     let result = await cursor.toArray();

    //     if (result.length === 0) result = false

    //     return result
    // }






//**************************************************************************** */




//     async deleteCourse(courseId, courseTitle) {
//         const db = await connectDB();
//         const o_id = new ObjectId(courseId);
//         const [delCourse, updateUser] = await Promise.all([
//             db.collection('courses').deleteOne({ "_id": o_id }),
//             db.collection('users').updateMany({ enrolledCourses: courseTitle }, { $pull: { enrolledCourses: courseTitle } })
//         ]);

//         if (delCourse.deletedCount >= 1) {
//             return delCourse
//         } else {
//             return Promise.reject({ message: `There is no such course found in DB` })
//         }
//     }


//     async insertUser(collectionName, record) {
//         const db = await connectDB();
//         const result = await db.collection(collectionName).insertOne(record);
//         // console.log(`New listing created with the following id: ${result.insertedId}`);
//         if (result.insertedCount >= 1) {
//             return result
//         } else {
//             return Promise.reject('The user was not created')
//         }
//     }

//     async updateUser(courseId, newData) {
//         const db = await connectDB();

//         // let result = await db.collection('also').insertOne({ name: "Pepo", url: "http://ivo0.com" })
//         // console.log(result.toJSON())

//         const o_id = new ObjectId(courseId);
//         const { email, password } = newData;
//         const updatedData = { $set: { email, password } }

//         let result = await db.collection('users').updateOne({ _id: o_id }, updatedData)
//         if (result.modifiedCount >= 1) {
//             return result
//         }
//         else {
//             return Promise.reject('the user was not updated probably because of the wrong input data')
//         }
//     }

//     async insertPosts(collectionName, data) {
//         const db = await connectDB();
//         const result = await db.collection(collectionName).insertOne(data);
//         if (result.insertedCount >= 1) {
//             return result
//         } else {
//             return Promise.reject('The new origami was not created')
//         }
//     }


//     async insertCourses(creator, record) {
//         const db = await connectDB();
//         const client = await connectSession()
//         const courseCollection = db.collection('courses');
//         const userCollection = db.collection('users');

//         const session = client.startSession();

//         const transactionOptions = {
//             readPreference: 'primary',
//             readConcern: { level: 'local' },
//             writeConcern: { w: 'majority' }
//         };
//         try {
//             const transactionResults = await session.withTransaction(async () => {
//                 const setCourse = await courseCollection.insertOne(record, { session })

//                 // const isUserEnrolledForCourse = await userCollection.findOne({ enrolledCourses: record.title }, { session })
//                 const [isCourseExists, isUserEnrolled] = await Promise.all([
//                     courseCollection.findOne({ title: record.title }),
//                     userCollection.findOne({ username: creator, enrolledCourses: record.title })
//                 ])
//                 if (isCourseExists || isUserEnrolled) {
//                     await session.abortTransaction();
//                     console.error('The user has already enrolled for the course')
//                     return
//                 }

//                 const addCourseInUser = await userCollection.updateOne({ username: creator }, { $push: { enrolledCourses: record.title } }, { session })
//                 console.log(`the user has enrolled for course: ${record.title}`)
//             }, transactionOptions)

//             if (transactionResults) {
//                 console.log("The course was successfully created.");
//                 return Promise.resolve("The course was successfully created.")
//             } else {
//                 console.log("The course has already exists or the user has already enrolled");
//                 return Promise.reject({ message: "The course has already exists or the user has already enrolled" })
//             }
//         } catch (e) {
//             console.log("The transaction was aborted due to an unexpected error: " + e);
//         } finally {
//             session.endSession(() => { console.log('session was terminated') })
//         }
//     }

//     async enrollUser(record) {
//         const db = await connectDB();
//         const client = await connectSession()
//         const courseCollection = db.collection('courses');
//         const userCollection = db.collection('users');

//         const session = client.startSession();

//         const transactionOptions = {
//             readPreference: 'primary',
//             readConcern: { level: 'local' },
//             writeConcern: { w: 'majority' }
//         };
//         try {
//             const transactionResults = await session.withTransaction(async () => {

//                 // const isUserEnrolledForCourse = await userCollection.findOne({ enrolledCourses: record.title }, { session })
//                 const [isCourseExists, isUserEnrolled] = await Promise.all([
//                     courseCollection.findOne({ title: record.title, usersEnrolled: record.username }),
//                     userCollection.findOne({ username: record.username, enrolledCourses: record.title })
//                 ])
//                 if (isCourseExists || isUserEnrolled) {
//                     await session.abortTransaction();
//                     console.error('The user has already enrolled for the course')
//                     return
//                 }

//                 await courseCollection.updateOne({ title: record.title }, { $push: { usersEnrolled: record.username } }, { session })
//                 await userCollection.updateOne({ username: record.username }, { $push: { enrolledCourses: record.title } }, { session })
//                 console.log(`the user has enrolled for course: ${record.title}`)
//             }, transactionOptions);

//             if (transactionResults) {
//                 console.log("The user was successfully enrolled.");
//                 return Promise.resolve("The user was successfully enrolled.")
//             } else {
//                 console.log("The user has already enrolled for the chosen course");
//                 return Promise.reject({ message: "The user has already enrolled for the chosen course" })
//             }

//         }
//         catch (e) {
//             console.log("The transaction was aborted due to an unexpected error: " + e);
//         } finally {
//             session.endSession(() => { console.log('session was terminated') })
//         }

//     }

    // async updateCourseData(courseId, newData) {
    //     const db = await connectDB();

    //     // let result = await db.collection('also').insertOne({ name: "Pepo", url: "http://ivo0.com" })
    //     // console.log(result.toJSON())

    //     const o_id = new ObjectId(courseId);
    //     const { title, description, imageUrl } = newData;
    //     const updatedData = { $set: { title, description, imageUrl } }

    //     let result = await db.collection('courses').updateOne({ _id: o_id }, updatedData)
    //     if (result.modifiedCount >= 1) {
    //         return result
    //     }
    //     else {
    //         return Promise.reject({ message: 'the course was not updated probably because of the wrong input data' })
    //     }
    // }
}


module.exports = MongoDB;



