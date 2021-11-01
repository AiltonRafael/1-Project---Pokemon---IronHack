import Express from 'express';
import Cors from 'cors'

const app = Express();
app.use(Cors);

app.get('/', (req, res) => {
    res.send('')
})