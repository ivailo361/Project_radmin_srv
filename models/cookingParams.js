
const sorting = (arr) => {
    const [field, value] = JSON.parse(arr)
    const sortOrder = {
        ASC: 1,
        DESC: -1
    }
    return {
        $sort: { [field]: sortOrder[value] }
    }
}

const ranging = (arr) => {
    const [start, end] = JSON.parse(arr)
    return {
        $facet: {
            // findResult: [{ $match: { qty: { $eq: 0 } }}],
            paginatedResults: [{ $skip: start }, { $limit: (end - start) + 1 }],
            totalCount: [{ $count: 'count' }]
        }
    }
}

const filtering = (filter) => {
    const obj = JSON.parse(filter)
    let processed = {}

    for (key in obj) {
        if (Array.isArray(obj[key])) {
            processed = { ...processed, [key]: { $in: obj[key] } }
        } else {
            const regex = new RegExp(`${obj[key]}`, 'i')
            processed = { ...processed, [key]: { $regex: regex /*, $options: 'i'*/ } }
            { $expr: { $gt: [ "$spent" , "$budget" ] } }
        }
    }

    return { $match: processed }
}


function cookingParams({ filter, sort, range }) {
    let aggregatedRecord = []

    if (filter !== undefined) {
        aggregatedRecord.push(filtering(filter))
    }

    if (sort !== undefined) {
        aggregatedRecord.push(sorting(sort));
    }

    if (range !== undefined) {
        aggregatedRecord.push(ranging(range))
    } else {
        aggregatedRecord.push(
            {
                $facet: {
                    paginatedResults: [],
                    totalCount: [{ $count: 'count' }]
                }
            }
        )
    }


    return aggregatedRecord

}

module.exports = cookingParams