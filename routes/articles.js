const express=require("express");
const router=express.Router();

// Bring in models
let Article=require('../models/article');
// Bring in models
let User=require('../models/user');

// routes definition
router.get('/add',ensureAuthenticated,(req,res)=>{
    res.render('add_article');
});

// add submit post route for add article
router.post('/add',(req,res)=>{
      
      req.checkBody('title','Title is required !').notEmpty();
     // req.checkBody('author','Author is required !').notEmpty();
      req.checkBody('body','Body is required !').notEmpty();
      
    //   get errors
    let errors=req.validationErrors();

    if(errors){
        res.render('add_article',{
            errors:errors
        });
    }
    else{
        
      const article=new Article();
      article.title=req.body.title;
      article.author=req.user._id;
      article.body=req.body.body;

      article.save((err)=>{
          if(err){
              console.log(err);
          }
          else
          {
              req.flash('success','Article Added');
              res.redirect('/');
          }
      });
    }

});



// get single article
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
    Article.findById(req.params.id,(err,article)=>{
        if(article.author!=req.user._id){
            req.flash('danger','Not authenticated');
            res.redirect('/');
        }
        if(err){
            console.log(err);
        }
        res.render("edit_article",{
            article:article
        });
    });
});

//post request to edit article
router.post('/edit/:id',(req,res)=>{
    let article={};
    article.title=req.body.title;
    article.author=req.body.author;
    article.body=req.body.body;

    let query={_id:req.params.id}

    Article.updateOne(query,article,(err)=>{
        if(err){
            console.log(err);
            return;
        }
        else{
            res.redirect('/');
        }
    });

    
});


router.delete('/:id',(req,res)=>{

    if(!req.user._id){
        res.status(500).send();
    }

    let query={_id:req.params.id}

    //whether they own it or not
    Article.findById(req.params.id,(err,article)=>{
        if(article.author!=req.user._id)
        {
            res.status(500).send();
        }
        else{
            Article.remove(query,(err)=>{
                if(err){
                    console.log(err);
                }
                res.send("success");
            });
        }
    });

    
});

// get single article
router.get('/:id',(req,res)=>{
    Article.findById(req.params.id,(err,article)=>{
        User.findById(article.author,(err,user)=>{
            res.render("article",{
                article:article,
                author:user.name
            });
        });
        
    });
});

// access control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('danger','Please login');
        res.redirect('/users/login');
    }
}

module.exports=router;






