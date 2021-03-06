const MongoClient = require("mongodb").MongoClient;
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var _ = require("lodash");

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var url = "mongodb://admin1:admin1@ds247191.mlab.com:47191/off";
var db;

const dbName = "off";
const collFood = "france";
const collRecipe = "recipes";
const collPrices = "prices";
const collComments = "comments";

var alimentsName = [];
var alimentsWithoutAllergens = [];
var alimentsBio = [];
var idsRecipes = 0;

//---- HTTPS Server avec certificats autosigné
/*var https = require('https');
var fs = require('fs');
var options = {
    key: fs.readFileSync('HTTPS/ProgWeb.rsa.pkey'),
    cert: fs.readFileSync('HTTPS/ProgWeb.crt')
};*/

/*
Initialisation
 */
const mongoClient = new MongoClient(url);
mongoClient.connect(async function (err) {
    db = mongoClient.db(dbName);


    //---- HTTPS Server avec certificats autosigné
    /*https.createServer(options, app).listen(process.env.PORT || 8080, () => {
        console.log("OFF - Server running on port 8080");
    });*/


    app.listen(process.env.PORT || 8080, () => {
        console.log("OFF - Server running on port 8080");
    });
});

async function initAliments() {

    MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            db = mongoClient.db(dbName);
            const collection = db.collection(collFood);
            collection.find({
                $or: [
                    {"nutriments.salt_100g": {$exists: true}},
                    {"nutriments.sugars_100g": {$exists: true}},
                    {"nutriments.fat_100g": {$exists: true}}
                ]
            })
                .toArray(function (err, docs) {
                    alimentsName = _.sortBy(
                        docs
                            .map(doc => {
                                return {
                                    id: doc._id,
                                    name: doc.product_name,
                                    images: doc.images
                                };
                            })
                            .filter(x => {
                                return x != null;
                            }),
                    );
                });
        }
    );

    MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            db = mongoClient.db(dbName);
            const collection = db.collection(collFood);
            collection.find({"allergens_tags": []})
                .toArray(function (err, docs) {
                    alimentsWithoutAllergens = _.sortBy(
                        docs
                            .map(doc => {
                                return {
                                    id: doc._id,
                                    name: doc.product_name,
                                    images: doc.images
                                };
                            })
                            .filter(x => {
                                return x != null;
                            }),
                    );
                });
        }
    );

    MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            db = mongoClient.db(dbName);
            const collection = db.collection(collFood);
            collection.find({"product_name": /.*BIO.*/i})
                .toArray(function (err, docs) {
                    alimentsBio = _.sortBy(
                        docs
                            .map(doc => {
                                return {
                                    id: doc._id,
                                    name: doc.product_name,
                                    images: doc.images
                                };
                            })
                            .filter(x => {
                                return x != null;
                            }),
                    );
                });
        }
    );

    MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            db = mongoClient.db(dbName);
            const collection = db.collection(collRecipe);

            collection.find()
                .toArray(function (err, docs) {
                    idsRecipes = docs.length;
                });
        }
    );
}

initAliments();

/*
PARTIE API
 */


/*
Routes
 */

/*
GET :
 */

app.get("/", function (req, res) {
    let print = "<ul>\n" +
        "  <li>getScore/idProduct/ ⇒ renvoie le score d'un produit : “idProduct”</li>\n" +
        "  <li>getRecipeBio/ ⇒ renvoie les recettes exclusivements composées de produits bio</li>\n" +
        "  <li>getProduct/id/ ⇒ renvoie le json complet d’un produit en fournissant son identifiant dans la bd.</li>\n" +
        "  <li>getAll/ ⇒ renvoie la liste de tous les produits avec leur nom, id et image</li>\n" +
        "  <li>getAlimentsWithoutAllergens/ ⇒ renvoie la liste (nom, id et image) des aliments qui ne contiennent pas d’allergènes</li>\n" +
        "  <li>getAlimentsBio/ ⇒ renvoie la liste (nom, id et image) des aliments bio</li>\n" +
        "  <li>addRecipe/ ⇒ ajoute une recette à la base de données avec son nom et la liste d'ingrédients qui la compose</li>\n" +
        "  <li>addPrice/ ⇒ ajoute un prix à un ingrédient (price, shop, lat, long, date of entry, nameOfProduct)</li>\n" +
        "  <li>addComment/ ⇒ ajoute un commentaire à une recette (pseudoUser, idRecipe, contentComment) : </li>\n" +
        "  <li>getComments/idRecipe/ ⇒ renvoie les commentaires d’une recette d’id : “id”</li>\n" +
        "  <li>getRecipe/id/ ⇒ renvoie la recette d’id : “id”</li>\n" + "</ul>"
    res.send(
        print
    )
});


app.get("/getAll", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    res.send({
        result: alimentsName
    })
});

