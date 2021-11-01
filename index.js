import express from 'express';
import cors from 'cors';
import path from 'path';


const app = express();
const router = express.Router();

app.use(cors)

router.get('/',function(req, res){
  res.sendFile(path.join(__dirname + 'index.html'));
});


app.use('/', router);
app.listen(3000);

console.log('Running at Port 3000');