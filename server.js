const express = require('express')
const app = express()
const cors = require('cors')
const {MongoClient, ObjectId} = require('mongodb')
const { Console } = require('console')
const { response } = require('express')
require('dotenv').config()
const PORT = 8000

let db, 
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection 

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log(`Connected to database`)
        db = client.db(dbName)
        collection = db.collection('movies')
    })

app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors())

app.get('/search', async (request, response)=>{
    try{
        let result = await collection.aggregate([
            {
                "$Search" : {
                    "autocompleter" : {  // what kind of search types
                        "query" : `${request.query.query}`,
                        "path" : "title",  
                        "fuzzy" : {  //allows you to misspell and still bring back the collect results
                            "maxEdits" :2, // can make two mistakes - allow to edit
                            "prefixLength": 3 // have to type three char
                        }
                    }
                }
            }
        ]).toArray()
        response.send(result)
    }catch (error) {
        response.status(500).send({message: error.message})
    }
})

app.get("/get/:id", async(request, responce) => {
    try{
        let result = await collection.findOne({
            "_id" : ObjectId(request.params.id)
        })
        response.send(result)
    }catch{
        responce.status(500).send({message: error.message})
    }
})

app.listen(process.env.PORT || PORT, () => {
    console.log(` Server is running. `)
})