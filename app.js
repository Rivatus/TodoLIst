//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://Arpit-admin:Test1234@cluster0.cs5rs.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const ListSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List",ListSchema);

const Items = mongoose.model("item",itemsSchema);

const item1 = new Items({
  name: "Welcome to your todoList!"
});

const item2 = new Items({
  name: "Click + button to add an item to Your todolist."
});

const item3 = new Items({
  name: "<-- Hit this button to delete an item from your todolist."
});

const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {


  Items.find(function(err,items){
    if(err) {
      console.log(err);
    } else {

      if(items.length === 0) {
        Items.insertMany(defaultItems,function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("Sucessfully Updated default items to todolist.");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: items });
      }
    }
  });

});

app.post("/", function(req, res) {

  const listName = req.body.list;

  const itemName = req.body.newItem;
  const newItem = new Items({
    name: itemName
  });

  if(listName === "Today") {
    newItem.save();

    res.redirect("/");
  }  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});


app.post("/delete", function(req,res){
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
      Items.findByIdAndRemove(checkedId, function(err){
        if(err) {
          console.log(err);
        } else {
          console.log("Deleted Sucessfully.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId} } } , function(err,foundList){
        if(err) {
          console.log(err);
        } else {
          res.redirect("/" + listName);
        }
      });
    }


});


app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,result){
    if(err) {
      console.log(err);
    } else {
      if(!result) {
        // Create a new List
        const newList = new List({
          name: customListName,
          items: defaultItems,
        });

        newList.save();
        res.redirect("/" + customListName);
      }
      else {
        // Show an existing list

        res.render("list",{ listTitle:customListName, newListItems: result.items });
      }
    }
  });

  // NewList.find(function(err,itemsInList){
  //   if(err) {
  //     console.log(err);
  //   } else {
  //     res.render("list", {listTitle: customListName , newListItems: itemsInList});
  //   }
  // });
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started Sucessfully");
});
