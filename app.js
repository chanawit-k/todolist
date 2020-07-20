//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


/*-- connect mongodb --*/
mongoose.connect("mongodb+srv://addmin-boom:kc46111081@cluster0.kmad1.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
/*-- end of  connect mongodb --*/



/*-- items schema --*/
const itemsschema = {
  name: String
};
/*-- items schema --*/


/*-- items model --*/
const itemsModel = mongoose.model("items", itemsschema);
/*-- items model --*/


/*-- create initial item -- */
const item1 = new itemsModel({
  name: "welcome to todolist",
});
const item2 = new itemsModel({
  name: "hit the + button to  add a new item",
});
const item3 = new itemsModel({
  name: "<-- hit this to delete an item",
});
const defaultitem = [item1, item2, item3];
/*-- end of create initial item -- */

/* -- list schema --  */
const listschema = {
  name: String,
  items: [itemsschema]
};
/* -- end of list schema --  */


/* -- list model --  */
const List = mongoose.model("List", listschema);
/* -- end of list model --  */


/*-- get root page --*/
app.get("/", function (req, res) {
  itemsModel.find({}, function (err, result) {
    if (result.length === 0) {
      /* -- insertMany for item -- */
      itemsModel.insertMany(defaultitem, function (err) {
        console.log("success to insert items");
      });
      /* -- end of insertMany for item -- */
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "today", newListItems: result });
    }
  });
});
/*-- end of   get root page --*/


/* -- post root -- */
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listname = req.body.list;

  const item = new itemsModel({
    name: itemName
  });

  if (listname === "today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }, function (err, found) {
      found.items.push(item);
      found.save();
      res.redirect("/" + listname);
    })
  }

});
/* -- end of post root -- */


/* -- delete post method  -- */
app.post("/delete", function (req, res) {
  const temp = req.body.checkbox;
  const listname = req.body.listitem;
  console.log(listname);
  if (listname === "today") {
    itemsModel.findByIdAndDelete(temp, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("success");
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: temp } } },
      function (err, found) {
        if (!err) {
          res.redirect("/" + listname);
        }

      });
  }

});
/* -- delete post method -- */


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  /* -- create new list when user search path --  */
  List.findOne({ name: customListName }, function (err, found) {
    if (!err) {
      if (!found) {
        const list = new List({
          name: customListName,
          items: defaultitem
        });
        list.save();
        res.redirect("/");
      } else {
        res.render("list", { listTitle: customListName, newListItems: found.items })
      }

    } else {
      console.log(err);
    }
  })

  /* -- end of create new list when user search path --  */
});

// app.get("/about", function (req, res) {
//   res.render("about");
// });

/* connect to heroku port  */
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

/* end of connect to heroku port  */
app.listen(port, function () {
  console.log("Server started on port 3000");
});
