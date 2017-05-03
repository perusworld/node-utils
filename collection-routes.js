module.exports = function (collectionModel, router) {
  router.get('/', function (req, res) {
    collectionModel.find({}, (err, results) => {
      if (err) {
        results = [];
      }
      res.json(results)
    })
  });
  router.get('/:id', function (req, res) {
    collectionModel.getById(req.params.id, (err, result) => {
      if (err || null == result) {
        booking = {};
      }
      res.json(result)
    })
  });
  router.post('/get', function (req, res) {
    collectionModel.get(req.body, (err, result) => {
      if (err || null == result) {
        result = {};
      }
      res.json(result)
    })
  });
  router.post('/find', function (req, res) {
    collectionModel.find(req.body, (err, results) => {
      if (err || null == results) {
        results = [];
      }
      res.json(results)
    })
  });
  router.post('/', function (req, res) {
    collectionModel.update(req.body, (err, result) => {
      if (err) {
        result = {};
      }
      res.json(result)
    })
  });
  return router;
}