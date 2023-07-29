//jshint esversion:6
const express = require("express");
const bodyParser= require("body-parser");
// const ejs=require("ejs");
const mongoose= require('mongoose');
const _ = require("lodash");


const app = express();
mongoose.set('strictQuery', true);

mongoose.connect("mongodb+srv://admin-ujjwal:Lawjju%4000@cluster01todolistdb.bnhyj2r.mongodb.net/todolistDB",{useNewUrlParser: true},(err)=>{
    if(err){
        console.log(err);
    }

    else{
        console.log("Connect");

    }
});


const itemSchema={
    name:String

};

const Item = mongoose.model("Item",itemSchema);

const item1=new Item({
    name:"Eat food"
});
const item2=new Item({
    name:"Sleep"
});
const item3=new Item({
    name:"Play game"
});

const defaultItems=[item1,item2,item3];


const listSchema= {
    name:String,
    items:[itemSchema]
}

const List = mongoose.model("List",listSchema);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/" , function(req,res){
    Item.find({},(err,foundItems)=>{
        if(foundItems.length===0){
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log(err);
                }
            
                else{
                    console.log("Success insert"); 
            
                }
                res.redirect("/")
            });
        }

        else{
            res.render("list" , {
                listTitle:"Today",newListItems:foundItems
            });
        }

    });
    
});



app.post("/",function(req,res){
   const itemName= req.body.newItem;  
    const listName= req.body.list;
    const item = new Item({
        name:itemName
    })

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
      else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })

      }
    
      });

      app.post("/delete",function(req,res){
         const checkedItemID=req.body.checkbox;
         const listName=req.body.listName;
         if(listName==="Today"){
            Item.deleteOne({_id:checkedItemID},(err)=>{
                if(err){
                    console.log(err);
                }
            
                else{
                    console.log("Success deleted"); 
                    res.redirect("/") 
                }
                
            });

         }

         else{
            List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},function(err,foundList){
                if(!err){
                    res.redirect("/"+listName)
                }
            })
         }
         
         
      })


    app.get("/:customListName",function(req,res){
        const customListName=_.capitalize(req.params.customListName);
        

        List.findOne({name:customListName},function(err,foundList){
            if(!err){
               if(!foundList){
                const list=new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName)
               }
               else{
                res.render("list" , {
                    listTitle:foundList.name,newListItems:foundList.items 
                });
               }
            }
        })

        
        
    })





      app.get("/about" , function(req,res){
        res.render("about")
      })
      
app.listen(3000, function(){
    console.log("server is up at 3000");
})