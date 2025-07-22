var express=require("express");
var mysql2=require("mysql2");
var cloudinary=require("cloudinary").v2;
var fileuploader=require("express-fileupload");


var app=express();
app.use(express.json());
app.use(fileuploader());

app.use(express.urlencoded({ extended: true }));


app.listen(2005,function(){
    console.log("server started at port no :2005")
})
app.use(express.static("public"));
 
cloudinary.config({ 
            cloud_name: 'dfyxjh3ff', 
            api_key: '261964541512685', 
            api_secret: 'PfRVIo1IagO5z_ZnNFI1TQ7DOLc' // Click 'View API Keys' above to copy your API secret
        });


let dbConfig="mysql://avnadmin:AVNS_W2vE-v9tneoAasSqbkY@mysql-3aa89f58-suryanshtomar2022-8d17.c.aivencloud.com:14337/defaultdb?ssl-mode=REQUIRED"
let mySqlVen=mysql2.createPool(dbConfig);
console.log("aiven connected");
/*mySqlVen.connect(function(errKuch){
    if(errKuch==null)
        console.log("aiven connected succuesfully");
    else
    console.log(errKuch.message)
}) */
app.post("/signup",function(req,resp){
    
    let email=req.body.txtEmail;

    let password=req.body.txtPwd;
    let utype=req.body.comboUser;
    mySqlVen.query("insert into users values(?,?,?,current_date,1)",[email,password,utype],function(errKuch){
        if(errKuch){
            console.log(errKuch);
            resp.status(500).send("error inserting data");

        }
        else{
            resp.send("user registered successfully");
        }
    })
    
})
//------ login-----//
app.post("/do-login", function (req, res) {
    let email = req.body.txtEmail2;
    let pwd = req.body.txtPwd2;

    // Check if email & password match and status is 1
    let sqlValid = "SELECT * FROM users WHERE emailid=? AND password=? AND status=1";

    mySqlVen.query(sqlValid, [email, pwd], function (err, allRecords) {
        if (err) {
            console.log(err);
            res.status(500).send("Server error");
        } else if (allRecords.length === 1) {
            res.send(allRecords[0].utype);
        } else {
            // Now check if email and password are correct, but user is blocked
            let sqlBlocked = "SELECT * FROM users WHERE emailid=? AND password=?";
            mySqlVen.query(sqlBlocked, [email, pwd], function (err2, records2) {
                if (err2) {
                    console.log(err2);
                    res.status(500).send("Server error");
                } else if (records2.length === 1) {
                    res.send("Blocked");
                } else {
                    res.send("Wrong emailid / password");
                }
            });
        }
    });
});
//---- for path-------//
app.post("/orgdetails", function(req, res) {
  res.sendFile(__dirname + "/public/org-details.html");
});
//-------- org-details record--------//
app.post("/org-details",async function(req,resp){
    let picurl="";
    if(req.files!=null)
    {
        let fName=req.files.profilePic.name;
        let fullPath=__dirname+"/public/uploads/"+fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult){
            picurl=picUrlResult.url;
            console.log(picurl);
        })
    }
    else picurl="nopic.jpg";

    let emailid=req.body.txtEmail;
    let orgname=req.body.txtOrgName;
    let regnumber= req.body.txtRegNo;
    let address= req.body.txtAddress;
    let city= req.body.txtCity;
    let sports=req.body.txtDeals;
    let website=req.body.txtWebsite;

    let insta=req.body.txtInsta;
    let head=req.body.txtHead;
    let contact=req.body.txtContact;
    let otherinfo=req.body.txtOther;
    
    mySqlVen.query("insert into organizer value(?,?,?,?,?,?,?,?,?,?,?,?)",[emailid,orgname,regnumber,address,city,sports,website,insta,head,contact,picurl,otherinfo],function(errKuch){
        if(errKuch==null){
            resp.send("✅ Record saved successfully!");

        }
        else
        resp.send(errKuch);
    })


})
app.get("/get-one",function(req,resp){
    mySqlVen.query("select * from organizer where emailid=?",[req.query.txtEmail],function(err,allRecords){
        if(allRecords.length==0)
            resp.send("no record found");
        else
            resp.json(allRecords);
    })
})
//------ update---
app.post("/update-user",async function(req,resp)
{
   let picurl="";
    if(req.files!=null) //user wants to Update Profile Pic
    {
        let fName=req.files.profilePic.name;
        let fullPath=__dirname+"/public/uploads/"+fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            picurl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
      });
    }
    else
        picurl=req.body.hdn;

    let emailid=req.body.txtEmail;
    let orgname=req.body.txtOrgName;
    let regnumber= req.body.txtRegNo;
    let address= req.body.txtAddress;
    let city= req.body.txtCity;
    let sports=req.body.txtDeals;
    let website=req.body.txtWebsite;

    let insta=req.body.txtInsta;
    let head=req.body.txtHead;
    let contact=req.body.txtContact;
    let otherinfo=req.body.txtOther;
        
                
       
        mySqlVen.query("update organizer set orgname=?,regnumber=?,address=?,city=?,sports=?,website=?,insta=?,head=?,contact=?,picurl=?,otherinfo=? where emailid=?",[orgname,regnumber,address,city,sports,website,insta,head,contact,picurl,otherinfo,emailid],function(errKuch,result)
        {
                if(errKuch==null)
                {
                    if(result.affectedRows==1)
                        resp.send("Record Saved Successfulllyyy....Badhai");
                    else
                        resp.send("Invalid email Id");
                }
                else 
                    resp.send(errKuch.message)   
        })

})
//-----path for tournaments----//
app.post("/post-tournaments", function(req, res) {
  res.sendFile(__dirname + "/public/post-tournaments.html");
});
//-----publish tournament----//
app.post("/tournament",function(req,resp){
    
    let emailid=req.body.txtEmail;
     
        let event=req.body.txtEventTitle;
        let doe=req.body.Date;
        let toe=req.body.Time;
        let address=req.body.txtAddress;
        let city=req.body.txtCity;
        let sports=req.body.txtSport;
        let minage=req.body.txtMinAge;
        let maxage=req.body.txtMaxAge;
        let lastdate=req.body.RegDeadline;
        let fee=req.body.txtFee;
        let prize=req.body.txtPrize;
        let contact=req.body.txtContact;


    
    mySqlVen.query("insert into tournaments values(null,?,?,?,?,?,?,?,?,?,?,?,?,?)",[emailid,event,doe,toe,address,city,sports,minage,maxage,lastdate,fee,prize,contact],function(errKuch){
        if(errKuch){
            console.log(errKuch);
            resp.status(500).send("error inserting data");

        }
        else{
            resp.send("tournament registered successfully");
        }
    })
    
})
app.post("/do-manage",function(req,res){
    res.sendFile(__dirname+"/public/managers-tournament.html");
})
app.get("/do-fetch-all-users", function(req, resp) {
    let email = req.query.email;
    if (!email) {
        return resp.status(400).send("Email is required");
    }

    mySqlVen.query("SELECT * FROM tournaments WHERE emailid = ?", [email], function(err, allRecords) {
        if (err) resp.status(500).send(err);
        else resp.send(allRecords);
    });
});
//-----delete from manage---
app.get("/delete-one", function(req, resp) {
    let rid = req.query.rid;
    if (!rid) return resp.status(400).send("rid is required");

    mySqlVen.query("DELETE FROM tournaments WHERE rid = ?", [rid], function(err, result) {
        if (err) resp.status(500).send(err);
        else resp.send("✅ Record deleted successfully!");
    });
});
//----path for user-console---//
app.post("/user-console",function(req,res){
    res.sendFile(__dirname+"/public/admin-user-console.html");
})
//--fetch for admin panel---
app.get("/fetch-all-users", function(req, res) {
    mySqlVen.query("SELECT * FROM users", function(err, results) {
        if (err) res.status(500).send("DB error");
        else res.send(results);
    });
});
///---blcok or resume feature---
app.get("/update-user-status", function(req, res) {
    let emailid = req.query.emailid;
    let status = req.query.status;

    if (!emailid || status === undefined) {
        res.status(400).send("Missing email or status");
        return;
    }

    mySqlVen.query("UPDATE users SET status = ? WHERE emailid = ?", [status, emailid], function(err, result) {
        if (err) res.status(500).send("Failed to update status");
        else res.send("✅ Status updated successfully!");
    });
});
app.post("/do-explore",function (req,res){
    res.sendFile(__dirname+"/public/tournament-finder.html");
})
//=====
app.get("/do-fetch-all-tournament", function(req, res) {
    mySqlVen.query("SELECT * FROM tournaments", function(err, results) {
        if (err) res.status(500).send("DB error");
        else res.send(results);
    });
})
//---path for user-player console---//
app.post("/player-console",function(req,res){
    res.sendFile(__dirname+"/public/player-user-console.html")
})

