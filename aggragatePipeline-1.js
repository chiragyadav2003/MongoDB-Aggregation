//** enter name of database */
use("AggregatePipeline")

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

//list the top 2 most favourite fruits among users
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
]
)

console.log("Top 2 favourite fruits = ", Top2FavFruits)