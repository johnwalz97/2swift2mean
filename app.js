var express = require('express');
var app = express();

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:true}))

app.set('view engine', 'ejs');
app.set('views', (__dirname+'/views'))


//Databse
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/teamsDB');
var Schema = mongoose.Schema;

var TeamSchema = new mongoose.Schema({
	name: {type: String, required: true},
    members: [{type: Schema.Types.ObjectId, ref: 'Comments'}],
	created_at: { type:Date, default: Date.now },
	updated_at: { type:Date, default: Date.now }
})
var StudentSchema = new mongoose.Schema({
    _post: {type: Schema.Types.ObjectId, ref: 'Post'},
	name: {type: String, required: true},
	created_at: { type:Date, default: Date.now },
	updated_at: { type:Date, default: Date.now }
})
mongoose.model('Team', TeamSchema);
mongoose.model('Student', StudentSchema);
var Team = mongoose.model('Team');
var Student = mongoose.model('Student');


//routes
app.get("/", function(req, res){
    Team.find({}).populate('students').exec(    
    function(err, teams){
        if (err) {
            console.log(err);
        } else {
            console.log("No Errors");
        }
        res.render("teams", {
            teams: teams
        })
    })
})
app.get("/teams", function(req, res){
    Team.find({}, function(err, teams){
        if (err) {
            console.log(err);
        } else {
            console.log("No Errors");
        }
        res.render("index", {
            teams: teams
        })
    })
})
app.get("/students", function(req, res){
    Student.find({}, function(err, students){
        if (err) {
            console.log(err);
        } else {
            console.log("No Errors");
        }
        res.render("index", {
            students: students
        })
    })
})


app.post("/teams", function(req, res){
    var team = new Team({
        name: req.body.name
    })
    team.save(function(err){
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    })
})
app.post("/students", function(req, res){
    var student = new Student({
        name: req.body.name
    })
    student.save(function(err){
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    })
})
app.post("/:student_id/:id", function(req, res){
    Team.findOne({_id: req.params.id}, function(err, team){
        Student.findOne({_id: req.params.student_id}, function(err, student){
          student._team = team._id;
          team.students.push(student);
          student.save(function(err){
              team.save(function(err){
                  if (err) {
                      console.log(err);
                  } else {
                      res.redirect('/');
                  }
              })
          })         
        })
    })
})
app.get("/team/:id/destroy", function(){
    Team.remove({_id: require.params.id}, function(err){
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    })
})
app.get("/student/:id/destroy", function(){
    Student.remove({_id: require.params.id}, function(err){
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    })
})

// Server, Listen.
app.listen(8000, function(){
    console.log("Listening on port 8000")
});