const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

module.exports = app
const dbpath = path.join(__dirname, 'cricketMatchDetails.db')

let db = null

const start_database_and_server = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('server is running on http://localhost/3000'),
    )
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
start_database_and_server()

const dbmoviename_to_response_moviename = object => {
  return {
    movieName: object.movie_name,
  }
}

const dbplayers_to_response_players = object => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  }
}

const dbaddmovie_to_response_addmovie = object => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  }
}
////////  1  ////////
app.get('/players/', async (request, response) => {
  const movienameQuery = `select * from player_details;`
  const result = await db.all(movienameQuery)
  response.send(
    result.map(eachname => {
      return dbplayers_to_response_players(eachname)
    }),
  )
})

// app.post('/movies/', async (request, response) => {
//   const {directorId, movieName, leadActor} = request.body
//   const movienameQuery = `INSERT INTO movie('director_id','movie_name','lead_actor') values(${directorId},'${movieName}','${leadActor}');`
//   const result = await db.run(movienameQuery)
//   response.send('Movie Successfully Added')
// })
/////  2  /////
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerQuery = `select player_id as playerId,player_name as playerName from player_details where player_id=${playerId};`
  const result = await db.get(playerQuery)
  console.log(result)
  response.send(result)
})
///////  3  ////////
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const movienameQuery = `update player_details 
  set 
  player_name='${playerName}'
  
  where player_id=${playerId}
  ;`

  const result = await db.run(movienameQuery)
  console.log(result)
  response.send('Player Details Updated')
})
///////// 4  /////////
app.get(`/matches/:matchId/`, async (request, response) => {
  const {matchId} = request.params
  const playerQuery = `select match_id as matchId,match,year from match_details where match_id=${matchId};`
  const result = await db.get(playerQuery)
  console.log(result)
  response.send(result)
})
///// 5///////
app.get(`/players/:playerId/matches/`, async (request, response) => {
  const {playerId} = request.params
  const matchQuery = `select match_id as matchId,match,year from player_match_score natural join match_details
  where player_id=${playerId};`
  const result = await db.all(matchQuery)
  response.send(result)
})
//////  6  /////////
app.get(`/matches/:matchId/players`, async (request, response) => {
  const {matchId} = request.params
  const matchQuery = `select 
  player_details.player_id as playerId,
  player_details.player_name as playerName
   from (match_details left join player_match_score on match_details.match_id=player_match_score.match_id) as result_table left join player_details on result_table.player_id=player_details.player_id
  where match_details.match_id=${matchId};`
  const result = await db.all(matchQuery)

  response.send(result)
})
///////   7    //////
app.get(`/players/:playerId/playerScores`, async (request, response) => {
  const {playerId} = request.params
  const matchQuery = `select player_id as playerId,
  player_name as playerName,
  sum(score) as totalScore,
  sum(fours) as totalFours,
  sum(sixes) as totalSixes
  from player_match_score natural join player_details
  where player_id=${playerId};`
  const result = await db.get(matchQuery)
  response.send(result)
})