//----user console for player only---

app.get("/fetch-all-users-player", function(req, res) {
 mySqlVen.query("SELECT * FROM users where utype='player'", function(err, results) {
        if (err) res.status(500).send("DB error");
        else res.send(results);
    });
});
  
//---user console for organizer only---
app.get("/fetch-all-users-organizer", function(req, res) {
 mySqlVen.query("SELECT * FROM users where utype='organizer'", function(err, results) {
        if (err) res.status(500).send("DB error");
        else res.send(results);
    });
});
app.post("/organizer-console",function(req,res){
    res.sendFile(__dirname+"/public/organizer-user-console.html")
})
  

//---new tournament finder api call----
app.get("/do-fetch-all-tournaments",function(req,resp)
{
 // console.log(req.query)
        mySqlVen.query("select * from tournaments where city=? and sports=?",[req.query.kuchCity,req.query.kuchGame],function(err,allRecords)
        {
          //console.log(allRecords)
                    resp.send(allRecords);
})
})

//---new call for city wise finder----//
app.get("/do-fetch-all-cities",function(req,resp)
{
        mySqlVen.query("select distinct city from tournaments",function(err,allRecords)
        {
                    resp.send(allRecords);
        })
})

///---update password---//
app.post("/do-setting", function (req, res) {
  console.log("Received request:", req.body);

  let emailid = req.body.txtEmail;
  let oldpassword = req.body.txtPwd;
  let newpassword = req.body.txtNpwd;

  let checkQuery = "SELECT * FROM users WHERE emailid = ? AND password = ? AND utype = 'player'";
  mySqlVen.query(checkQuery, [emailid, oldpassword], function (err, results) {
    if (err) {
      console.error("DB error during checkQuery:", err);
      res.status(500).send("Database error");
    } else if (results.length === 0) {
      console.log("Invalid credentials for email:", emailid);
      res.status(401).send("Incorrect current password or email");
    } else {
      let updateQuery = "UPDATE users SET password = ? WHERE emailid = ? AND utype = 'player'";
      mySqlVen.query(updateQuery, [newpassword, emailid], function (errUpdate, resultUpdate) {
        if (errUpdate) {
          console.error("DB error during updateQuery:", errUpdate);
          res.status(500).send("Error during password update");
        } else {
          console.log("Password updated successfully for:", emailid);
          res.send("Password updated successfully");
        }
      });
    }
  });
});
//path for player-profiel---
app.post("/player-details",function(req,res){
    res.sendFile(__dirname+"/public/player-details.html")
})




