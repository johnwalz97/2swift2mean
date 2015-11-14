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
    members: [{type: Schema.Types.ObjectId, ref: 'Student'}],
	created_at: { type:Date, default: Date.now },
	updated_at: { type:Date, default: Date.now }
})
var StudentSchema = new mongoose.Schema({
    _team: {type: Schema.Types.ObjectId, ref: 'Team'},
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
        res.render('teams', {
            teams: teams
        })
    })
})
app.get("/teams/:id", function(req, res){
    Team.findOne({_id: req.params.id}).populate('members').exec(function(err, team){
        if (err) {
            console.log(err);
        } else {
            console.log("No Errors");
        }
	console.log(team);
        res.render("show_team", {
            team: team
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
        res.render("students", {
            students: students
        })
    })
})
app.get("/students/:id", function(req, res){
    Student.findOne({_id: req.params.id}, function(err, student){
	Team.find({}, function(err, teams){
	Team.findOne({_id: student._team}, function(err, team){
        	if (err) {
            		console.log(err);
        	} else {
            		console.log("No Errors");
        	}
        	res.render("show_student", {
            		student: student,
			teams: teams,
			team: team
        	})
	    })
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
            res.redirect('/students');
        }
    })
})
app.get("/:student_id/clear", function(req, res){
    Student.findOne({_id: req.params.student_id}, function(err, student){
        Team.findOne({_id: student._team}, function(err, team){
          for(var i = 0; i < team.members.length; i++){
		if(team.members[i] == student._team){
			team.members = team.members.splice(i, 1);
		}
	  }
	  student._team = null;
          student.save(function(err){
              team.save(function(err){
                  if (err) {
                      console.log(err);
                  } else {
                      res.redirect('/students/'+req.params.student_id);
                  }
              })
          })         
        })
    })
})
app.get("/:student_id/:id", function(req, res){
    Team.findOne({_id: req.params.id}, function(err, team){
        Student.findOne({_id: req.params.student_id}, function(err, student){
          student._team = team._id;
          team.members.push(student);
          student.save(function(err){
              team.save(function(err){
                  if (err) {
                      console.log(err);
                  } else {
                      res.redirect('/students/'+req.params.student_id);
                  }
              })
          })         
        })
    })
})
app.get("/team/:id/destroy", function(req, res){
    Team.remove({_id: req.params.id}, function(err){
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    })
})
app.get("/student/:id/destroy", function(req, res){
    Student.remove({_id: req.params.id}, function(err){
        if (err) {
            console.log(err);
        }
        res.redirect("/students");
    })
})

// Server, Listen.
app.listen(8000, function(){
    console.log("Listening on port 8000")
});