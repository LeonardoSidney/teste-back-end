var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://administrador:${process.env.DB_SECRET}@${process.env.DB_HOST}.net/myFirstDatabase?retryWrites=true&w=majority`;


function verifyJWT(req, res, next){
  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    
    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}

router.get('/', verifyJWT, function (req, res, next) {
  res.json({message:'API funcionando'});
});

//authentication
router.get('/itens', function(req, res, next) {

  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    var dbo = db.db("amo");
    dbo.collection("produtos").find({}).toArray(function(err, result) {
      if (err) throw err;
      db.close();
      
      res.status(500).json(result);
    });
  });
})

router.post('/pedido', function (req, res, next) {
  const pedido = {
    _id:req.body._id,
    valor:req.body.email
  };
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    var dbo = db.db("amo");
    dbo.collection("usuarios").insertOne(pedido, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
  return res.json({success:'Dados inseridos com sucesso'});
});


module.exports = router;