//--for for player file--//
//ai part-----///
const{GoogleGenerativeAI}=require("@google/generative-ai");
const genAI=new GoogleGenerativeAI("AIzaSyCSoQ18fNpy7IZQlslV7w6AhTFJcPo-EHI")
const model=genAI.getGenerativeModel({model:"gemini-2.0-flash"});

async function RajeshBansalKaChirag(imgurl)
{
const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string. and also fix dob according to date datatype in mysql"   
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
      console.log(result.response.text())
            
            const cleaned = result.response.text().replace(/```json|```/g, '').trim();
            const jsonData = JSON.parse(cleaned);
            console.log(jsonData);
    return jsonData

}
app.post("/server-profile",async function(req,res){
    let picurl="";
    if(req.files != null)
    {
        let fName=req.files.profilePic.name;
        let fullPath=__dirname+"/public/uploads/"+fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult){
            picurl=picUrlResult.url;
            console.log(picurl);
        })
    }
    else 
        picurl="nopic.jpg";

    let fileName;
    let aadhar="";
    if(req.files !=null){
        fileName=req.files.aadhar.name;
        let locationToSave=__dirname+ "/public/uploads/" + fileName;

        req.files.aadhar.mv(locationToSave);
        try{
            await cloudinary.uploader.upload(locationToSave).then(async function (aadharResult) 
            {
             aadhar=aadharResult.url;
             let jsonData=await RajeshBansalKaChirag(aadharResult.url);
             let emailid= req.body.txtEmail;
             let acardpicurl=aadhar;
             let profilepicurl=picurl;
             let name=jsonData.name;
             let dob=jsonData.dob;
             let gender=jsonData.gender;
             let address=req.body.txtAddress;
             let contact=req.body.txtContact;
             let game=req.body.txtGame;
             let otherinfo=req.body.txtInfo;
             mySqlVen.query("insert into players values(?,?,?,?,?,?,?,?,?,?)",[emailid,acardpicurl,profilepicurl,name,dob,gender,address,contact,game,otherinfo],function(errKuch,allRecords){
                if(errKuch==null)
                    res.send("record saved successfully");
                else
                    res.send(errKuch.message);
             })

            })
        }
        catch(err){
            res.send(err.message)
        }

        
        

    }

})
app.post("/modify-profile", async function (req, res) {
  try {
    let emailid = req.body.txtEmail;
    let address = req.body.txtAddress;
    let contact = req.body.txtContact;
    let game = req.body.txtGame;
    let otherinfo = req.body.txtInfo;

    let profilepicurl = null;
    let acardpicurl = null;
    let name = null;
    let dob = null;
    let gender = null;

    // Upload profile pic if new one is provided
    if (req.files && req.files.profilePic) {
      let profileName = req.files.profilePic.name;
      let profilePath = __dirname + "/public/uploads/" + profileName;
      await req.files.profilePic.mv(profilePath);
      let result = await cloudinary.uploader.upload(profilePath);
      profilepicurl = result.url;
      console.log("✅ Profile Pic Updated:", profilepicurl);
    }

    // Upload Aadhaar and extract new name, dob, gender
    if (req.files && req.files.aadhar) {
      let aadharName = req.files.aadhar.name;
      let aadharPath = __dirname + "/public/uploads/" + aadharName;
      await req.files.aadhar.mv(aadharPath);
      let result = await cloudinary.uploader.upload(aadharPath);
      acardpicurl = result.url;
      console.log("✅ Aadhaar Updated:", acardpicurl);

      // Extract values from OCR
      let jsonData = await RajeshBansalKaChirag(acardpicurl);
      name = jsonData.name;
      dob = jsonData.dob;
      gender = jsonData.gender;
    }

    // Build UPDATE query dynamically
    let query = "UPDATE players SET address=?, contact=?, game=?, otherinfo=?";
    let values = [address, contact, game, otherinfo];

    if (profilepicurl) {
      query += ", profilepicurl=?";
      values.push(profilepicurl);
    }
    if (acardpicurl) {
      query += ", acardpicurl=?";
      values.push(acardpicurl);
    }
    if (name) {
      query += ", name=?";
      values.push(name);
    }
    if (dob) {
      query += ", dob=?";
      values.push(dob);
    }
    if (gender) {
      query += ", gender=?";
      values.push(gender);
    }

    query += " WHERE emailid=?";
    values.push(emailid);

    // Execute DB update
    mySqlVen.query(query, values, function (err, result) {
      if (err) {
        console.error("❌ DB Update Error:", err.message);
        res.status(500).send("Update failed: " + err.message);
      } else {
        res.send("✅ Profile updated successfully!");
      }
    });
  } catch (err) {
    console.error("❌ Error in /modify-profile:", err.message);
    res.status(500).send("Server error: " + err.message);
  }
});
 //get call for player profile--//
 app.get("/get-data",function(req,resp){
    mySqlVen.query("select * from players where emailid=?",[req.query.txtEmail],function(err,allRecords){
        if(allRecords.length==0)
            resp.send("no record found");
        else
            resp.json(allRecords);
    })
})