app.get("/getAlimentsWithoutAllergens", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    res.send({
        result: alimentsWithoutAllergens
    })
});

app.get("/getAlimentsBio", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    res.send({
        result: alimentsBio
    })
});

app.get("/getProduct/:id", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    const id = req.params.id;
    MongoClient.connect(url, function (err) {
        if (err) throw err;
        let query = {_id: id};
        db.collection(collFood).find(query).toArray(function (err, result) {
            if (err) throw err;
            res.send({
                passed: true,
                result: result
            });
        });
    });
});

app.get("/getScore/:idProduct", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    const id = req.params.idProduct;
    let query = {id: id};
    const collection = await db.collection(collFood);
    collection
        .find(query)
        .toArray(function (err, docs) {
            let result = _.sortBy(
                docs
                    .map(doc => {
                        let cmp = 3;
                        let fat =
                            doc.nutriments.fat_100g ||
                            (() => {
                                cmp--;
                                return 0;
                            });
                        let sugar =
                            doc.nutriments.sugars_100g ||
                            (() => {
                                cmp--;
                                return 0;
                            });
                        let salt =
                            doc.nutriments.salt_100g ||
                            (() => {
                                cmp--;
                                return 0;
                            });
                        let score = 0;
                        score =
                            (Number.parseFloat(fat) +
                                Number.parseFloat(sugar) +
                                Number.parseFloat(salt)) /
                            cmp;
                        if (score === 0 || !score) return null;

                        return {
                            id: doc._id,
                            name: doc.product_name,
                            score: score.toFixed(3)
                        };
                    })
                    .filter(x => {
                        return x != null;
                    }),
                ["score", "name"]
            );
            res.send({
                result: result
            });
        });
});


app.get("/getRecipe/:id", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    const id = req.params.id;
    const collection = await db.collection(collRecipe);
    let query = {id: +id};
    collection.find(query).toArray(function (err, result) {
        if (err) throw err;
        res.send({
            result: result
        });
    });
});

app.get("/getComments/:id", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    const id = req.params.id;
    const collection = await db.collection(collComments);
    let query = {idRecipe: +id};
    collection.find(query).toArray(function (err, result) {
        if (err) throw err;
        res.send({
            result: result
        });
    });
});


app.get("/getRecipeBio", async function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    let tabToBeReturned = [];
    const collection = db.collection(collRecipe);
    await collection.find().forEach(function (doc) {
        let recipeIsBio = false;
        let ingredients = doc.ingredients;
        ingredients.forEach(function (item) {
            if (item.name.includes("bio")) {
                recipeIsBio = true;
            }
        });
        if (recipeIsBio) {
            tabToBeReturned.push(doc);
            recipeIsBio = false;
        }
    });
    res.send({
        result: tabToBeReturned,
        length: tabToBeReturned.length
    });
});


app.get("/getAllRecipes", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    MongoClient.connect(url, function (err) {
        if (err) throw err;
        db.collection(collRecipe).find().toArray(function (err, result) {
            if (err) throw err;
            res.send({
                passed: true,
                result: result
            });
        });
    });
});

app.get("/getAllPrices", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    MongoClient.connect(url, function (err) {
        if (err) throw err;
        db.collection(collPrices).find().toArray(function (err, result) {
            if (err) throw err;
            res.send({
                passed: true,
                result: result
            });
        });
    });
});
/*
POST
 */

app.post("/addPrice", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    let price = req.body.price;
    let shop = req.body.shop;
    let lat = req.body.lat;
    let long = req.body.long;
    let date = new Date().getTime();
    let idOfProduct = req.body.idOfProduct;
    let nameOfProduct = req.body.nameOfProduct;
    var obj = {
        price: price,
        shop: shop,
        lat: lat,
        long: long,
        date: date,
        idOfProduct: idOfProduct,
        nameOfProduct: nameOfProduct
    };
    await db.collection(collPrices).insertOne(obj, function (err, res) {
        if (err) throw err;
    });
    res.send({
        passed: true,
        added: obj
    });
});

app.post("/addRecipe", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    idsRecipes++;
    let name = req.body.name;
    let ingredients = req.body.ingredients;
    var obj = {
        id: idsRecipes,
        name: name,
        ingredients: ingredients
    };
    await db.collection(collRecipe).insertOne(obj, function (err, res) {
        if (err) throw err;
    });
    res.send({
        passed: true
    });
});

app.post("/addComment", async function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, token, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

    let pseudoUser = req.body.pseudoUser;
    let idRecipe = req.body.idRecipe;
    let content = req.body.content;

    var obj = {
        pseudoUser: pseudoUser,
        idRecipe: idRecipe,
        content: content
    };
    await db.collection(collComments).insertOne(obj, function (err, res) {
        if (err) throw err;
    });
    res.send({
        passed: true,
        added: obj
    });
});
