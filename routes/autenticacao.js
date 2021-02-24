var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://administrador:${process.env.DB_SECRET}@${process.env.DB_HOST}.net/myFirstDatabase?retryWrites=true&w=majority`;
const jwt = require('jsonwebtoken');

router.get('/', function (req, res, next) {
  res.json({message:'API autenticação funcionando'});
});

router.post('/registro', function (req, res, next) {
  if (req.body.senha !== req.body.confirmacao_senha) {
    res.status(500);
    return res.json({erro:'As senhas são diferentes'});
  }

  const crypto = require("crypto");
  function sha1(data) {
    return crypto.createHash("sha1").update(data, "binary").digest("hex");
  }

  const senha = sha1(req.body.senha);

  const usuario = {
    nome:req.body.nome,
    email:req.body.email,
    senha:senha,
  };
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    var dbo = db.db("amo");
    dbo.collection("usuarios").insertOne(usuario, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
  return res.json({success:'Dados inseridos com sucesso'});
});

//authentication
router.post('/login', (req, res, next) => {
  const crypto = require("crypto");
  function sha1(data) {
    return crypto.createHash("sha1").update(data, "binary").digest("hex");
  }

  const senha = sha1(req.body.senha);

  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    var dbo = db.db("amo");
    var query = {email: req.body.email};
    dbo.collection("usuarios").find(query).toArray(function(err, result) {
      if (err) throw err;
      db.close();
      result = result[0]; //primeiro elemento do array
      if(req.body.email == result.email && senha == result.senha){
        //auth ok
        id = result._id;
        const accessToken = jwt.sign({ id }, process.env.SECRET, {
          expiresIn: 300 // expira in 5 min
        });
        const refreshToken = jwt.sign({ id }, process.env.SECRET, {
          expiresIn: 3600 // expira in 1 hora
        });
        return res.json({ auth: true, acessToken: accessToken, refreshToken: refreshToken});
      }
      res.status(500).json({message: 'Login inválido!'});
    });
  });
})

router.post('/atualizaToken', function(req, res) {
  var token = res.body.refreshToken;
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    
    const accessToken = jwt.sign({ id }, process.env.SECRET, {
      expiresIn: 300 // expira in 5 min
    });
    return res.json({acessToken: accessToken});
  });
});

router.post('/logout', function(req, res) {
  res.json({ auth: false, token: null });
})

module.exports = router;
