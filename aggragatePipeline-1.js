//** enter name of database */
use("AggregatePipeline")

//NOTE: for sorting : -1:top to bottom i.e, highest to lowest and 1:bottom to top i.e, lowest to highest 

// How many users are active ?
const activeUser = db.users.aggregate([
    {
        $match: {
            isActive: true
        }
    },
    {
        $count: 'activeUsers'
    }
])
console.log("Total active user = ", activeUser)

//what is the average age of all users
const averageAge = db.users.aggregate([
    {
        $group: {
            _id: null,
            averageAge: {
                $avg: "$age"
            }
        }
    }
])
console.log("Average age = ", averageAge)

//list the top 2 most favorite fruits among users
const Top2FavFruits = db.users.aggregate([
    {
        $group: {
            _id: "$favoriteFruit",
            totalUser: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            totalUser: -1
        }
    },
    {
        $limit: 2
    }
])
console.log("Top 2 favorite fruits = ", Top2FavFruits)

//which country has the highest number of registered user and sort them highest to lowest
const highestRegisteredUser = db.users.aggregate([
    {
        $group: {
            _id: "$company.location.country",
            totalRegisteredUsers: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            totalRegisteredUsers: -1
        }
    }
])
console.log("Highest number of registered users = ", highestRegisteredUser)

//list all the unique eye color present in the collection
const uniqueEyeColor = db.users.aggregate([
    {
        $group: {
            _id: "$eyeColor",
            users: {
                $sum: 1
            }
        }
    }
])
console.log("Unique eye colors = ", uniqueEyeColor)

//average number of tags per user
let avgTags = db.users.aggregate([
    {
        $unwind: "$tags"
    },
    {
        $group: {
            _id: "$_id",
            totalTagsPerUser: {
                $sum: 1
            }
        }
    },
    {
        $group: {
            _id: null,
            avgTag: {
                $avg: "$totalTagsPerUser"
            }
        }
    }
])
console.log("Average tags = ", avgTags)

//method-2
avgTags = db.users.aggregate([
    {
        $addFields: {
            numberOfTags: {
                $size: { $ifNull: ["$tags", []] }
            }
        }
    },
    {
        $group: {
            _id: null,
            avgTags: {
                $avg: "$numberOfTags"
            }
        }
    }
])
console.log("Average tags = ", avgTags)

//how many users have 'enim' as one of their tags
const enimAsTag = db.users.aggregate([
    {
        $match: {
            tags: "enim"
        }
    },
    {
        $count: 'userWithEnimTag'
    }
])
console.log("enimAsTag = ", enimAsTag)

//what are the names and age of users wo are inactive and have 'velit' as a tag
const filteredUser = db.users.aggregate([
    {
        $match: {
            tags: "velit",
            isActive: false
        }
    },
    {
        $project: {
            name: 1,
            age: 1
        }
    }
])
console.log("custom user = ", filteredUser)

//how many users have phone number starting with '+1 (940)'
//here we will require regex expression 
const phoneNumberUser = db.users.aggregate([
    {
        $match: {
            "company.phone": /^\+1 \(940\)/
        }
    },
    {
        $count: "usersWithRequiredPhoneNumber"
    }
])
console.log("required phone number user = ", phoneNumberUser)

//who has registered most recently
const recentUser = db.users.aggregate([
    {
        $sort: {
            registered: -1
        }
    }
])
console.log("recently registered user = ", recentUser)

//categorize user by their favorite fruit
// The $push operator appends a specified value to an array.
const favFruit = db.users.aggregate([
    {
        $group: {
            _id: "$favoriteFruit",
            // initially 'user' is an array , as soon as we use $push accumulator,it becomes an array and we are pushing name in that array
            user: {
                $push: "$name"
            }
        }
    }
])
console.log("user favorite fruit = ", favFruit)

//how many users have 'ad' as second tag in their list of tags
const reqUserAD = db.users.aggregate([
    {
        $match: {
            "tags.1": "ad"
        }
    },
    {
        $count: 'secondTagAD'
    }
])
console.log("user are = ", reqUserAD)

//users who have both 'enim' and 'id'as their tag
// The $all operator selects the documents where the value of a field is an array that contains all the specified elements.
const adUser = db.users.aggregate([
    {
        $match: {
            "tags": {
                $all: ['enim', 'id']
            }
        }
    },
    {
        $count: 'enimAndIdAsTag'
    }
])
console.log("user are = ", adUser)

//list all the companies listed in USA with their correspond user count
const userUSA = db.users.aggregate([
    {
        $match: {
            "company.location.country": "USA"
        }
    },
    {
        $group: {
            _id: "$company.title",
            userCount: {
                $sum: 1
            }
        }
    }
])
console.log("user are = ", userUSA)

// lookup syntax
// {
//     $lookup:
//       {
//         from: <collection to join> i.e, "foreignCollection",
//         localField: <field from the input documents> i.e, "localField",
//         foreignField: <field from the documents of the "from" collection> i.e,           "foreignCollectionField",
//         as: <output array field> i.e, "output array"
//       }
//  }

//make a left outer join of books with author
const joinData = db.books.aggregate([
    {
        $lookup: {
            from: "authors",
            localField: "author_id",
            foreignField: "_id",
            as: "author_details"
        },

    },
    {
        $addFields: {
            "author_details": {
                $arrayElemAt: ["$author_details", 0]
            }
        }
    }
])
console.log("required result is  = ", joinData)
// here we are making left outer join of books with author
// here for lookup, we are currently looking into "books" as we are making left outer join from "books" collection to "author" collection  so ,
// =>"foreignCollection" i.e, from is "authors"
// =>"localField" i.e, "author_id" as author detail is stored like this in "books" collection
//=>"foreignField" i.e, "_id" as author detail is stored like "_id" in "authors" collection
//=>and we are storing result as "author_details" which is an array of objects