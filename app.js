const express    		= require("express");
const mongoose   		= require("mongoose");
const bodyParser 		= require("body-parser");
const methodOverride	= require("method-override")
const expressSanitizer	= require("express-sanitizer")
const app				= express();
const db 		 		= require("./dbconfig.js");

//APP CONFIG

var dbKey = db();
mongoose.connect("mongodb+srv://"+dbKey+"/blogDB?retryWrites=true&w=majority", {
  	useNewUrlParser: true,
  	CreateIndex:true,
	useUnifiedTopology: true,
}).then(() => console.log('Connected to DB!')).catch(error => console.log(error.message));
// mongoose.connect('mongodb://localhost:27017/restful_blog_app', { //add database and connect to mongoose
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('Connected to DB!'))
// .catch(err => console.log(err.message));
// mongoose.set('useFindAndModify', false);

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());//must be below bodyParser
app.use(express.static("public"));// tells express to serve us the contents of the folder
app.use(methodOverride("_method"));

//schema
var blogSchema= new mongoose.Schema({
	title: String,
	image: String,
	body:  String,
	created: {type: Date, default: Date.now}
});
//compile into model var
var Blog = mongoose.model("Blog",blogSchema);

// RESTFUL ROUTES
//ROOT
app.get("/",(req,res)=>{
	res.redirect("/blogs");
});
//RESTFULL INDEX Route
app.get('/blogs',(req,res)=>{
	Blog.find({},(err,blogs)=>{
		if(err){
			console.log(err);
		} else{
			res.render("index",{blogs:blogs});
		}
	});
});
//RESTFUL NEW ROUTE
app.get("/blogs/new",(req,res)=>{
	res.render("new");
});

//RESTFUL CREATE ROUTE
app.post("/blogs",(req,res)=>{	
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, (err,newBlog)=>{
		if (err){
			res.render("new");
		}else{
			res.redirect("/blogs");
		}
	});
});
//RESTFUL SHOW
app.get("/blogs/:id",(req,res)=>{
	Blog.findById(req.params.id,(err,foundBlog)=>{
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show",{blog:foundBlog});
		}
	});
});
//Restful EDIT	
app.get("/blogs/:id/edit",(req,res)=>{
	Blog.findById(req.params.id,(err,foundBlog)=>{
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit",{blog:foundBlog});
		}
	});
});
//RESTFUL UPDATE ROUTE
app.put("/blogs/:id",(req,res)=>{
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,(err,updatedBlog)=>{
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});
//RESTFUL DESTROY ROUTE

app.delete("/blogs/:id",(req,res)=>{
	Blog.findByIdAndRemove(req.params.id,(err)=>{
		if(err){
			res.redirect("/blogs");
			
		}else{
			res.redirect("/blogs");
		}
	})
});
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
